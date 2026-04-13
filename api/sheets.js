// api/sheets.js

export default async function handler(req, res) {
  // 1. Configuração de CORS (Essencial para JS puro no navegador)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { gid = '0' } = req.query;
  const sheetsUrl = process.env.SHEETS_URL;

  if (!sheetsUrl) {
    return res.status(500).json({ error: "SHEETS_URL não configurada no Vercel" });
  }

  try {
    // 2. QUEBRA DE CACHE AGRESSIVA
    // Adicionamos um timestamp na URL para o Google não servir cache
    const cacheBuster = `&t=${Date.now()}`;
    const url = `${sheetsUrl}&gid=${gid}${cacheBuster}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (!response.ok) throw new Error('Falha ao acessar Google Sheets');

    const csvText = await response.text();
    const data = parseCSV(csvText);

    // 3. HEADERS DE RESPOSTA PARA O NAVEGADOR (TV)
    // Impedimos que o navegador da Smart TV guarde cache dessa requisição
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    return res.status(200).json({
      ok: true,
      data,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

// Parser robusto de CSV
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/).map(line => {
    const fields = [];
    let cur = "", inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === "," && !inQ) { fields.push(cur.trim()); cur = ""; continue; }
      cur += ch;
    }
    fields.push(cur.trim());
    return fields;
  });

  if (lines.length < 2) return [];
  
  // Ajuste: Linha 1 são os headers reais conforme seu HTML anterior
  const rawHeaders = lines[1]; 
  const seen = {};
  const headers = rawHeaders.map(h => {
    const key = h.trim() || "_empty";
    seen[key] = (seen[key] || 0) + 1;
    return seen[key] > 1 ? `${key}_${seen[key]}` : key;
  });

  return lines.slice(2).map(row => 
    Object.fromEntries(headers.map((h, i) => [h, (row[i] ?? "").trim()]))
  );
}