export default async function handler(req, res) {
  // Allow CORS from same origin
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const SUPABASE_URL = "https://koqzsgdhblebzjdsrsxw.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_KEY) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  const { table, query, body: reqBody, method } = req.body || {};

  if (!table) {
    return res.status(400).json({ error: "Missing table" });
  }

  const url = `${SUPABASE_URL}/rest/v1/${table}${query ? "?" + query : ""}`;

  try {
    const response = await fetch(url, {
      method: method || "GET",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": method === "POST" ? "return=representation" : method === "PATCH" ? "return=representation" : "return=minimal",
      },
      body: reqBody ? JSON.stringify(reqBody) : undefined,
    });

    const text = await response.text();
    const data = text ? JSON.parse(text) : [];

    return res.status(response.ok ? 200 : 400).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
