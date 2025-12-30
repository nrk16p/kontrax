import fs from "fs"
import path from "path"
import handlebars from "handlebars"
import puppeteer from "puppeteer-core"

export async function generatePdfBuffer(
  templateName: string,
  data: any
): Promise<Buffer> {

  // 1️⃣ Load template
  const templatePath = path.join(
    process.cwd(),
    "src",
    "pdf",
    "templates",
    templateName
  )

  const source = fs.readFileSync(templatePath, "utf8")
  const template = handlebars.compile(source)
  const html = template(data)

  // 2️⃣ Launch browser
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle0" })

  // 3️⃣ Generate PDF
  const pdf = await page.pdf({ format: "A4" })

  await browser.close()

  return Buffer.from(pdf)
}
