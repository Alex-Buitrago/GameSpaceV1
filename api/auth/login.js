// Login handler — uses Firestore REST API (no firebase-admin needed)
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
    return {
      email:    data.fields.email?.stringValue ?? null,
      password: data.fields.password?.stringValue ?? null
    };
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Método no permitido" });

  const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body ?? {});
  const { email, password } = body;

  if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

  const user = await getUser(email.toLowerCase().trim());
  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Credenciales inválidas" });
  }

  return res.status(200).json({ ok: true, user: { email: email.toLowerCase().trim() } });
}
