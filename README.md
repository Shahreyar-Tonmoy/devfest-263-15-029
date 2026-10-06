# Tender Document Package Builder
**AI DevFest 2026 — AI Vibe-Coding Contest (Solo)**

A complete, production-ready, frontend-only web application to prepare, verify, order, audit, and generate compliant tender bid document packages.

---

## 👤 Participant Details
- **Name:** Shahreyar Tonmoy
- **Registration Number:** `263-15-029`
- **Repository:** [https://github.com/Shahreyar-Tonmoy/devfest-263-15-029](https://github.com/Shahreyar-Tonmoy/devfest-263-15-029)
- **Live Deployment (HTTPS):** [https://devfest-263-15-029.vercel.app](https://devfest-263-15-029.vercel.app)

---

## 🚀 How to Run the App Locally

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Launch
```bash
# Clone the repository
git clone https://github.com/Shahreyar-Tonmoy/devfest-263-15-029.git
cd devfest-263-15-029

# Install dependencies
npm install

# Start Vite development server
npm run dev

# Or build and preview production bundle
npm run build
npm run preview
```
Visit `http://localhost:3000` (or `http://localhost:4173` for preview).

---

## ✅ Main Features Done (Problem Statement Section 4 & 5)

1. **4.1 Load the list:**
   - Loads `requirements.json` with tender details (Tender ID, title, procuring entity, bidder, submission deadline).
   - Lists all required documents sorted strictly by `order`.
   - Includes 1-click **Load Sample Tender** to preload contest sample pack files.

2. **4.2 Upload files:**
   - Multi-file drag & drop and file browser for candidate PDFs.
   - Calculates exact page counts per PDF using `pdf-lib`.
   - Rejects non-PDF files with clear alerts.
   - Allows users to remove uploaded files at any time.

3. **4.3 Match files:**
   - Matches each uploaded PDF to one required document.
   - Enforces strict 1-to-1 matching (one document gets at most one file; one file goes to at most one document).
   - Allows changing or undoing matches anytime.
   - Includes **Auto-Match** algorithm to automatically detect document names.

4. **4.4 Enter expiry dates:**
   - Interactive date picker for documents with `has_expiry = true`.
   - Compares dates in real-time against `submission_deadline`.

5. **4.5 Live Section 5 Status Evaluation:**
   - **Missing (Red):** Mandatory document with no file matched (Blocks package).
   - **Expiry date needed (Amber):** File matched, but expiry date is missing (Blocks package).
   - **Expired (Red):** Expiry date is before submission deadline (Blocks package).
   - **Not provided (Slate):** Optional document with no file matched (Does not block).
   - **OK (Emerald):** File matched, and expiry date is on or after the deadline (Does not block).
   - Documents expiring on the same day as the submission deadline are marked OK.

6. **4.6 Find duplicates:**
   - Computes SHA-256 hash of all uploaded files.
   - Flags identical binary content (e.g. `experience_cert (1).pdf` vs `experience_cert.pdf`).
   - Prevents duplicate files from being matched to multiple documents.

7. **4.7 Package Generation Rules:**
   - **Generate Combined PDF Package** button stays strictly disabled while any blocking issue exists.
   - Displays real-time breakdown of all blocking issues with clear instructions to resolve.

8. **4.8 Download:**
   - Downloads generated package as `<tender_id>_Package.pdf` (e.g. `T-2026-0417_Package.pdf`).

9. **4.9 Bilingual Support (Bangla & English):**
   - Instant language switch between English and Bangla across the entire application.
   - Renders document titles from `title_bn` or `title_en` according to selection.

---

## 🌟 Section 6 Package Specifications

- **Page 1: Official English Cover Page**
  Displays Tender ID, title, procuring entity, bidder name, submission deadline, package creation date, and ordered list of included documents.
- **Section 6.2 Sequence & Preservation:**
  Merges document pages in order (1 to 10), skipping unmatched optional documents while preserving original pages.
- **Section 6.3 & 6.4 Standardized Footers:**
  Every page (including cover and index) has the exact footer: `<tender_id> | Page X of Y` placed cleanly in the bottom margin without obscuring document content.

---

## 🎁 Bonus Features Done (Section 7)

1. **Table of Contents / Index Page:**
   Page 2 displays a complete index of all attached documents with starting page numbers.
2. **Digital Seal & Signature Tool:**
   Upload PNG stamp/seal and apply to chosen pages (all pages, cover only, or document pages).
3. **Interactive AI Agent Chatbot (TenderBot):**
   - Autonomous Procurement AI Agent capable of auditing compliance, explaining blockers, and triggering in-app actions.
   - Supports user's own Google Gemini API key (Rulebook 5.5 compliant).
   - Includes local fallback intelligence when no key is entered.
4. **Checklist Export:**
   Export complete verification checklist as CSV/Excel with document order, name, pages, expiry date, and status.
5. **Project Persistence:**
   Save and restore work to browser `localStorage` or export/import `.json` project files.
6. **Corrupt / Protected PDF Protection:**
   Catches password-protected and corrupted files safely with user-friendly notices.
7. **Fully Responsive Mobile & Tablet Experience:**
   Includes mobile drawer navigation, responsive cards, and clean viewports on all screen sizes.

---

## 📁 Repository Contents

- `output/T-2026-0417_Package.pdf` — Final compliant package generated from sample pack data after resolving all hidden problems.
- `screenshots/` — High-resolution screenshots of document statuses, responsive desktop, and mobile viewports.
- `LICENSE` — MIT License.

---

## 🛠️ Tech Stack & AI Disclosure

- **Framework:** React 18, React Router v6, Tailwind CSS, Vite
- **PDF Manipulation:** `pdf-lib`
- **Icons:** `lucide-react`
- **AI Tools Used:** Antigravity / Gemini 3.8
- **Most Useful Prompt:**
  `make the problem with react js , tailwind css, react router`

---

## ⚖️ License
MIT License.
