import fs from "fs"
import path from "path"

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), "database.json")

  if (!fs.existsSync(dbPath)) {
    return res.status(500).json({ message: "database.json not found" })
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"))

  // Parse route parts — Vercel passes catch-all as array or string in req.query.route
  const routeParts = []
  const rawRoute = req.query.route
  if (Array.isArray(rawRoute)) {
    routeParts.push(...rawRoute)
  } else if (typeof rawRoute === "string") {
    routeParts.push(...rawRoute.split("/").filter(Boolean))
  } else {
    // Fallback: parse from req.url directly
    const urlPath = req.url.replace(/\?.*$/, "")
    const parts = urlPath.replace(/^\/api\//, "").split("/").filter(Boolean)
    routeParts.push(...parts)
  }

  const resource = routeParts[0]
  const id = routeParts[1]

  if (!resource) {
    return res.status(400).json({ message: "Resource not specified", url: req.url, query: req.query })
  }

  if (!db[resource]) {
    return res.status(404).json({
      message: "Resource not found",
      resource,
      routeParts,
      availableKeys: Object.keys(db),
    })
  }

  let collection = db[resource]

  if (req.method === "GET") {
    // Nếu có id trong path => trả 1 item
    if (id) {
      const item = collection.find((item) => String(item.id) === String(id))
      return res.json(item ?? null)
    }

    // Lọc theo query string (bỏ qua key "route")
    const filters = { ...req.query }
    delete filters.route

    if (Object.keys(filters).length > 0) {
      collection = collection.filter((item) =>
        Object.entries(filters).every(([key, val]) => {
          // Hỗ trợ boolean string
          if (val === "true") return item[key] === true
          if (val === "false") return item[key] === false
          return String(item[key]) === String(val)
        })
      )
    }

    return res.json(collection)
  }

  // ⚠️ Vercel dùng read-only filesystem — write sẽ không persist
  // Nhưng vẫn trả response hợp lệ để app không crash

  if (req.method === "POST") {
    const newItem = {
      ...req.body,
      id: req.body.id || Date.now().toString(),
    }
    // Không thể ghi file trên Vercel — trả về item như đã tạo
    return res.status(201).json(newItem)
  }

  if (req.method === "PUT") {
    const item = collection.find((item) => String(item.id) === String(id))
    if (!item) return res.status(404).json(null)
    const updated = { ...req.body, id }
    return res.json(updated)
  }

  if (req.method === "DELETE") {
    const item = collection.find((item) => String(item.id) === String(id))
    if (!item) return res.status(404).json(null)
    return res.json(item)
  }

  return res.status(405).json({ message: "Method not allowed" })
}