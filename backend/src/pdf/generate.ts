import puppeteer from "puppeteer"
import fs from "fs"
import path from "path"
import Handlebars from "handlebars"

export async function generatePdfBuffer(
  templateName: string,
  data: any
): Promise<Buffer> {
  const templatePath = path.join(
    __dirname,
    "templates",
    templateName
  )

  const html = fs.readFileSync(templatePath, "utf8")
  const template = Handlebars.compile(html)
  const content = template(data)

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()
  await page.setContent(content, { waitUntil: "networkidle0" })

  const pdfUint8 = await page.pdf({
    format: "A4",
    printBackground: true,
  })

  await browser.close()

  // ✅ FIX: Convert Uint8Array → Buffer
  return Buffer.from(pdfUint8)
}
