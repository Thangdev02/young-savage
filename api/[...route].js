import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Đọc database.json — thử từ nhiều vị trí
function loadDB() {
  const candidates = [
    path.resolve(__dirname, "../database.json"),
    path.resolve(__dirname, "../../database.json"),
    path.resolve(process.cwd(), "database.json"),
  ]
  for (const p of candidates) {
    try {
      const raw = fs.readFileSync(p, "utf-8")
      const db = JSON.parse(raw)
      // Kiểm tra db có data thật không
      if (db && typeof db === "object" && Object.keys(db).length > 0) {
        return { db, source: p }
      }
    } catch {}
  }
  return { db: null, source: null }
}

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.status(200).end()

  const { db, source } = loadDB()

  if (!db) {
    return res.status(500).json({
      message: "database.json not found",
      __dirname,
      cwd: process.cwd(),
    })
  }

  const urlPath = req.url.split("?")[0]
  const parts = urlPath.replace(/^\/api\//, "").split("/").filter(Boolean)
  const resource = parts[0]
  const id = parts[1]

  if (!resource) {
    return res.status(400).json({ message: "Resource not specified" })
  }

  if (!db[resource]) {
    return res.status(404).json({
      message: "Resource not found",
      resource,
      availableKeys: Object.keys(db),
      source,
    })
  }

  let collection = [...db[resource]]

  if (req.method === "GET") {
    if (id) {
      const item = collection.find((item) => String(item.id) === String(id))
      return res.json(item ?? null)
    }

    const url = new URL(req.url, "http://localhost")
    const filters = {}
    url.searchParams.forEach((val, key) => {
      if (key !== "route" && key !== "path") filters[key] = val
    })

    if (Object.keys(filters).length > 0) {
      collection = collection.filter((item) =>
        Object.entries(filters).every(([key, val]) => {
          if (val === "true") return item[key] === true
          if (val === "false") return item[key] === false
          return String(item[key]) === String(val)
        })
      )
    }

    return res.json(collection)
  }

  if (req.method === "POST") {
    const newItem = { ...req.body, id: req.body?.id || Date.now().toString() }
    return res.status(201).json(newItem)
  }

  if (req.method === "PUT") {
    const item = collection.find((item) => String(item.id) === String(id))
    if (!item) return res.status(404).json(null)
    return res.json({ ...req.body, id })
  }

  if (req.method === "DELETE") {
    const item = collection.find((item) => String(item.id) === String(id))
    if (!item) return res.status(404).json(null)
    return res.json(item)
  }

  return res.status(405).json({ message: "Method not allowed" })
}