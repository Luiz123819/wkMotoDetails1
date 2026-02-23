let ativos = JSON.parse(localStorage.getItem("ativos")) || [];
let dadosAtivos = {};
let chartAtual, chartHistorico;

async function getStockData(symbol) {
  try {
    const response = await fetch(`http://localhost:3000/quote?symbol=${symbol}`);
    const data = await response.json();
    if (data.error) return null;
    return { nome: data.nome, preco: data.preco };
  } catch (error) {
    console.error("Erro ao buscar dados:", error);
    return null;
  }
}

async function getHistoryData(symbol) {
  try {
    const response = await fetch(`http://localhost:3000/history?symbol=${symbol}`);
    const data = await response.json();
    if (data.error) return [];
    return data.history.map(h => ({ date: h.date, close: h.close }));
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}

function atualizarUI() {
  const lista = document.getElementById("listaAtivos");
  const tabela = document.querySelector("#tabelaInvestimentos tbody");
  lista.innerHTML = "";
  tabela.innerHTML = "";

  ativos.forEach(ticker => {
    const dados = dadosAtivos[ticker];
    if (dados) {
      // Lista com botão excluir
      const li = document.createElement("li");
      li.className = "list-group-item bg-dark text-white d-flex justify-content-between align-items-center";
      li.innerHTML = `
        <span>${dados.nome} (${ticker}): R$ ${dados.preco}</span>
        <button class="btn btn-sm btn-danger" onclick="excluirAtivo('${ticker}')">Excluir</button>
      `;
      lista.appendChild(li);

      // Tabela com botão excluir
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${ticker}</td>
        <td>${dados.nome}</td>
        <td>R$ ${dados.preco}</td>
        <td><button class="btn btn-sm btn-danger" onclick="excluirAtivo('${ticker}')">Excluir</button></td>
      `;
      tabela.appendChild(tr);
    }
  });
}

function excluirAtivo(ticker) {
  ativos = ativos.filter(a => a !== ticker);
  localStorage.setItem("ativos", JSON.stringify(ativos));
  delete dadosAtivos[ticker];
  atualizarUI();
  atualizarGraficoAtual();
  atualizarGraficoHistorico();
}

function atualizarGraficoAtual() {
  const ctx = document.getElementById('graficoAtivos').getContext('2d');
  if (chartAtual) chartAtual.destroy();
  chartAtual = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ativos,
      datasets: [{
        label: 'Preço Atual (R$)',
        data: ativos.map(a => dadosAtivos[a]?.preco || 0),
        backgroundColor: '#1976d2'
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } }
    }
  });
}

async function atualizarGraficoHistorico() {
  const ctx = document.getElementById('graficoHistorico').getContext('2d');
  if (chartHistorico) chartHistorico.destroy();

  const datasets = [];
  for (let ticker of ativos) {
    const history = await getHistoryData(ticker);
    if (history.length > 0) {
      datasets.push({
        label: ticker,
        data: history.map(h => ({ x: h.date, y: h.close })),
        borderColor: '#' + Math.floor(Math.random()*16777215).toString(16),
        fill: false
      });
    }
  }

  chartHistorico = new Chart(ctx, {
    type: 'line',
    data: { datasets },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: {
        x: { type: 'time', time: { unit: 'day' }, ticks: { color: '#fff' } },
        y: { ticks: { color: '#fff' } }
      }
    }
  });
}

document.getElementById("formAtivo").addEventListener("submit", async (e) => {
  e.preventDefault();
  const ticker = document.getElementById("ticker").value.toUpperCase();
  if (!ativos.includes(ticker)) {
    ativos.push(ticker);
    localStorage.setItem("ativos", JSON.stringify(ativos));
    const dados = await getStockData(ticker);
    if (dados) {
      dadosAtivos[ticker] = dados;
      atualizarUI();
      atualizarGraficoAtual();
      atualizarGraficoHistorico();
    }
  }
  document.getElementById("ticker").value = "";
});

async function atualizarDados() {
  for (let ticker of ativos) {
    const dados = await getStockData(ticker);
    if (dados) dadosAtivos[ticker] = dados;
  }
  atualizarUI();
  atualizarGraficoAtual();
  atualizarGraficoHistorico();
}

// Inicialização
atualizarDados();
setInterval(atualizarDados, 60000); // atualiza a cada 1 min
