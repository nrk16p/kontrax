import fs from "fs"
import path from "path"
import Handlebars from "handlebars"

export function renderTemplate(templateName: string, data: any) {
  const filePath = path.join(__dirname, "templates", templateName)
  const source = fs.readFileSync(filePath, "utf8")
  const tpl = Handlebars.compile(source)
  return tpl(data)
}
