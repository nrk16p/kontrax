import puppeteer from "puppeteer-core"

export async function generatePdfBuffer(
  html: string
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  })

  const page = await browser.newPage()
  await page.setContent(html, { waitUntil: "networkidle0" })

  const pdf = await page.pdf({ format: "A4" })

  await browser.close()

  return Buffer.from(pdf)
}
