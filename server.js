const express = require("express");
const cors = require("cors");
const path = require("path");

// Se estiver usando Node < 18:
// const fetch = require("node-fetch");

const app = express();
app.use(cors());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rota para buscar cotação atual via brapi.dev
app.get("/quote", async (req, res) => {
  const symbol = req.query.symbol;
  try {
    const response = await fetch(`https://brapi.dev/api/quote/${symbol}`);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro na resposta da brapi.dev" });
    }

    const data = await response.json();
    console.log("Resposta brapi /quote:", data);

    if (!data || !data.results || data.results.length === 0) {
      return res.status(404).json({ error: `Ticker '${symbol}' não encontrado na brapi.dev` });
    }

    const result = data.results[0];
    res.json({
      symbol: result.symbol,
      nome: result.longName || result.shortName || "Nome não disponível",
      preco: result.regularMarketPrice ?? null,
      moeda: result.currency || "BRL"
    });
  } catch (error) {
    console.error("Erro no backend /quote:", error);
    res.status(500).json({ error: "Erro ao buscar dados na brapi.dev" });
  }
});

// Rota para buscar histórico de preços (últimos 30 dias)
app.get("/history", async (req, res) => {
  const symbol = req.query.symbol;
  try {
    const response = await fetch(`https://brapi.dev/api/quote/${symbol}?range=1mo&interval=1d`);

    if (!response.ok) {
      return res.status(response.status).json({ error: "Erro na resposta da brapi.dev" });
    }

    const data = await response.json();
    console.log("Resposta brapi /history:", data);

    if (!data || !data.results || data.results.length === 0) {
      return res.status(404).json({ error: `Histórico não encontrado para '${symbol}'` });
    }

    const history = data.results[0].historicalDataPrice.map(h => ({
      // Converter timestamp UNIX para ISO string
      date: new Date(h.date * 1000).toISOString(),
      close: h.close
    }));

    res.json({ symbol, history });
  } catch (error) {
    console.error("Erro no backend /history:", error);
    res.status(500).json({ error: "Erro ao buscar histórico na brapi.dev" });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Backend rodando na porta ${PORT}`));
