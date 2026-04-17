import path from "path"
import fs from "fs"
import Handlebars from "handlebars"   // Fix #8: consistent capitalisation
import puppeteer from "puppeteer-core"

// ─── Template cache ───────────────────────────────────────────────────────────

const cache = new Map<string, HandlebarsTemplateDelegate>()

// Fix #7: __dirname resolves relative to THIS file after compilation.
// process.cwd() was wrong — it resolves from wherever node was launched.

function loadTemplate(name: string): HandlebarsTemplateDelegate {
  if (cache.has(name)) return cache.get(name)!

  const filePath = path.join(__dirname, "templates", name)

  if (!fs.existsSync(filePath)) {
    throw new Error(`[generatePdf] Template not found: ${filePath}`)
  }

  const compiled = Handlebars.compile(fs.readFileSync(filePath, "utf-8"))
  cache.set(name, compiled)
  return compiled
}

// ─── generatePdf ─────────────────────────────────────────────────────────────

export async function generatePdf(
  templateName: string,
  data: Record<string, unknown>
): Promise<Buffer> {

  const html = loadTemplate(templateName)(data)

  // Fix: PUPPETEER_EXECUTABLE_PATH (not CHROME_PATH)
  const executablePath =
    process.env.PUPPETEER_EXECUTABLE_PATH ?? "/usr/bin/google-chrome-stable"

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
    await page.setContent(html, { waitUntil: "networkidle0", timeout: 30_000 })

    const pdf = await page.pdf({
      format:          "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    })

    return Buffer.from(pdf)

  } catch (err) {
    throw new Error("[generatePdf] " + (err as Error).message)
  } finally {
    if (browser) await browser.close()
  }
}
