import fs from 'fs'
import path from 'path'

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), 'database.json')
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

const rawRoute = req.query.route || []
const route = Array.isArray(rawRoute) ? rawRoute : [rawRoute]

  const [resource, id] = route

  if (!db[resource]) {
    return res.status(404).json({ message: 'Not found' })
  }

if (req.method === 'GET') {
  let data = db[resource]

  if (id) {
    const item = data.find(i => i.id == id)
    return res.json(item || null)
  }

  // Support query params như json-server
  const query = req.query
  delete query.route

  const keys = Object.keys(query)
  if (keys.length > 0) {
    data = data.filter(item =>
      keys.every(key => item[key] == query[key])
    )
  }

  return res.json(data)
}

  if (req.method === 'POST') {
    const newItem = { ...req.body, id: Date.now() }
    db[resource].push(newItem)
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    return res.json(newItem)
  }

  if (req.method === 'PUT') {
    const index = db[resource].findIndex(i => i.id == id)
    if (index === -1) return res.status(404).json(null)

    db[resource][index] = req.body
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    return res.json(db[resource][index])
  }

  return res.status(405).json({ message: 'Method not allowed' })
}