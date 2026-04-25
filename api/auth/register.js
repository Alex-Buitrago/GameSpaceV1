import fs from "fs";
import path from "path";

const filePath = path.resolve("./api/users.json");

function getUsers() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function saveUsers(users) {
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
}

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  const { email, password } =
    typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const users = getUsers();

  const exists = users.find(u => u.email === email);
  if (exists) {
    return res.status(400).json({ error: "Usuario ya existe" });
  }

  users.push({ email, password });
  saveUsers(users);

  return res.status(200).json({ ok: true });
}