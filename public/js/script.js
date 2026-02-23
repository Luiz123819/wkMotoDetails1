// script.js

const form = document.getElementById("formInvestimento");
const tbody = document.getElementById("resultadoBody");
const graficoCanvas = document.getElementById("graficoProjecao");
let grafico; // instância Chart.js

// ===== Utilitários =====
function parseBR(valor) {
  if (typeof valor !== "string") return Number(valor) || 0;
  return parseFloat(valor.replace(/\./g, "").replace(",", ".")) || 0;
}
function moedaBR(n) {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function taxaMensalEquivalente(jurosAnualDecimal) {
  return Math.pow(1 + jurosAnualDecimal, 1 / 12) - 1;
}

// ====== Cálculo + renderização ======
function calcularERenderizar({ anos, valorInicial, valorMensal, jurosAnual }) {
  const meses = Math.max(0, (parseInt(anos, 10) || 0) * 12);
  const aporteMensal = parseBR(String(valorMensal));
  const jurosAnualDec = parseBR(String(jurosAnual)) / 100;
  const r = taxaMensalEquivalente(jurosAnualDec);

  // Limpa tabela
  tbody.innerHTML = "";

  // Arrays para o gráfico
  const labels = [];
  const serieTotal = [];
  const serieSemJuros = [];
  const serieJurosMes = [];

  let total = parseBR(String(valorInicial));

  for (let m = 1; m <= meses; m++) {
    // Aporte no início do mês
    const baseParaJuros = total + aporteMensal;
    const jurosDoMes = baseParaJuros * r;
    total = baseParaJuros + jurosDoMes;

    const totalSemJuros = parseBR(String(valorInicial)) + aporteMensal * m;

    // Linha da tabela
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${m}</td>
      <td>${moedaBR(total)}</td>
      <td>${moedaBR(aporteMensal)}</td>
      <td>${(jurosAnualDec * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%</td>
      <td>${moedaBR(totalSemJuros)}</td>
      <td>${moedaBR(jurosDoMes)}</td>
      <td>${moedaBR(total)}</td>
    `;
    tbody.appendChild(tr);

    // Dados do gráfico
    labels.push(`Mês ${m}`);
    serieTotal.push(total);
    serieSemJuros.push(totalSemJuros);
    serieJurosMes.push(jurosDoMes);
  }

  // === Gráfico ===
  if (graficoCanvas) {
    const ctx = graficoCanvas.getContext("2d");
    if (grafico) grafico.destroy();
    grafico = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Total com juros",
            data: serieTotal,
            borderColor: "#ff6600",
            backgroundColor: "rgba(255, 102, 0, 0.15)",
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2,
            yAxisID: "y"
          },
          {
            label: "Total sem juros",
            data: serieSemJuros,
            borderColor: "#6c757d",
            backgroundColor: "rgba(108, 117, 125, 0.12)",
            borderDash: [6, 4],
            tension: 0.2,
            pointRadius: 0,
            borderWidth: 2,
            yAxisID: "y"
          },
          {
            type: "bar",
            label: "Juros do mês",
            data: serieJurosMes,
            backgroundColor: "rgba(255, 193, 7, 0.45)",
            borderColor: "rgba(255, 193, 7, 1)",
            borderWidth: 1,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "top" },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const y = ctx.parsed.y || 0;
                return `${ctx.dataset.label}: ${moedaBR(y)}`;
              }
            }
          }
        },
        scales: {
          y: {
            position: "left",
            title: { display: true, text: "Patrimônio (R$)" },
            ticks: {
              callback: (v) =>
                Number(v).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0
                })
            },
            grid: { color: "rgba(255,255,255,0.07)" }
          },
          y1: {
            position: "right",
            title: { display: true, text: "Juros do mês (R$)" },
            grid: { drawOnChartArea: false },
            ticks: {
              callback: (v) =>
                Number(v).toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                  maximumFractionDigits: 0
                })
            }
          },
          x: {
            grid: { color: "rgba(255,255,255,0.05)" }
          }
        }
      }
    });
  }
}

// ======================
// === Persistência ====
// ======================
const STORAGE_KEY = "simuladorInvestimentos:v1";

function salvarEstadoInputs() {
  const estado = {
    anos: document.getElementById("anos").value,
    valorInicial: document.getElementById("valorInicial").value,
    valorMensal: document.getElementById("valorMensal").value,
    jurosAnual: document.getElementById("jurosAnual").value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(estado));
}

function restaurarEstado() {
  const txt = localStorage.getItem(STORAGE_KEY);
  if (!txt) return false;
  try {
    const estado = JSON.parse(txt);
    if (!estado) return false;

    document.getElementById("anos").value = estado.anos ?? "";
    document.getElementById("valorInicial").value = estado.valorInicial ?? "";
    document.getElementById("valorMensal").value = estado.valorMensal ?? "";
    document.getElementById("jurosAnual").value = estado.jurosAnual ?? "";

    if (estado.anos && estado.valorInicial && estado.valorMensal && estado.jurosAnual) {
      calcularERenderizar({
        anos: estado.anos,
        valorInicial: parseBR(estado.valorInicial),
        valorMensal: parseBR(estado.valorMensal),
        jurosAnual: parseBR(estado.jurosAnual)
      });
    }
    return true;
  } catch {
    return false;
  }
}

function limparEstado() {
  localStorage.removeItem(STORAGE_KEY);
}

// Salvar em tempo real
["anos", "valorInicial", "valorMensal", "jurosAnual"].forEach((id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener("input", salvarEstadoInputs);
});

// Submeter formulário
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const anos = document.getElementById("anos").value;
  const valorInicial = document.getElementById("valorInicial").value;
  const valorMensal = document.getElementById("valorMensal").value;
  const jurosAnual = document.getElementById("jurosAnual").value;

  salvarEstadoInputs();
  calcularERenderizar({
    anos,
    valorInicial: parseBR(valorInicial),
    valorMensal: parseBR(valorMensal),
    jurosAnual: parseBR(jurosAnual)
  });
});

// Carregar página
document.addEventListener("DOMContentLoaded", () => {
  const restaurou = restaurarEstado();
  // Se quiser valores padrão quando não houver dados salvos, configure aqui
  // if (!restaurou) { document.getElementById('anos').value = 10; ... }
});

// Expor limpar
window.limparDadosSimulador = function () {
  limparEstado();
  tbody.innerHTML = "";
  if (grafico) grafico.destroy();
  form.reset();
};