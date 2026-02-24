import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  if (req.method === "OPTIONS") return res.status(200).end()

  // Thử nhiều đường dẫn khác nhau để tìm database.json
  const possiblePaths = [
    path.join(process.cwd(), "/database.json"),
    path.join(process.cwd(), "..", "/database.json"),
    "/var/task/database.json",
    path.join(fileURLToPath(new URL(".", import.meta.url)), "..", "database.json"),
    path.join(fileURLToPath(new URL(".", import.meta.url)), "../../database.json"),
  ]

  let dbPath = null
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      dbPath = p
      break
    }
  }

  if (!dbPath) {
    return res.status(500).json({
      message: "database.json not found",
      tried: possiblePaths,
      cwd: process.cwd(),
      __dirname: fileURLToPath(new URL(".", import.meta.url)),
    })
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"))

  // Parse resource và id từ URL
  const urlPath = req.url.split("?")[0]
  const parts = urlPath.replace(/^\/api\//, "").split("/").filter(Boolean)
  const resource = parts[0]
  const id = parts[1]

  if (!resource) {
    return res.status(400).json({ message: "Resource not specified", url: req.url })
  }

  if (!db[resource]) {
    return res.status(404).json({
      message: "Resource not found",
      resource,
      availableKeys: Object.keys(db),
    })
  }

  let collection = [...db[resource]]

  if (req.method === "GET") {
    if (id) {
      const item = collection.find((item) => String(item.id) === String(id))
      return res.json(item ?? null)
    }

    // Filter theo query params
    const url = new URL(req.url, "http://localhost")
    const filters = {}
    url.searchParams.forEach((val, key) => {
      if (key !== "route") filters[key] = val
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