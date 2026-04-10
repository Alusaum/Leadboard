// api/metas.js
export default async function handler(req, res) {
  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_ANON_KEY;

  // 1. TRAVA DE SEGURANÇA: Verifica se as variáveis existem
  if (!SB_URL || !SB_KEY) {
    return res.status(500).json({ 
      error: "FALHA CRÍTICA: As variáveis SUPABASE_URL ou SUPABASE_ANON_KEY não foram encontradas. Lembre-se de fazer o REDEPLOY na Vercel após adicioná-las." 
    });
  }

  // 2. TRAVA DE SEGURANÇA: Remove a barra (/) no final da URL se você tiver colocado sem querer
  const baseUrl = SB_URL.endsWith('/') ? SB_URL.slice(0, -1) : SB_URL;
  const SB_REST_URL = ${baseUrl}/rest/v1/metas?id=eq.1;

  const headers = {
    'apikey': SB_KEY,
    'Authorization': Bearer ${SB_KEY},
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };

  try {
    if (req.method === 'GET') {
      const response = await fetch(SB_REST_URL, { headers });
      if (!response.ok) {
        const errText = await response.text();
        throw new Error(Supabase Recusou (GET): ${response.status} - ${errText});
      }
      const data = await response.json();
      return res.status(200).json(data[0] || { vendas: 300000, entradas: 60000 });
    }

    if (req.method === 'POST') {
      const { vendas, entradas } = req.body;
      const response = await fetch(SB_REST_URL, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ vendas, entradas })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(Supabase Recusou (POST): ${response.status} - ${errText});
      }

      const updatedData = await response.json();
      return res.status(200).json(updatedData[0]);
    }

    return res.status(405).json({ error: 'Método não permitido' });

  } catch (error) {
    // 3. O DEDO DURO: Envia o erro real lá da Vercel direto para o seu navegador!
    return res.status(500).json({ 
      error: "O servidor quebrou", 
      detalhe: error.message 
    });
  }
}
