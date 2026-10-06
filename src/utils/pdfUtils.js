import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

/**
 * Safely parse a PDF buffer to get page count and validate integrity
 * @param {ArrayBuffer} arrayBuffer
 * @returns {Promise<{ pageCount: number, error?: string }>}
 */
export async function inspectPdf(arrayBuffer) {
  try {
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
    if (pdfDoc.isEncrypted) {
      return {
        pageCount: 0,
        error: 'Password protected PDF. Please remove password before uploading.'
      };
    }
    const pageCount = pdfDoc.getPageCount();
    if (pageCount === 0) {
      return { pageCount: 0, error: 'PDF contains no pages.' };
    }
    return { pageCount };
  } catch (err) {
    console.error('PDF inspection error:', err);
    return {
      pageCount: 0,
      error: `Invalid or corrupt PDF: ${err.message || 'Unable to parse structure'}`
    };
  }
}

/**
 * Auto-match helper: suggests file matching based on name similarity
 * @param {Array} requirements
 * @param {Array} uploadedFiles
 * @returns {Object} { [reqId]: fileId }
 */
export function autoMatchRequirements(requirements, uploadedFiles) {
  const matches = {};
  const usedFileIds = new Set();

  // Keyword rules mapping requirement IDs or keywords
  const keywordsMap = [
    { id: 'R01', keywords: ['trade', 'license', 'licence', 'tl', 'ট্রেড'] },
    { id: 'R02', keywords: ['tin', 'tax', 'টিআইএন'] },
    { id: 'R03', keywords: ['vat', 'bin', 'ভ্যাট'] },
    { id: 'R04', keywords: ['solvency', 'bank', 'সচ্ছলতা'] },
    { id: 'R05', keywords: ['experience', 'completion', 'অভিজ্ঞতা'] },
    { id: 'R06', keywords: ['audit', 'financial_statement', 'নিরীক্ষিত'] },
    { id: 'R07', keywords: ['manufacturer', 'authorization', 'maf', 'অনুমোদনপত্র'] },
    { id: 'R08', keywords: ['technical', 'কারিগরি'] },
    { id: 'R09', keywords: ['financial', 'commercial', 'price', 'আর্থিক'] },
    { id: 'R10', keywords: ['declaration', 'signed', 'scan', 'ঘোষণাপত্র'] },
  ];

  // Helper to score match
  for (const rule of keywordsMap) {
    const req = requirements.find(r => r.id === rule.id);
    if (!req) continue;

    let bestFile = null;
    let bestScore = 0;

    for (const file of uploadedFiles) {
      if (usedFileIds.has(file.id)) continue;

      const lowerName = file.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
      let score = 0;

      for (const kw of rule.keywords) {
        if (lowerName.includes(kw)) {
          score += 2;
        }
      }

      // Bonus for Trade License: prefer 2026 over 2025 if both exist
      if (rule.id === 'R01') {
        if (lowerName.includes('2026') || lowerName.includes('2027')) score += 3;
        if (lowerName.includes('2024') || lowerName.includes('2025')) score += 1;
      }

      // Avoid matching financial_proposal to technical proposal
      if (rule.id === 'R08' && lowerName.includes('financial')) score = 0;
      if (rule.id === 'R09' && lowerName.includes('technical')) score = 0;

      if (score > bestScore) {
        bestScore = score;
        bestFile = file;
      }
    }

    if (bestFile && bestScore > 0) {
      matches[req.id] = bestFile.id;
      usedFileIds.add(bestFile.id);
    }
  }

  return matches;
}

/**
 * Generate Complete Tender Package PDF
 * Follows Section 6 and Section 7 specifications
 */
export async function generateTenderPackage({
  tender,
  requirements,
  matches,
  uploadedFiles,
  includeIndexPage = true,
  stampConfig = null, // { imageBytes, pageOption: 'all'|'cover'|'last', position: 'bottom-right' }
  onProgress = () => {}
}) {
  onProgress({ stage: 'initializing', progress: 5, message: 'Initializing document package...' });

  const finalDoc = await PDFDocument.create();
  const fontRegular = await finalDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await finalDoc.embedFont(StandardFonts.HelveticaBold);

  // Prepare ordered list of included documents
  const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
  const includedDocs = [];

  for (const req of sortedReqs) {
    const fileId = matches[req.id];
    if (fileId) {
      const file = uploadedFiles.find(f => f.id === fileId);
      if (file) {
        includedDocs.push({
          req,
          file,
        });
      }
    }
  }

  // Pre-calculate document page counts and starting pages
  // Page 1 = Cover page
  // Page 2 = Index page (if included)
  let currentPageTracker = 1 + (includeIndexPage ? 1 : 0);
  for (const docItem of includedDocs) {
    docItem.startPage = currentPageTracker + 1;
    docItem.pageCount = docItem.file.pageCount || 1;
    currentPageTracker += docItem.pageCount;
  }
  const totalPackagePages = currentPageTracker;

  onProgress({ stage: 'cover', progress: 15, message: 'Creating English Cover Page...' });

  // -------------------------------------------------------------
  // 1. COVER PAGE (Page 1 - Section 6.1: in English)
  // -------------------------------------------------------------
  const coverPage = finalDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = coverPage.getSize();

  // Modern corporate header styling
  coverPage.drawRectangle({
    x: 0,
    y: height - 120,
    width: width,
    height: 120,
    color: rgb(0.08, 0.22, 0.45) // Deep navy
  });

  coverPage.drawText('TENDER SUBMISSION PACKAGE', {
    x: 48,
    y: height - 55,
    size: 20,
    font: fontBold,
    color: rgb(1, 1, 1)
  });

  coverPage.drawText('Official Bid Document Dossier', {
    x: 48,
    y: height - 80,
    size: 11,
    font: fontRegular,
    color: rgb(0.78, 0.88, 1)
  });

  // Tender Metadata Box
  coverPage.drawRectangle({
    x: 48,
    y: height - 300,
    width: width - 96,
    height: 160,
    color: rgb(0.96, 0.98, 1.0),
    borderColor: rgb(0.75, 0.85, 0.95),
    borderWidth: 1
  });

  const creationDate = new Date().toISOString().split('T')[0];

  const metaFields = [
    { label: 'Tender ID:', value: tender.tender_id || 'N/A' },
    { label: 'Tender Title:', value: tender.title || 'N/A' },
    { label: 'Procuring Entity:', value: tender.procuring_entity || 'N/A' },
    { label: 'Bidder Name:', value: tender.bidder || 'N/A' },
    { label: 'Submission Deadline:', value: tender.submission_deadline || 'N/A' },
    { label: 'Package Generated On:', value: creationDate }
  ];

  let metaY = height - 160;
  for (const item of metaFields) {
    coverPage.drawText(item.label, {
      x: 64,
      y: metaY,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.25, 0.35)
    });
    // Truncate long value if needed
    const valStr = item.value.length > 55 ? item.value.substring(0, 52) + '...' : item.value;
    coverPage.drawText(valStr, {
      x: 215,
      y: metaY,
      size: 10,
      font: fontRegular,
      color: rgb(0.1, 0.15, 0.2)
    });
    metaY -= 21;
  }

  // Section Heading: Included Documents List
  coverPage.drawText('LIST OF INCLUDED DOCUMENTS', {
    x: 48,
    y: height - 325,
    size: 12,
    font: fontBold,
    color: rgb(0.1, 0.2, 0.4)
  });

  coverPage.drawLine({
    start: { x: 48, y: height - 332 },
    end: { x: width - 48, y: height - 332 },
    thickness: 1,
    color: rgb(0.8, 0.85, 0.9)
  });

  // Table header
  coverPage.drawText('Order', { x: 52, y: height - 350, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('Document Name', { x: 95, y: height - 350, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('Pages', { x: 380, y: height - 350, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });
  coverPage.drawText('Start Page', { x: 440, y: height - 350, size: 9, font: fontBold, color: rgb(0.3, 0.35, 0.4) });

  let listY = height - 372;
  for (const docItem of includedDocs) {
    if (listY < 60) break; // page boundary safety

    // Alternating row background
    coverPage.drawRectangle({
      x: 48,
      y: listY - 5,
      width: width - 96,
      height: 20,
      color: rgb(0.98, 0.98, 0.99)
    });

    coverPage.drawText(`${docItem.req.order}`, {
      x: 60,
      y: listY,
      size: 9,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2)
    });

    const docTitle = docItem.req.title_en || docItem.req.title_bn;
    const cleanTitle = docTitle.length > 42 ? docTitle.substring(0, 39) + '...' : docTitle;
    coverPage.drawText(cleanTitle, {
      x: 95,
      y: listY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.15, 0.25)
    });

    coverPage.drawText(`${docItem.pageCount}`, {
      x: 390,
      y: listY,
      size: 9,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3)
    });

    coverPage.drawText(`Page ${docItem.startPage}`, {
      x: 440,
      y: listY,
      size: 9,
      font: fontBold,
      color: rgb(0.1, 0.4, 0.7)
    });

    listY -= 24;
  }

  // -------------------------------------------------------------
  // 2. BONUS: INDEX PAGE (Table of Contents)
  // -------------------------------------------------------------
  if (includeIndexPage) {
    onProgress({ stage: 'index', progress: 25, message: 'Creating Document Index & Table of Contents...' });

    const indexPage = finalDoc.addPage([595.28, 841.89]);
    
    // Index Header
    indexPage.drawRectangle({
      x: 48,
      y: height - 100,
      width: width - 96,
      height: 50,
      color: rgb(0.93, 0.96, 1.0),
      borderColor: rgb(0.7, 0.82, 0.95),
      borderWidth: 1
    });

    indexPage.drawText('DOCUMENT INDEX & VERIFICATION SUMMARY', {
      x: 64,
      y: height - 78,
      size: 14,
      font: fontBold,
      color: rgb(0.08, 0.22, 0.45)
    });

    indexPage.drawText('Complete breakdown of all submitted attachments and starting locations', {
      x: 64,
      y: height - 92,
      size: 9,
      font: fontRegular,
      color: rgb(0.35, 0.4, 0.5)
    });

    // Table Header
    indexPage.drawRectangle({
      x: 48,
      y: height - 135,
      width: width - 96,
      height: 24,
      color: rgb(0.15, 0.28, 0.5)
    });

    indexPage.drawText('No.', { x: 56, y: height - 126, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Requirement / Description', { x: 85, y: height - 126, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Attached File', { x: 260, y: height - 126, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Pages', { x: 420, y: height - 126, size: 9, font: fontBold, color: rgb(1, 1, 1) });
    indexPage.drawText('Start Page', { x: 475, y: height - 126, size: 9, font: fontBold, color: rgb(1, 1, 1) });

    let idxY = height - 160;
    let rowIdx = 0;
    for (const docItem of includedDocs) {
      const isEven = rowIdx % 2 === 0;
      indexPage.drawRectangle({
        x: 48,
        y: idxY - 6,
        width: width - 96,
        height: 24,
        color: isEven ? rgb(0.97, 0.98, 1.0) : rgb(1, 1, 1)
      });

      indexPage.drawText(`${docItem.req.order}`, { x: 60, y: idxY, size: 9, font: fontRegular, color: rgb(0.2, 0.2, 0.2) });
      
      const docTitle = docItem.req.title_en;
      indexPage.drawText(docTitle.length > 28 ? docTitle.substring(0, 25) + '...' : docTitle, {
        x: 85,
        y: idxY,
        size: 9,
        font: fontBold,
        color: rgb(0.1, 0.15, 0.25)
      });

      const fileName = docItem.file.name;
      indexPage.drawText(fileName.length > 26 ? fileName.substring(0, 23) + '...' : fileName, {
        x: 260,
        y: idxY,
        size: 8.5,
        font: fontRegular,
        color: rgb(0.3, 0.35, 0.4)
      });

      indexPage.drawText(`${docItem.pageCount}`, {
        x: 430,
        y: idxY,
        size: 9,
        font: fontRegular,
        color: rgb(0.2, 0.2, 0.2)
      });

      indexPage.drawText(`Page ${docItem.startPage}`, {
        x: 480,
        y: idxY,
        size: 9,
        font: fontBold,
        color: rgb(0.1, 0.45, 0.75)
      });

      idxY -= 26;
      rowIdx++;
    }

    // Omitted optional documents note
    const omittedDocs = sortedReqs.filter(r => !matches[r.id]);
    if (omittedDocs.length > 0 && idxY > 80) {
      idxY -= 15;
      indexPage.drawText('Optional Documents Not Enclosed:', {
        x: 48,
        y: idxY,
        size: 9,
        font: fontBold,
        color: rgb(0.4, 0.45, 0.5)
      });
      idxY -= 15;
      for (const od of omittedDocs) {
        indexPage.drawText(`• ${od.title_en} (${od.id}) - Status: Not provided (Optional)`, {
          x: 60,
          y: idxY,
          size: 8.5,
          font: fontRegular,
          color: rgb(0.5, 0.55, 0.6)
        });
        idxY -= 14;
      }
    }
  }

  // -------------------------------------------------------------
  // 3. COPY DOCUMENT PAGES (Section 6.2)
  // -------------------------------------------------------------
  let embeddedStampImage = null;
  if (stampConfig && stampConfig.imageBytes) {
    try {
      embeddedStampImage = await finalDoc.embedPng(stampConfig.imageBytes);
    } catch (err) {
      console.warn('Failed to embed PNG stamp image:', err);
    }
  }

  const documentStartingPageIndices = [];

  for (let d = 0; d < includedDocs.length; d++) {
    const docItem = includedDocs[d];
    const progressPercent = 30 + Math.round(((d + 1) / includedDocs.length) * 50);
    onProgress({
      stage: 'merging',
      progress: progressPercent,
      message: `Merging ${docItem.req.title_en} (${d + 1}/${includedDocs.length})...`
    });

    const srcPdfDoc = await PDFDocument.load(docItem.file.bytes, { ignoreEncryption: true });
    const pageIndices = srcPdfDoc.getPageIndices();
    const copiedPages = await finalDoc.copyPages(srcPdfDoc, pageIndices);

    // Record index in finalDoc
    documentStartingPageIndices.push(finalDoc.getPageCount());

    for (let pIdx = 0; pIdx < copiedPages.length; pIdx++) {
      const page = copiedPages[pIdx];
      finalDoc.addPage(page);
    }
  }

  // -------------------------------------------------------------
  // 4. EMBED STAMP / SEAL (Bonus Feature)
  // -------------------------------------------------------------
  if (embeddedStampImage) {
    onProgress({ stage: 'stamping', progress: 85, message: 'Applying digital seal / signature stamp...' });
    const allPages = finalDoc.getPages();
    const stampDims = embeddedStampImage.scale(0.25); // reasonable seal size (around 70-80px)

    const shouldStampPage = (pIdx) => {
      if (stampConfig.pageOption === 'cover') return pIdx === 0;
      if (stampConfig.pageOption === 'all') return true;
      if (stampConfig.pageOption === 'last') return pIdx === allPages.length - 1;
      // 'first-and-last' of each doc
      if (stampConfig.pageOption === 'docs') return pIdx > (includeIndexPage ? 1 : 0);
      return false;
    };

    for (let pIdx = 0; pIdx < allPages.length; pIdx++) {
      if (shouldStampPage(pIdx)) {
        const page = allPages[pIdx];
        const pSize = page.getSize();
        
        let xPos = pSize.width - stampDims.width - 45;
        let yPos = 45; // default bottom-right above footer

        if (stampConfig.position === 'bottom-left') {
          xPos = 45;
          yPos = 45;
        } else if (stampConfig.position === 'top-right') {
          xPos = pSize.width - stampDims.width - 45;
          yPos = pSize.height - stampDims.height - 45;
        }

        page.drawImage(embeddedStampImage, {
          x: xPos,
          y: yPos,
          width: stampDims.width,
          height: stampDims.height,
          opacity: 0.92
        });
      }
    }
  }

  // -------------------------------------------------------------
  // 5. DRAW FOOTERS ON EVERY PAGE (Section 6.3 & 6.4)
  // <tender_id> | Page X of Y
  // -------------------------------------------------------------
  onProgress({ stage: 'footers', progress: 92, message: 'Adding standardized package footers...' });

  const finalPages = finalDoc.getPages();
  const totalPages = finalPages.length;
  const tenderId = tender.tender_id || 'Tender';

  for (let i = 0; i < totalPages; i++) {
    const page = finalPages[i];
    const { width: pWidth } = page.getSize();

    // Protective subtle background bar for footer to ensure readability without covering content
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pWidth,
      height: 28,
      color: rgb(1, 1, 1),
      opacity: 0.95
    });

    // Subtle divider line
    page.drawLine({
      start: { x: 36, y: 28 },
      end: { x: pWidth - 36, y: 28 },
      thickness: 0.5,
      color: rgb(0.82, 0.85, 0.9)
    });

    const footerText = `${tenderId} | Page ${i + 1} of ${totalPages}`;
    const textWidth = fontRegular.widthOfTextAtSize(footerText, 9);
    const centerX = (pWidth - textWidth) / 2;

    page.drawText(footerText, {
      x: centerX,
      y: 10,
      size: 9,
      font: fontRegular,
      color: rgb(0.22, 0.28, 0.35)
    });
  }

  onProgress({ stage: 'saving', progress: 98, message: 'Saving and finalizing package...' });

  const pdfBytes = await finalDoc.save();

  onProgress({ stage: 'done', progress: 100, message: 'Package completed successfully!' });

  return {
    pdfBytes,
    totalPages,
    tenderId
  };
}
