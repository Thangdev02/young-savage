import fs from "fs"
import path from "path"

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), "database.json")

  if (!fs.existsSync(dbPath)) {
    return res.status(500).json({ message: "database.json not found" })
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"))

  // 👇 lấy route từ query một cách an toàn
  const routeParts = []
  if (req.query.route) {
    if (Array.isArray(req.query.route)) {
      routeParts.push(...req.query.route)
    } else {
      routeParts.push(req.query.route)
    }
  }

  const resource = routeParts[0]
  const id = routeParts[1]

  if (!resource) {
    return res.status(400).json({ message: "Resource not specified" })
  }

  if (!db[resource]) {
    return res.status(404).json({
      message: "Resource not found",
      availableKeys: Object.keys(db)
    })
  }

  const collection = db[resource]

  if (req.method === "GET") {
    if (id) {
      const item = collection.find(item => String(item.id) === String(id))
      return res.json(item ?? null)
    }
    return res.json(collection)
  }

  if (req.method === "POST") {
    const newItem = { ...req.body, id: Date.now().toString() }
    db[resource].push(newItem)
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    return res.status(201).json(newItem)
  }

  if (req.method === "PUT") {
    const idx = collection.findIndex(item => String(item.id) === String(id))
    if (idx === -1) return res.status(404).json(null)

    collection[idx] = { ...req.body, id }
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    return res.json(collection[idx])
  }

  if (req.method === "DELETE") {
    const idx = collection.findIndex(item => String(item.id) === String(id))
    if (idx === -1) return res.status(404).json(null)

    const [deleted] = collection.splice(idx, 1)
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    return res.json(deleted)
  }

  return res.status(405).json({ message: "Method not allowed" })
}