// api/csv.js
export default async function handler(req, res) {
  // Tenta pegar a URL do navegador. Se não tiver, usa a variável secreta da Vercel
  const url = req.query.url || process.env.SECRET_CSV_URL;

  if (!url) {
    return res.status(400).send('URL da planilha não configurada no servidor.');
  }

  try {
    const response = await fetch(url);
    const data = await response.text();
    
    // Configura headers para evitar cache agressivo e permitir o acesso
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send('Erro ao buscar planilha: ' + error.message);
  }
}
