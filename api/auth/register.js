// Register handler — uses Firestore REST API (no firebase-admin needed)
const PROJECT_ID = "spacegame-f4c6b";

function emailToKey(email) {
  return email.replace(/[.@]/g, "_").replace(/[^a-zA-Z0-9_-]/g, "");
}

async function getUser(email) {
  const key = emailToKey(email);
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${key}`;
  try {
    const res  = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error || !data.fields) return null;
    return data.fields;
  } catch {
    return null;
  }
}

async function createUser(email, password) {
  const key = emailToKey(email);
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${key}`;
  const body = JSON.stringify({
    fields: {
      email:    { stringValue: email },
      password: { stringValue: password }
    }
  });
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  const { email, password } = body;

  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  const normalEmail = email.toLowerCase().trim();

  const exists = await getUser(normalEmail);
  if (exists) return res.status(400).json({ error: "Usuario ya existe" });

  const ok = await createUser(normalEmail, password);
  if (!ok) return res.status(500).json({ error: "Error al crear usuario" });

  return res.status(200).json({ ok: true });
}
