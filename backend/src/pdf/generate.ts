import path from "path"
import fs from "fs"
import Handlebars from "handlebars"
import puppeteer from "puppeteer-core"

// ─── Template cache ───────────────────────────────────────────────────────────

const templateCache = new Map<string, HandlebarsTemplateDelegate>()

// ─── FIX 1: Use __dirname instead of process.cwd() ───────────────────────────
// process.cwd() breaks after compilation because it points to wherever the
// process was launched from, not the file's location.
// __dirname always resolves relative to THIS file.

function getTemplatePath(templateName: string): string {
  return path.join(__dirname, "templates", templateName)
}

function loadTemplate(templateName: string): HandlebarsTemplateDelegate {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName)!
  }

  const filePath = getTemplatePath(templateName)

  // FIX: Explicit "file not found" error instead of cryptic crash
  if (!fs.existsSync(filePath)) {
    throw new Error(`Template not found: ${filePath}`)
  }

  const source   = fs.readFileSync(filePath, "utf-8")
  const compiled = Handlebars.compile(source)
  templateCache.set(templateName, compiled)
  return compiled
}

// ─── Main PDF generator ───────────────────────────────────────────────────────

export async function generatePdf(
  templateName: string,
  data: Record<string, unknown>
): Promise<Buffer> {

  // Render HTML from Handlebars template
  const render = loadTemplate(templateName)
  const html   = render(data)

  // FIX 2: Use PUPPETEER_EXECUTABLE_PATH (was incorrectly CHROME_PATH)
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ??
    "/usr/bin/google-chrome-stable"

  // FIX 3: Added timeout + proper error handling around Puppeteer
  let browser
  try {
    browser = await puppeteer.launch({
      executablePath,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
      ],
      headless: true,
    })

    const page = await browser.newPage()

    // Timeout after 30s if page never loads
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout:   30_000,
    })

    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })

    return Buffer.from(pdf)

  } catch (err) {
    console.error("[generatePdf] Puppeteer error:", err)
    throw new Error("PDF generation failed: " + (err as Error).message)

  } finally {
    // Always close browser even if generation fails
    if (browser) await browser.close()
  }
}
