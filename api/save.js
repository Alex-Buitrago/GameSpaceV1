export default async function handler(req, res) {
    if (req.method !== "POST") {
      return res.status(405).end();
    }
  
    const data = JSON.parse(req.body);
  
    // Aquí luego conectas DB real
    console.log("Guardado:", data);
  
    res.status(200).json({ ok: true });
  }