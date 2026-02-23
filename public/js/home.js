// Dados iniciais
let ativos = JSON.parse(localStorage.getItem("ativos")) || [];

// Chart instances
let patrimonioChart, classesChart, projecaoChart;

// Elementos do formulário
const elClasse = document.getElementById("classe");
const elDivid = document.querySelector(".campo-dividendos");
const elRend = document.querySelector(".campo-rendimento");
const elQtd = document.querySelector(".campo-qtd");
const elTicker = document.querySelector(".campo-ticker");
const elNome = document.querySelector(".campo-nome");

// Mostrar/ocultar campos conforme classe
elClasse.addEventListener("change", function () {
  const classe = this.value;
  elDivid.style.display = "none";
  elRend.style.display = "none";

  if (classe === "acoes" || classe === "fundos") {
    elNome.style.display = "none";
    elTicker.style.display = "block";
    elDivid.style.display = "block";
    elQtd.style.display = "block";
  } else if (classe === "rendaFixa") {
    elRend.style.display = "block";
    elQtd.style.display = "none";
    elNome.style.display = "block";
    elTicker.style.display = "none";
  } else if (classe === "cripto") {
    elNome.style.display = "none";
    elTicker.style.display = "block";
    elQtd.style.display = "none";
  }
});

// Atualiza tudo
function atualizarTudo() {
  atualizarTabela();
  atualizarCards();
  atualizarGraficos();
}

// Atualiza tabela
function atualizarTabela() {
  const tbodyVar = document.querySelector("#tabelaRendaVariavel tbody");
  const tbodyFix = document.querySelector("#tabelaRendaFixa tbody");
  tbodyVar.innerHTML = "";
  tbodyFix.innerHTML = "";

  ativos.forEach((ativo, idx) => {
    let valorFinal = "-";

    if (ativo.classe === "acoes" || ativo.classe === "fundos" || ativo.classe === "cripto") {
      if ((ativo.classe === "acoes" || ativo.classe === "fundos") && ativo.quantidade && ativo.dividendos) {
        valorFinal = (ativo.quantidade * ativo.dividendos).toFixed(2);
      } else if (ativo.classe === "cripto" && ativo.cotacao) {
        const ganho = ((ativo.cotacao - ativo.valor) / ativo.valor) * 100;
        valorFinal = ganho.toFixed(2) + "%";
      }

      const tr = document.createElement("tr");
      tr.setAttribute("data-ticker", ativo.ticker || "");
      tr.innerHTML = `
        <td>${escapeHtml(ativo.classe)}</td>
        <td>${escapeHtml(ativo.nome || ativo.ticker)}</td>
        <td>R$ ${Number(ativo.valor).toFixed(2)}</td>
        <td>${ativo.quantidade || "-"}</td>
        <td>${ativo.dividendos ? "R$ " + ativo.dividendos : "-"}</td>
        <td>${ativo.cotacao ? "R$ " + ativo.cotacao.toFixed(2) : "-"}</td>
        <td>${valorFinal}</td>
             <td class="d-flex justify-content-center gap-2">
  <button class="btn btn-sm btn-warning" onclick="editarAtivo(${idx})">
    <i class="bi bi-pencil"></i> Editar
  </button>
  <button class="btn btn-sm btn-danger" onclick="excluirAtivo(${idx})">
    <i class="bi bi-trash"></i> Excluir
  </button>
</td>
      `;
      tbodyVar.appendChild(tr);

    } else if (ativo.classe === "rendaFixa") {
      if (ativo.valor && ativo.rendimento) {
        valorFinal = (ativo.valor * (ativo.rendimento / 100)).toFixed(2);
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(ativo.classe)}</td>
        <td>${escapeHtml(ativo.nome)}</td>
        <td>R$ ${Number(ativo.valor).toFixed(2)}</td>
        <td>${ativo.rendimento ? ativo.rendimento + "%" : "-"}</td>
   
        <td>R$ ${valorFinal}</td>
      <td class="d-flex justify-content-center gap-2">
  <button class="btn btn-sm btn-warning" onclick="editarAtivo(${idx})">
    <i class="bi bi-pencil"></i> Editar
  </button>
  <button class="btn btn-sm btn-danger" onclick="excluirAtivo(${idx})">
    <i class="bi bi-trash"></i> Excluir
  </button>
</td>

      `;
      tbodyFix.appendChild(tr);
    }
  });
}
function editarAtivo(index) {
  const ativo = ativos[index];
  if (!ativo) return;

  // Preenche o formulário com os dados do ativo
  document.getElementById("classe").value = ativo.classe;
  document.getElementById("nome").value = ativo.nome || "";
  document.getElementById("valor").value = ativo.valor || "";
  document.getElementById("ticker").value = ativo.ticker || "";
  document.getElementById("qtd").value = ativo.quantidade || "";
  document.getElementById("dividendos").value = ativo.dividendos || "";
  document.getElementById("rendimento").value = ativo.rendimento || "";

  // Mostra os campos corretos conforme a classe
  elClasse.dispatchEvent(new Event("change"));

  // Abre o modal
  const modalEl = document.getElementById("modalAtivo");
  const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modalInstance.show();

  // Ao salvar, substitui o ativo existente
  document.getElementById("formAtivo").onsubmit = (e) => {
    e.preventDefault();

    const classe = document.getElementById("classe").value;
    const nome = document.getElementById("nome").value.trim();
    const valor = parseFloat(document.getElementById("valor").value) || 0;
    const ticker = document.getElementById("ticker").value.trim().toUpperCase();
    let quantidade = null, dividendos = null, rendimento = null;

    if (classe === "acoes" || classe === "fundos") {
      quantidade = parseInt(document.getElementById("qtd").value, 10) || 0;
      dividendos = parseFloat(document.getElementById("dividendos").value) || 0;
    } else if (classe === "rendaFixa") {
      rendimento = parseFloat(document.getElementById("rendimento").value) || 0;
    }

    ativos[index] = { classe, nome, valor, quantidade, dividendos, rendimento, ticker };
    localStorage.setItem("ativos", JSON.stringify(ativos));
    atualizarTudo();

    modalInstance.hide();
    e.target.reset();
  };
}


function atualizarCards() {
  // Ganhos = soma dos valores finais da tabela
  const ganhos = ativos.reduce((soma, ativo) => {
    if (ativo.classe === "acoes" || ativo.classe === "fundos") {
      if (ativo.quantidade && ativo.dividendos) {
        return soma + (ativo.quantidade * ativo.dividendos);
      }
    } else if (ativo.classe === "rendaFixa") {
      if (ativo.valor && ativo.rendimento) {
        return soma + (ativo.valor * (ativo.rendimento / 100));
      }
    } else if (ativo.classe === "cripto" && ativo.cotacao) {
      return soma + ativo.cotacao;
    }
    return soma;
  }, 0);

  // Total investido = soma dos valores originais
  const totalInvestido = ativos.reduce((soma, ativo) => soma + (Number(ativo.valor) || 0), 0);

  // Patrimônio = total investido + ganhos
  const patrimonio = totalInvestido + ganhos;

  const count = ativos.length;
  const rendimentos = ativos
    .filter(a => a.rendimento !== null && a.rendimento !== undefined)
    .map(a => Number(a.rendimento));
  const mediaRendimento = rendimentos.length
    ? (rendimentos.reduce((s, r) => s + r, 0) / rendimentos.length)
    : 0;

  // Atualiza os cards
  document.getElementById("cardPatrimonio").textContent =
    `R$ ${patrimonio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById("cardDividendos").textContent =
    `R$ ${ganhos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  document.getElementById("cardCount").textContent = count;
  document.getElementById("cardRendimento").textContent = `${mediaRendimento.toFixed(2)}%`;
}

// Atualiza gráficos (mantém igual ao seu código)
function atualizarGraficos() {
  // PatrimonioChart: linha com projeção simples (últimos 7 meses + atual)
  const patrimonio = ativos.reduce((s, a) => s + (Number(a.valor) || 0), 0);
  const labels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];
  const base = Math.max(0, patrimonio * 0.6);
  const step = (patrimonio - base) / (labels.length - 1 || 1);
  const dataPatrimonio = labels.map((_, i) => Math.round(base + step * i));

  const ctxPat = document.getElementById('patrimonioChart').getContext('2d');
  if (patrimonioChart) patrimonioChart.destroy();
  patrimonioChart = new Chart(ctxPat, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Patrimônio (R$)',
        data: dataPatrimonio,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.25)',
        fill: true,
        tension: 0.3
      }]
    },
    options: {
      plugins: { legend: { labels: { color: '#fff' } } },
      scales: { x: { ticks: { color: '#fff' } }, y: { ticks: { color: '#fff' } } },
      responsive: true
    }
  });

  // ClassesChart: doughnut por soma de valores por classe
  const classes = {};
  ativos.forEach(a => {
    const key = a.classe || 'Outros';
    classes[key] = (classes[key] || 0) + (Number(a.valor) || 0);
  });
  const classLabels = Object.keys(classes).length ? Object.keys(classes) : ['Nenhum'];
  const classData = Object.keys(classes).length ? Object.values(classes) : [1];

  const ctxClasses = document.getElementById('classesChart').getContext('2d');
  if (classesChart) classesChart.destroy();
  classesChart = new Chart(ctxClasses, {
    type: 'doughnut',
    data: {
      labels: classLabels,
      datasets: [{
        data: classData,
        backgroundColor: ['#1976d2', '#42a5f5', '#1e88e5', '#10b981', '#f59e0b']
      }]
    },
    options: { plugins: { legend: { labels: { color: '#fff' } } }, responsive: true }
  });

  // ProjecaoChart: projeção simples para próximos 5 anos com crescimento conservador
  const ctxProj = document.getElementById('projecaoChart').getContext('2d');
  if (projecaoChart) projecaoChart.destroy();

  const totalFinal = ativos.reduce((soma, ativo) => {
    if (ativo.classe === "acoes" || ativo.classe === "fundos") {
      if (ativo.quantidade && ativo.dividendos) {
        return soma + (ativo.quantidade * ativo.dividendos);
      }
    } else if (ativo.classe === "rendaFixa") {
      if (ativo.valor && ativo.rendimento) {
        return soma + (ativo.valor * (ativo.rendimento / 100));
      }
    } else if (ativo.classe === "cripto" && ativo.cotacao) {
      return soma + ativo.cotacao;
    }
    return soma;
  }, 0);

  const years = ['2026','2027','2028','2029','2030'];
  const growth = 0.12;
  const projData = years.map((_, i) => Math.round(totalFinal * Math.pow(1 + growth, i)));

  projecaoChart = new Chart(ctxProj, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Projeção Patrimonial (R$)',
        data: projData,
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

// Escapar texto
function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Excluir ativo
function excluirAtivo(index) {
  if (!Number.isInteger(index)) return;
  ativos.splice(index, 1);
  localStorage.setItem("ativos", JSON.stringify(ativos));
  atualizarTudo();
}

// Buscar cotações na API do Brapi
async function atualizarCotacoes() {
  try {
    const tickers = ativos.map(a => a.ticker).filter(t => t).join(",");
    if (!tickers) return;

    const response = await fetch(`https://brapi.dev/api/quote/${tickers}`, {
      headers: {
        'Authorization': 'Bearer dTWtsxBQMQdtbpf1FzT8mY'
      }
    });

    const data = await response.json();

    if (data && Array.isArray(data.results)) {
      data.results.forEach(result => {
        const ticker = result.symbol;
        const preco = result.regularMarketPrice;
        const ativo = ativos.find(a => a.ticker === ticker);
        if (ativo) ativo.cotacao = preco;
      });

      localStorage.setItem("ativos", JSON.stringify(ativos));
      atualizarTabela();
    } else {
      console.warn("Resposta inesperada da API:", data);
    }
  } catch (error) {
    console.error("Erro ao buscar cotações:", error);
  }
}



// Form submit
document.getElementById("formAtivo").addEventListener("submit", (e) => {
  e.preventDefault();
  const classe = document.getElementById("classe").value;
  const nome = document.getElementById("nome").value.trim();
  const valor = parseFloat(document.getElementById("valor").value) || 0;
  const ticker = document.getElementById("ticker").value.trim().toUpperCase();

  let quantidade = null, dividendos = null, rendimento = null;
  if (classe === "acoes" || classe === "fundos") {
    quantidade = parseInt(document.getElementById("qtd").value, 10) || 0;
    dividendos = parseFloat(document.getElementById("dividendos").value) || 0;
  } else if (classe === "rendaFixa") {
    rendimento = parseFloat(document.getElementById("rendimento").value) || 0;
  }

  ativos.push({ classe, nome, valor, quantidade, dividendos, rendimento, ticker });
  localStorage.setItem("ativos", JSON.stringify(ativos));
  atualizarTudo();

  const modalEl = document.getElementById("modalAtivo");
  const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
  modalInstance.hide();
  e.target.reset();
});

// Inicialização
atualizarTudo();
atualizarCotacoes();
setInterval(atualizarCotacoes, 60000); // atualiza a cada 1 minuto

// Expor função excluirAtivo
window.excluirAtivo = excluirAtivo;
