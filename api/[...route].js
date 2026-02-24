import fs from "fs";
import path from "path";

export default function handler(req, res) {
  const dbPath = path.join(process.cwd(), "database.json");

  if (!fs.existsSync(dbPath)) {
    return res.status(500).json({ message: "database.json not found" });
  }

  const db = JSON.parse(fs.readFileSync(dbPath, "utf-8"));

  const rawRoute = req.query.route || [];
  const route = Array.isArray(rawRoute) ? rawRoute : [rawRoute];
  const [resource, id] = route;

  if (!db[resource]) {
    return res.status(404).json({
      message: "Resource not found",
      availableKeys: Object.keys(db)
    });
  }

  let data = db[resource];

  // ================= GET =================
  if (req.method === "GET") {
    if (id) {
      return res.json(data.find(i => i.id == id) || null);
    }
    return res.json(data);
  }

  // ================= POST =================
  if (req.method === "POST") {
    const newItem = { ...req.body, id: Date.now().toString() };
    db[resource].push(newItem);

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return res.status(201).json(newItem);
  }

  // ================= PUT =================
  if (req.method === "PUT") {
    const index = db[resource].findIndex(i => i.id == id);
    if (index === -1) return res.status(404).json(null);

    db[resource][index] = { ...req.body, id };
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return res.json(db[resource][index]);
  }

  // ================= DELETE =================
  if (req.method === "DELETE") {
    const index = db[resource].findIndex(i => i.id == id);
    if (index === -1) return res.status(404).json(null);

    const deleted = db[resource].splice(index, 1);
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    return res.json(deleted[0]);
  }

  return res.status(405).json({ message: "Method not allowed" });
}