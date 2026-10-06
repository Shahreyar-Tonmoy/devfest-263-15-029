export const en = {
  // Navigation & Branding
  appName: "Tender Document Package Builder",
  appTagline: "Prepare, verify, order and export compliant tender bid packages",
  navBuilder: "Package Builder",
  navPreview: "Package Preview",
  navGuide: "Contest Rules & Guide",
  saveWork: "Save Work",
  loadWork: "Load Work",
  exportProject: "Export Project (.json)",
  importProject: "Import Project",
  projectSaved: "Project saved to browser storage!",
  projectLoaded: "Project restored from browser storage!",
  loadSampleData: "Load Sample Tender",
  resetAll: "Reset",

  // Tender Header
  tenderDetails: "Tender Details",
  tenderId: "Tender ID",
  title: "Tender Title",
  procuringEntity: "Procuring Entity",
  bidder: "Bidder Name",
  submissionDeadline: "Submission Deadline",
  deadlineNotice: "Documents requiring expiry date must be valid on or after",

  // Statuses (Section 5)
  statusOK: "OK",
  statusMissing: "Missing",
  statusExpiryNeeded: "Expiry date needed",
  statusExpired: "Expired",
  statusNotProvided: "Not provided",
  statusDuplicate: "Duplicate File",

  // Status Tooltips & Explanations
  statusDescOK: "File is matched and valid on the submission deadline.",
  statusDescMissing: "Mandatory document is missing! A PDF file must be matched.",
  statusDescExpiryNeeded: "Document has an expiration requirement. Please enter its expiry date.",
  statusDescExpired: "Document expires before the tender submission deadline! Please use a renewed certificate.",
  statusDescNotProvided: "Optional document with no file uploaded. Does not block package generation.",
  statusDescDuplicate: "This file has identical binary content to another uploaded file.",

  // Document Requirements List
  reqListTitle: "Required Documents",
  reqListSubtitle: "Sorted by submission order. Match each document to an uploaded PDF.",
  orderLabel: "Order",
  mandatoryBadge: "Mandatory",
  optionalBadge: "Optional",
  hasExpiryBadge: "Requires Expiry Date",
  selectFilePrompt: "Select a matched PDF file...",
  unmatch: "Unmatch file",
  expiryDateLabel: "Expiry Date (YYYY-MM-DD)",
  expiresOnOrAfter: "Valid on or after deadline",
  expiresBefore: "Expired before deadline",

  // File Upload
  uploadTitle: "Upload Document PDFs",
  uploadSubtitle: "Drag & drop multiple PDF files here, or click to browse",
  uploadHint: "Accepts PDF files only. Total up to 30 files and 50 MB.",
  nonPdfRejected: "Rejected: Only PDF files (.pdf) are allowed. Non-PDF files were skipped.",
  fileCorruptError: "Failed to read PDF: file may be corrupted or password-protected.",
  uploadedFilesCount: "Uploaded Files",
  noFilesUploaded: "No files uploaded yet. Drag and drop PDF documents above.",
  pages: "pages",
  page: "page",
  size: "Size",
  hash: "SHA-256",
  matchedTo: "Matched to",
  notMatched: "Not matched yet",
  removeFile: "Remove file",
  duplicateWarning: "Warning: Identical content detected. Duplicates cannot be assigned to different documents.",

  // Actions & Controls
  autoMatchBtn: "Auto-Match Files",
  autoMatchSuccess: "Auto-matched files based on document name heuristics!",
  exportChecklistBtn: "Export Checklist (CSV)",
  stampSealBtn: "Add Stamp / Seal",
  aiAssistantBtn: "AI Inspection Assistant",

  // Package Generation (Section 4.7 & 6)
  packageSummary: "Package Readiness & Validation",
  packageReady: "All requirements met! You can now generate the final tender package.",
  packageBlocked: "Package generation is currently blocked. Resolve the issues below:",
  blockingIssuesCount: "Blocking issues",
  generatePackageBtn: "Generate Combined PDF Package",
  generatingText: "Building PDF with cover page, index, document pages and footers...",
  downloadPackageBtn: "Download Tender Package",
  viewPreviewBtn: "Preview Generated PDF",
  totalDocumentPages: "Total Document Pages",
  estimatedPackagePages: "Total Package Pages",
  coverPageNote: "Includes English Cover Page (Page 1)",
  indexPageNote: "Includes Table of Contents Index (Page 2)",

  // Stamp / Seal Modal
  sealModalTitle: "Digital Seal & Signature (Bonus Feature)",
  sealModalSubtitle: "Upload a PNG stamp/seal and choose which pages to stamp.",
  uploadPngPrompt: "Upload Seal/Signature PNG",
  sealPageOption: "Apply Seal To:",
  sealAllPages: "All document pages",
  sealCoverOnly: "Cover page only",
  sealFirstLast: "First and last page of each document",
  sealPosition: "Placement Position:",
  bottomRight: "Bottom Right",
  bottomLeft: "Bottom Left",
  topRight: "Top Right",
  removeSeal: "Remove Seal",
  applySeal: "Apply to Package",

  // AI Assistant Modal
  aiModalTitle: "AI Tender Inspector (Gemini Assistant)",
  aiModalSubtitle: "Analyze your tender documents and verify compliance with Rulebook 5.5",
  apiKeyPlaceholder: "Enter your Google Gemini API Key (Optional)",
  apiKeyNote: "Your API key stays entirely in your browser and is never stored on any server.",
  aiAnalyzeBtn: "Run Compliance Analysis",
  aiPromptLabel: "Ask AI Assistant:",
  aiDefaultQuestion: "Verify if all mandatory tender requirements are fulfilled and check for expiry risks.",

  // Guidelines Page
  rulesTitle: "Tender Document Rules & Scoring Checklist",
  rulesIntro: "This guide details all rules for tender preparation in full compliance with the AI DevFest 2026 rulebook.",
  ruleSection5Title: "Section 5: Document Status Evaluation Rules",
  ruleSection6Title: "Section 6: Package Layout & Footer Specifications",
  backToBuilder: "Return to Package Builder"
};
