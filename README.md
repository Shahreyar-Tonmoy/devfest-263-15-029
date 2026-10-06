# Tender Document Package Builder
> **AI DevFest 2026 — AI Vibe-Coding Contest (Solo)**  
> An autonomous, frontend-only web application to verify, order, audit, and compile government-compliant tender bid document packages.

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-sky.svg)](https://tailwindcss.com/)
[![React Router](https://img.shields.io/badge/React_Router-v6-red.svg)](https://reactrouter.com/)
[![Google Gemini API](https://img.shields.io/badge/Google_Gemini-API_Integrated-8e44ad.svg)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📌 Submission & Candidate Metadata

| Property | Value |
| :--- | :--- |
| **Contestant Name** | **Md Mubtashim Shahreyar Tonmoy** |
| **Registration Number** | **`263-15-029`** |
| **Repository Link** | [https://github.com/Shahreyar-Tonmoy/devfest-263-15-029](https://github.com/Shahreyar-Tonmoy/devfest-263-15-029) |
| **Public Live HTTPS Deployment** | [https://tender-document-builder.netlify.app/](https://tender-document-builder.netlify.app/) |
| **Final Eligible Commit ID** | `e994fb3` (or latest HEAD) |
| **License** | MIT License |

---

## 🤖 Google Gemini API & AI Agent Integration

This application features an interactive **Tender Compliance AI Agent (`TenderBot AI`)** powered directly by the **Google Gemini API** (`gemini-1.5-flash`), strictly adhering to the **Official Rulebook Section 5.5 and Section 5.8**.

### Key Integration Highlights
1. **User-Provided API Key (Rulebook Section 5.5 Compliant):**
   - The user inputs their own Google Gemini API key directly through the chat interface (click the 🔑 Key icon on the TenderBot header).
   - **Zero Secrets in Code:** No API keys, passwords, or tokens are ever embedded in the codebase, git commits, or remote repositories (strict adherence to Section 5.8).
   - The key is saved exclusively in the user's browser `localStorage` (`user_gemini_api_key`) and sent over client-side HTTPS directly to Google's official Gemini endpoint.

2. **Standalone Operation Without AI (Rulebook Section 5.5 Compliant):**
   - The entire package generation workflow (upload, matching, validation, cover page, footers, merge, PDF download) functions 100% offline with zero dependencies on external AI services.
   - If no Gemini API key is provided, TenderBot automatically falls back to its built-in procurement rule engine, ensuring all features remain fully operational.

3. **Autonomous Agent Capabilities:**
   - **Real-Time Compliance Audit:** Evaluates document readiness, certificate expiry risks, and missing mandatory papers.
   - **Interactive In-Chat CTAs:** Embeds executable action buttons directly inside chat responses (`⚡ Run Auto-Match`, `📊 Export Checklist CSV`, `📦 Preload Sample Pack`).
   - **Bilingual Procurement Intelligence:** Understands and generates responses fluently in both English and Bangla.

---

## 🚀 How to Run the App Locally

### Prerequisites
- Node.js (version 18 or higher)
- npm (version 9 or higher)

### Setup & Local Execution
```bash
# 1. Clone the repository
git clone https://github.com/Shahreyar-Tonmoy/devfest-263-15-029.git
cd devfest-263-15-029

# 2. Install dependencies
npm install

# 3. Launch local development server
npm run dev

# 4. Or build and test production bundle
npm run build
npm run preview
```
Open your browser at `http://localhost:3000` (or `http://localhost:4173` for preview).

---

## 📋 Problem Tasks Implementation (Main Tasks 4.1 – 4.9)

### 1. Requirements & Tender Overview (Task 4.1)
- Parses `requirements.json` displaying tender details: Tender ID, Title, Procuring Entity, Bidder Name, and Submission Deadline.
- Displays all required documents in strictly sorted sequence according to `order`.
- Provides an instant 1-click **"Load Sample Tender"** button to load the official contest test pack.

### 2. Multi-File Upload & Inspection (Task 4.2)
- Multi-file drag-and-drop zone and file picker accepting multiple PDFs simultaneously.
- Accurately counts pages for each PDF file using `pdf-lib`.
- Safely validates file types, rejecting non-PDF files with clear warning alerts.
- Allows deleting and removing any uploaded file with one click.

### 3. Strict 1-to-1 Document Matching (Task 4.3)
- Matches each uploaded PDF to exactly one tender requirement.
- Enforces strict 1-to-1 matching: one document gets at most one file; one file goes to at most one document.
- Users can change or undo matches at any time.
- Features a smart **Auto-Match** algorithm matching files based on naming patterns.

### 4. Expiry Date Management (Task 4.4)
- Provides date input controls for documents marked with `has_expiry: true`.
- Evaluates certificate expiration in real time against the tender `submission_deadline`.

### 5. Section 5 Document Status Evaluation Engine (Task 4.5)

| Status | Condition | Blocks Package? |
| :--- | :--- | :---: |
| **`Missing`** (Red) | Mandatory document (`mandatory: true`), no file matched | **YES** |
| **`Expiry date needed`** (Amber) | `has_expiry: true` and file matched, but no date entered | **YES** |
| **`Expired`** (Rose) | Expiry date is strictly before the submission deadline | **YES** |
| **`Not provided`** (Slate) | Optional document (`mandatory: false`), no file matched | **NO** |
| **`OK`** (Emerald) | File matched, and expiry date is on or after the deadline | **NO** |

*Rule Note: Certificates expiring on the exact same day as the submission deadline are evaluated as OK.*

### 6. SHA-256 Duplicate Detection (Task 4.6)
- Calculates cryptographic SHA-256 binary hash for all uploaded files.
- Automatically flags duplicates with a visible badge (e.g., `experience_cert.pdf` vs `experience_cert (1).pdf`).
- Disallows duplicates from being assigned to multiple distinct documents.

### 7. Package Compilation & Blocker Enforcement (Task 4.7)
- The **"Generate Combined PDF Package"** button remains disabled while any blocking issue exists.
- Live checklist displays all blocking reasons with actionable advice.

### 8. Final Download (Task 4.8)
- Generates and downloads the final package named `<tender_id>_Package.pdf` (e.g. `T-2026-0417_Package.pdf`).

### 9. Bilingual Language Switch (Task 4.9 & Rulebook 5.6)
- Instant toggle between **English** and **বাংলা (Bangla)** across the entire app.
- Dynamically renders document titles from `title_bn` or `title_en` with persistent language preference.

---

## 📄 Section 6 Package Rules Compliance

- **Page 1: Official English Cover Page (Rule 6.1):**
  Displays Tender ID, tender title, procuring entity, bidder name, submission deadline, package generation date, and ordered list of included documents.
- **Ordered Sequence & Page Preservation (Rule 6.2):**
  Merges attachments in ascending requirement order, preserving all original pages, cleanly skipping unprovided optional documents.
- **Standardized Margined Footers (Rules 6.3 & 6.4):**
  Every page (including cover and index) has the exact footer `<tender_id> | Page X of Y` rendered with a protective margin bar ensuring it never obscures document text.

---

## 🎁 Bonus Tasks Implementation (Section 7)

1. **Table of Contents / Index Page:**  
   Page 2 generates an index breakdown indicating the exact starting page number of each attached document.
2. **Digital Seal & Signature Stamp Overlay:**  
   Upload official PNG stamp/logo and apply it across all pages, cover only, or document pages with selectable positioning.
3. **Interactive AI Agent Chatbot:**  
   Live chat interface (`TenderBot AI`) with structured response cards, actionable chips, and user Google Gemini API key support.
4. **Checklist Export as CSV/Excel:**  
   One-click download of the complete compliance checklist (Order, Document, File, Pages, Expiry, Status).
5. **Project State Persistence:**  
   Save and reload work via browser `localStorage` or export/import `.json` project files.
6. **Robust File Safety:**  
   Protects against corrupted or password-protected PDFs without crashing.
7. **Fully Responsive Design:**  
   Designed and verified for all screen sizes (mobile, tablet, desktop) with modern floating glassmorphic navbar and mobile dock.

---

## 📂 Repository Contents

```
devfest-263-15-029/
├── output/
│   └── T-2026-0417_Package.pdf    # Final compiled package resolving sample pack issues
├── screenshots/
│   ├── document_statuses.png      # Document status evaluation dashboard
│   ├── desktop_new_navbar.png     # Full desktop interface with modern navbar
│   └── mobile_view_navbar.png     # Mobile responsive viewport verification
├── public/
│   └── sample-pack/               # Preloaded contest test assets
├── src/
│   ├── components/
│   │   ├── AiAgentChat.jsx        # Google Gemini AI Agent Chatbot
│   │   ├── DocumentCard.jsx       # Individual document matching & expiry control
│   │   ├── FileUploadZone.jsx     # Drag-and-drop PDF uploader
│   │   ├── Navbar.jsx             # Responsive glassmorphic navigation
│   │   ├── PackageGenerator.jsx   # Package compiler & blocker enforcement
│   │   ├── RequirementsList.jsx   # Ordered document checklist
│   │   ├── StampModal.jsx         # Digital seal & signature placement modal
│   │   ├── TenderHeader.jsx       # Tender metadata & live status summary
│   │   ├── UploadedFilesList.jsx  # File management & duplicate detection
│   │   └── ValidationSummary.jsx  # Live blocker diagnostic card
│   ├── context/
│   │   ├── LanguageContext.jsx    # English/Bangla localization provider
│   │   └── TenderContext.jsx      # Central procurement application state
│   ├── translations/
│   │   ├── bn.js                  # Complete Bangla dictionary
│   │   └── en.js                  # Complete English dictionary
│   ├── utils/
│   │   ├── hashUtils.js           # SHA-256 cryptographic hashing
│   │   ├── pdfUtils.js            # PDF merging, cover, index, footers & stamps
│   │   └── sampleData.js          # Default tender requirements schema
│   ├── pages/
│   │   ├── BuilderPage.jsx        # Main tender workspace
│   │   ├── GuidelinesPage.jsx     # Rulebook & scoring reference
│   │   └── PreviewPage.jsx        # PDF viewer & breakdown inspector
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── LICENSE                        # MIT License
├── package.json
├── tailwind.config.js
└── vite.config.js
```

---

## 🛠️ Technology Stack & AI Disclosure

- **Frontend Core:** React 18, React Router v6, Tailwind CSS, Vite
- **PDF Manipulation:** `pdf-lib` (browser-side client generation)
- **Icons:** `lucide-react`
- **AI Engine:** Google Gemini API (`gemini-1.5-flash`) via user-provided API key
- **AI Coding Assistant:** Google Antigravity / Gemini 3.8
- **Most Useful Prompt:**  
  `make the problem with react js , tailwind css, react router`

---

## ⚖️ License

Distributed under the **MIT License**. See [`LICENSE`](file:///c:/Users/tonmo/Desktop/Devfest-2026/devfest-263-15-029/LICENSE) for more information.
