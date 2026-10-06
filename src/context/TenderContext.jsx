import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sampleRequirementsData } from '../utils/sampleData';
import { computeSha256 } from '../utils/hashUtils';
import { inspectPdf, autoMatchRequirements, generateTenderPackage } from '../utils/pdfUtils';

const TenderContext = createContext();

const STORAGE_KEY = 'devfest_tender_state_v1';

export const TenderProvider = ({ children }) => {
  const [tender, setTender] = useState(sampleRequirementsData.tender);
  const [requirements, setRequirements] = useState(sampleRequirementsData.requirements);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [matches, setMatches] = useState({}); // { [reqId]: fileId }
  const [expiryDates, setExpiryDates] = useState({}); // { [reqId]: 'YYYY-MM-DD' }
  const [stampConfig, setStampConfig] = useState(null); // { imageBytes, dataUrl, pageOption, position }
  
  // Package Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ progress: 0, message: '' });
  const [generatedPdf, setGeneratedPdf] = useState(null); // { blob, url, totalPages, filename }
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'info') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to get status of a requirement according to Section 5 rules
  const getDocumentStatus = useCallback((req) => {
    const fileId = matches[req.id];
    const isMatched = Boolean(fileId);

    // 1. Mandatory document with no file matched -> Missing (Blocks: YES)
    if (req.mandatory && !isMatched) {
      return {
        code: 'Missing',
        blocks: true,
        badgeColor: 'bg-red-100 text-red-800 border-red-300',
        textColor: 'text-red-700'
      };
    }

    // 2. Optional document with no file matched -> Not provided (Blocks: NO)
    if (!req.mandatory && !isMatched) {
      return {
        code: 'Not provided',
        blocks: false,
        badgeColor: 'bg-slate-100 text-slate-700 border-slate-300',
        textColor: 'text-slate-600'
      };
    }

    // File is matched from here
    if (req.has_expiry) {
      const expDate = expiryDates[req.id];

      // 3. has_expiry = true and file matched, but no expiry date entered -> Expiry date needed (Blocks: YES)
      if (!expDate || expDate.trim() === '') {
        return {
          code: 'Expiry date needed',
          blocks: true,
          badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
          textColor: 'text-amber-700'
        };
      }

      // 4. Expiry date is before submission deadline -> Expired (Blocks: YES)
      const deadline = tender.submission_deadline || '2026-10-20';
      if (expDate < deadline) {
        return {
          code: 'Expired',
          blocks: true,
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
          textColor: 'text-rose-700'
        };
      }
    }

    // 5. File matched, and (if has_expiry) expiry date is on or after submission deadline -> OK (Blocks: NO)
    return {
      code: 'OK',
      blocks: false,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      textColor: 'text-emerald-700'
    };
  }, [matches, expiryDates, tender.submission_deadline]);

  // Compute all blocking issues
  const getBlockingIssues = useCallback(() => {
    const issues = [];

    // Duplicate files check
    const matchedFileIds = Object.values(matches).filter(Boolean);
    const seenHashes = new Map();
    for (const [rId, fId] of Object.entries(matches)) {
      if (!fId) continue;
      const f = uploadedFiles.find(item => item.id === fId);
      if (f && f.hash) {
        if (seenHashes.has(f.hash)) {
          const req = requirements.find(r => r.id === rId);
          issues.push({
            reqId: rId,
            title: req ? req.title_en : rId,
            reason: `Matched file '${f.name}' is a duplicate of '${seenHashes.get(f.hash)}'. Two duplicates cannot be matched to different documents.`
          });
        } else {
          seenHashes.set(f.hash, f.name);
        }
      }
    }

    // Requirements status check
    for (const req of requirements) {
      const status = getDocumentStatus(req);
      if (status.blocks) {
        let reason = '';
        if (status.code === 'Missing') {
          reason = 'Mandatory document missing: no PDF file attached.';
        } else if (status.code === 'Expiry date needed') {
          reason = 'Requires an expiry date to be entered.';
        } else if (status.code === 'Expired') {
          const currentExp = expiryDates[req.id];
          reason = `Document expired (${currentExp}) before submission deadline (${tender.submission_deadline}).`;
        }
        issues.push({
          reqId: req.id,
          title: req.title_en,
          reason
        });
      }
    }

    return issues;
  }, [requirements, matches, expiryDates, tender.submission_deadline, uploadedFiles, getDocumentStatus]);

  // Upload multiple PDF files
  const addFiles = async (fileList) => {
    const newFiles = [];
    let rejectedCount = 0;
    let errorCount = 0;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Check PDF extension or mime type
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        rejectedCount++;
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const inspection = await inspectPdf(arrayBuffer);

        if (inspection.error) {
          showToast(`${file.name}: ${inspection.error}`, 'error');
          errorCount++;
          continue;
        }

        const hash = await computeSha256(arrayBuffer);
        const bytes = new Uint8Array(arrayBuffer);

        newFiles.push({
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          pageCount: inspection.pageCount,
          hash: hash,
          bytes: bytes
        });
      } catch (err) {
        console.error('File read error:', err);
        errorCount++;
      }
    }

    if (rejectedCount > 0) {
      showToast(`Rejected ${rejectedCount} non-PDF file(s). Only PDFs are allowed.`, 'warning');
    }

    if (newFiles.length > 0) {
      setUploadedFiles(prev => {
        const combined = [...prev, ...newFiles];
        // Re-evaluate duplicates
        const hashCounts = {};
        combined.forEach(f => {
          hashCounts[f.hash] = (hashCounts[f.hash] || 0) + 1;
        });
        return combined.map(f => ({
          ...f,
          isDuplicate: hashCounts[f.hash] > 1
        }));
      });
      showToast(`Successfully added ${newFiles.length} PDF file(s).`, 'success');
    }
  };

  // Remove uploaded file
  const removeFile = (fileId) => {
    setUploadedFiles(prev => {
      const remaining = prev.filter(f => f.id !== fileId);
      // Re-evaluate duplicates
      const hashCounts = {};
      remaining.forEach(f => {
        hashCounts[f.hash] = (hashCounts[f.hash] || 0) + 1;
      });
      return remaining.map(f => ({
        ...f,
        isDuplicate: hashCounts[f.hash] > 1
      }));
    });

    // Remove any matches referencing this file
    setMatches(prev => {
      const updated = { ...prev };
      for (const [rId, fId] of Object.entries(updated)) {
        if (fId === fileId) {
          delete updated[rId];
        }
      }
      return updated;
    });
  };

  // Match file to requirement (Task 4.3)
  // One document gets at most one file. One file goes to at most one document.
  const matchFile = (reqId, fileId) => {
    setMatches(prev => {
      const updated = { ...prev };
      // If this file was already matched to another requirement, remove it from that requirement
      if (fileId) {
        for (const [otherReqId, otherFileId] of Object.entries(updated)) {
          if (otherFileId === fileId && otherReqId !== reqId) {
            delete updated[otherReqId];
          }
        }
        updated[reqId] = fileId;
      } else {
        delete updated[reqId];
      }
      return updated;
    });
  };

  // Undo match
  const unmatch = (reqId) => {
    matchFile(reqId, null);
  };

  // Set expiry date for requirement (Task 4.4)
  const setExpiryDate = (reqId, date) => {
    setExpiryDates(prev => ({
      ...prev,
      [reqId]: date
    }));
  };

  // Auto-match action (Bonus Task)
  const triggerAutoMatch = () => {
    const suggested = autoMatchRequirements(requirements, uploadedFiles);
    setMatches(prev => ({
      ...prev,
      ...suggested
    }));
    showToast(`Auto-matched ${Object.keys(suggested).length} documents!`, 'success');
  };

  // Load custom requirements.json file
  const loadRequirementsJson = (jsonData) => {
    try {
      if (!jsonData.tender || !jsonData.requirements) {
        throw new Error('Invalid JSON schema: must have "tender" and "requirements" fields');
      }
      setTender(jsonData.tender);
      setRequirements(jsonData.requirements);
      setMatches({});
      setExpiryDates({});
      showToast('Loaded requirements successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Load sample pack files automatically from public folder
  const loadSamplePack = async () => {
    showToast('Loading sample documents from sample pack...', 'info');
    try {
      // 1. Set tender & requirements
      setTender(sampleRequirementsData.tender);
      setRequirements(sampleRequirementsData.requirements);

      // 2. Fetch sample files
      const sampleFileNames = [
        '01_financial_proposal.pdf',
        '02_technical_proposal.pdf',
        '03_tin_certificate.pdf',
        '04_vat_certificate.pdf',
        'bank_solvency.pdf',
        'experience_cert.pdf',
        'experience_cert (1).pdf',
        'scan_0042.pdf',
        'trade_license_2025.pdf',
        'trade_license_2026.pdf'
      ];

      const loadedList = [];
      for (const fname of sampleFileNames) {
        const res = await fetch(`/sample-pack/documents/${encodeURIComponent(fname)}`);
        if (!res.ok) continue;
        const arrayBuffer = await res.arrayBuffer();
        const inspection = await inspectPdf(arrayBuffer);
        const hash = await computeSha256(arrayBuffer);
        const bytes = new Uint8Array(arrayBuffer);

        loadedList.push({
          id: `file_${fname}`,
          name: fname,
          size: bytes.length,
          pageCount: inspection.pageCount,
          hash: hash,
          bytes: bytes
        });
      }

      // Check duplicates
      const hashCounts = {};
      loadedList.forEach(f => {
        hashCounts[f.hash] = (hashCounts[f.hash] || 0) + 1;
      });
      const processedFiles = loadedList.map(f => ({
        ...f,
        isDuplicate: hashCounts[f.hash] > 1
      }));

      setUploadedFiles(processedFiles);
      setMatches({});
      setExpiryDates({});
      showToast('Sample tender and 10 documents loaded!', 'success');
    } catch (err) {
      console.error('Error loading sample pack:', err);
      showToast('Could not load sample files automatically.', 'error');
    }
  };

  // Export Checklist CSV (Bonus Task)
  const exportChecklistCSV = () => {
    const headers = ['Order', 'Requirement ID', 'Document Title (EN)', 'Document Title (BN)', 'Mandatory', 'Requires Expiry', 'Matched File', 'Pages', 'Expiry Date', 'Status'];
    const sortedReqs = [...requirements].sort((a, b) => a.order - b.order);
    
    const rows = sortedReqs.map(req => {
      const fileId = matches[req.id];
      const file = fileId ? uploadedFiles.find(f => f.id === fileId) : null;
      const status = getDocumentStatus(req);
      const expiry = expiryDates[req.id] || 'N/A';

      return [
        req.order,
        `"${req.id}"`,
        `"${req.title_en}"`,
        `"${req.title_bn}"`,
        req.mandatory ? 'Yes' : 'No',
        req.has_expiry ? 'Yes' : 'No',
        file ? `"${file.name}"` : 'None',
        file ? file.pageCount : 0,
        `"${expiry}"`,
        `"${status.code}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tender.tender_id || 'Tender'}_Checklist.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Checklist exported as CSV!', 'success');
  };

  // Save work to browser localStorage (Bonus Task)
  const saveToStorage = () => {
    try {
      const stateToSave = {
        tender,
        requirements,
        matches,
        expiryDates,
        uploadedFilesMeta: uploadedFiles.map(f => ({
          id: f.id,
          name: f.name,
          size: f.size,
          pageCount: f.pageCount,
          hash: f.hash
        }))
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      showToast('Work saved to browser storage!', 'success');
    } catch (e) {
      showToast('Failed to save to storage.', 'error');
    }
  };

  // Load work from browser localStorage
  const loadFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        showToast('No saved work found.', 'info');
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.tender) setTender(parsed.tender);
      if (parsed.requirements) setRequirements(parsed.requirements);
      if (parsed.matches) setMatches(parsed.matches);
      if (parsed.expiryDates) setExpiryDates(parsed.expiryDates);
      showToast('Loaded work from storage!', 'success');
    } catch (e) {
      showToast('Failed to parse saved work.', 'error');
    }
  };

  // Export Project file (JSON)
  const exportProjectFile = () => {
    const projectData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      tender,
      requirements,
      matches,
      expiryDates,
      filesMeta: uploadedFiles.map(f => ({ id: f.id, name: f.name, size: f.size, pageCount: f.pageCount, hash: f.hash }))
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tender.tender_id || 'Tender'}_Project.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Project file exported!', 'success');
  };

  // Generate Tender Package
  const handleGeneratePackage = async (includeIndex = true) => {
    const blockers = getBlockingIssues();
    if (blockers.length > 0) {
      showToast(`Cannot generate package: ${blockers.length} issue(s) remaining.`, 'error');
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ progress: 5, message: 'Starting package generation...' });

    try {
      const result = await generateTenderPackage({
        tender,
        requirements,
        matches,
        uploadedFiles,
        includeIndexPage: includeIndex,
        stampConfig,
        onProgress: (p) => setGenerationProgress(p)
      });

      const blob = new Blob([result.pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const filename = `${tender.tender_id || 'Tender'}_Package.pdf`;

      setGeneratedPdf({
        blob,
        url,
        totalPages: result.totalPages,
        filename,
        pdfBytes: result.pdfBytes
      });

      showToast(`Package successfully generated (${result.totalPages} pages)!`, 'success');
    } catch (err) {
      console.error('Error generating package:', err);
      showToast(`Generation failed: ${err.message}`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Download Generated Package (Task 4.8)
  const downloadGeneratedPackage = () => {
    if (!generatedPdf || !generatedPdf.url) return;
    const link = document.createElement('a');
    link.href = generatedPdf.url;
    link.download = generatedPdf.filename;
    link.click();
    showToast(`Downloaded ${generatedPdf.filename}!`, 'success');
  };

  return (
    <TenderContext.Provider
      value={{
        tender,
        requirements,
        uploadedFiles,
        matches,
        expiryDates,
        stampConfig,
        setStampConfig,
        isGenerating,
        generationProgress,
        generatedPdf,
        toastMessage,
        showToast,
        getDocumentStatus,
        getBlockingIssues,
        addFiles,
        removeFile,
        matchFile,
        unmatch,
        setExpiryDate,
        triggerAutoMatch,
        loadRequirementsJson,
        loadSamplePack,
        exportChecklistCSV,
        saveToStorage,
        loadFromStorage,
        exportProjectFile,
        handleGeneratePackage,
        downloadGeneratedPackage
      }}
    >
      {children}
    </TenderContext.Provider>
  );
};

export const useTender = () => {
  const context = useContext(TenderContext);
  if (!context) {
    throw new Error('useTender must be used within a TenderProvider');
  }
  return context;
};
