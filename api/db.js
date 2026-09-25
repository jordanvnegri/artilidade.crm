export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://koqzsgdhblebzjdsrsxw.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;
  if (!SUPABASE_KEY) return res.status(500).json({ error: "Missing key" });

  // Parse body manually if needed
  let body = req.body;
  if (!body || typeof body === "string") {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const raw = Buffer.concat(chunks).toString();
      body = raw ? JSON.parse(raw) : {};
    } catch(e) {
      body = {};
    }
  }

  const table = body.table;
  const query = body.query || null;
  const reqBody = body.body || null;
  const method = body.method || "GET";

  if (!table) return res.status(400).json({ error: "Missing table" });

  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? "?" + query : ""}`;
  const prefer = (method === "POST" || method === "PATCH") ? "return=representation" : "return=minimal";

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": prefer,
      },
      body: reqBody ? JSON.stringify(reqBody) : undefined,
    });

    const text = await response.text();
    let data;
    try { data = text ? JSON.parse(text) : []; } catch(e) { data = []; }

    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
