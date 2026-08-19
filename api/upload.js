export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-file-path,x-file-type");

  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://koqzsgdhblebzjdsrsxw.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY;

  if (!SUPABASE_KEY) return res.status(500).json({ error: "Server configuration error" });

  const filePath = req.headers["x-file-path"];
  const fileType = req.headers["x-file-type"];

  if (!filePath) return res.status(400).json({ error: "Missing file path" });

  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const uploadRes = await fetch(
      `${SUPABASE_URL}/storage/v1/object/attachments/${filePath}`,
      {
        method: "POST",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": fileType || "application/octet-stream",
        },
        body: buffer,
      }
    );

    if (!uploadRes.ok) {
      const err = await uploadRes.text();
      return res.status(400).json({ error: err });
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/attachments/${filePath}`;
    return res.status(200).json({ url: publicUrl });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
