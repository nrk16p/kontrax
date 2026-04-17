/**
 * ─────────────────────────────────────────────────────────────
 *  ADD THESE ROUTES TO YOUR frontend/src/App.tsx (or router file)
 * ─────────────────────────────────────────────────────────────
 *
 *  import TemplateLibrary from "./pages/TemplateLibrary"
 *  import ContractForm    from "./pages/ContractForm"
 *  import SignContract    from "./pages/SignContract"
 *
 *  <Route path="/templates"                  element={<TemplateLibrary />} />
 *  <Route path="/contracts/new/:templateId"  element={<ContractForm />} />
 *  <Route path="/contracts/:id/sign"         element={<SignContract />} />
 *
 * ─────────────────────────────────────────────────────────────
 *  ADD TO YOUR backend/src/app.ts (already in pdf.ts route):
 * ─────────────────────────────────────────────────────────────
 *
 *  The pdf.ts route now handles BOTH endpoints:
 *    GET  /api/contracts/:id/pdf   → downloadContractPdf
 *    POST /api/contracts/:id/sign  → saveSignature
 *
 *  Your existing app.ts line is correct:
 *    app.use("/api", pdfRoutes)
 *
 * ─────────────────────────────────────────────────────────────
 *  PUPPETEER: set this env var on your server
 * ─────────────────────────────────────────────────────────────
 *
 *  # On Render / Railway / VPS (Linux):
 *  PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
 *
 *  # Install Chrome on Ubuntu/Debian:
 *  apt-get install -y google-chrome-stable
 *
 *  # On local Mac dev:
 *  PUPPETEER_EXECUTABLE_PATH=/Applications/Google Chrome.app/Contents/MacOS/Google Chrome
 *
 * ─────────────────────────────────────────────────────────────
 *  FIRESTORE: add this index (or deploy firestore.indexes.json)
 * ─────────────────────────────────────────────────────────────
 *
 *  Collection: contracts
 *  Fields: createdBy ASC, createdAt DESC
 *
 * ─────────────────────────────────────────────────────────────
 */
export {}
