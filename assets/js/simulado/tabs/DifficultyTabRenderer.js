import { BaseTabRenderer } from "./BaseTabRenderer.js";

export class DifficultyTabRenderer extends BaseTabRenderer {
  constructor(app) {
    super(app);
  }

  render() {
    const container = document.getElementById("difficulty-container");
    if (!container) return;

    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();
    const meta = this.app.getMeta();
    const config = this.app.getCurrentConfig();

    // Analisar questões por dificuldade
    const difficultyData = this.analyzeDifficultyData(
      questions,
      answers,
      meta,
      config
    );

    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };

    // Obter áreas disponíveis
    const availableAreas = [
      ...new Set(difficultyData.questions.map((q) => q.area)),
    ];

    let html = `
      <div class="difficulty-analysis">
        <h4><i class="fa fa-signal"></i> Análise por Dificuldade</h4>
    `;

    // Se há múltiplas áreas, adicionar sub-navegação por área
    if (availableAreas.length > 1) {
      html += `
        <div class="difficulty-sub-nav">
          <button class="difficulty-filter-btn active" data-area="all">
            <i class="fa fa-chart-bar"></i> Todas as Áreas
          </button>
          ${availableAreas
            .map(
              (area) => `
            <button class="difficulty-filter-btn" data-area="${area}">
              <i class="fa fa-layer-group"></i> ${areaNames[area] || area}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    html += '<div class="difficulty-content">';

    // Visão geral (todas as áreas)
    html += '<div class="difficulty-view" data-difficulty-view="all">';
    html += this.renderDifficultyStats(difficultyData);
    html += this.renderDifficultyPattern(difficultyData);
    html += this.renderDifficultyTable(difficultyData);
    html += "</div>";

    // Visões por área
    if (availableAreas.length > 1) {
      availableAreas.forEach((area) => {
        const areaQuestions = difficultyData.questions.filter(
          (q) => q.area === area
        );
        const areaData = {
          questions: areaQuestions,
          hasDifficultyData: difficultyData.hasDifficultyData,
        };

        html += `
          <div class="difficulty-view" data-difficulty-view="${area}" style="display: none;">
            <div class="level-detailed-view">
              <div class="level-header">
                <h4><i class="fa fa-layer-group"></i> ${
                  areaNames[area] || area
                }</h4>
                <div class="level-summary">
                  <span class="summary-item">
                    <strong>${
                      areaQuestions.filter((q) => q.isCorrect).length
                    }/${areaQuestions.length}</strong> questões corretas
                  </span>
                  <span class="summary-item">
                    <strong>${Math.round(
                      (areaQuestions.filter((q) => q.isCorrect).length /
                        areaQuestions.length) *
                        100
                    )}%</strong> de aproveitamento
                  </span>
                </div>
              </div>
              ${this.renderDifficultyStats(areaData)}
              ${this.renderDifficultyPattern(areaData)}
              ${this.renderDifficultyTable(areaData)}
            </div>
          </div>
        `;
      });
    }

    html += "</div>";
    html += "</div>";

    container.innerHTML = html;

    // Configurar filtros se necessário
    if (availableAreas.length > 1) {
      this.setupDifficultyFilters();
    }
  }

  analyzeDifficultyData(questions, answers, meta, config) {
    const questionsWithDifficulty = [];
    let hasDifficultyData = false;

    questions.forEach((question, examIndex) => {
      const userAnswer = answers[question.position];
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);

      // Determinar se a resposta está correta
      let isCorrect = false;
      if (question.cancelled) {
        // Para questões anuladas, considera correto se o usuário respondeu
        isCorrect = userAnswer !== undefined && userAnswer !== null;
      } else {
        // Para questões não anuladas, compara com o gabarito
        isCorrect = userAnswer === correctAnswer;
      }

      let difficulty = null;
      let difficultyLevel = "Desconhecida";

      // Tentar obter dificuldade dos metadados
      // Usar originalPosition (posição na prova azul) para buscar no meta.json
      const metaPosition = question.originalPosition;
      if (
        metaPosition &&
        meta[config.year] &&
        meta[config.year][question.area] &&
        meta[config.year][question.area][metaPosition]
      ) {
        const metaData = meta[config.year][question.area][metaPosition];

        // Calcular dificuldade usando parâmetros da TRI: 100*B + 500
        if (metaData.difficulty !== null && metaData.difficulty !== undefined) {
          difficulty = 100 * metaData.difficulty + 500;
          hasDifficultyData = true;

          // Classificar por nível baseado na escala TRI (seguindo padrão do app.js)
          if (difficulty < 550.0) difficultyLevel = "Muito fácil";
          else if (difficulty < 650.0) difficultyLevel = "Fácil";
          else if (difficulty < 750.0) difficultyLevel = "Média";
          else if (difficulty < 850.0) difficultyLevel = "Difícil";
          else difficultyLevel = "Muito difícil";
        }
      }

      // Se não há dados de dificuldade, usar posição na prova como aproximação
      if (!hasDifficultyData) {
        const totalQuestions = questions.length;
        const position = examIndex + 1;

        difficultyLevel = "N/A";
      }

      questionsWithDifficulty.push({
        questionNumber: examIndex + 1,
        originalPosition: question.originalPosition,
        area: question.area,
        difficulty: difficulty,
        difficultyLevel: difficultyLevel,
        isCorrect: isCorrect,
        cancelled: question.cancelled,
        userAnswer: userAnswer || "-",
        correctAnswer: correctAnswer,
      });
    });

    return {
      questions: questionsWithDifficulty,
      hasDifficultyData: hasDifficultyData,
    };
  }

  renderDifficultyStats(difficultyData) {
    const { questions, hasDifficultyData } = difficultyData;

    // Agrupar por nível de dificuldade
    const groups = {};
    questions.forEach((q) => {
      if (!groups[q.difficultyLevel]) {
        groups[q.difficultyLevel] = { total: 0, correct: 0 };
      }
      groups[q.difficultyLevel].total++;
      if (q.isCorrect) groups[q.difficultyLevel].correct++;
    });

    let html = `
      <div class="difficulty-stats-grid">
        <h5>${
          hasDifficultyData
            ? "Desempenho por Nível de Dificuldade"
            : "Desempenho por Posição na Prova"
        }</h5>
        <div class="stats-cards">
    `;

    // Definir ordem correta dos níveis de dificuldade
    const difficultyOrder = hasDifficultyData
      ? ["Muito fácil", "Fácil", "Média", "Difícil", "Muito difícil"]
      : ["Início da Prova", "Meio da Prova", "Fim da Prova"];

    // Ordenar grupos pela ordem correta
    const sortedGroups = difficultyOrder
      .filter((level) => groups[level]) // Apenas incluir níveis que existem nos dados
      .map((level) => [level, groups[level]]);

    sortedGroups.forEach(([level, data]) => {
      const percentage = Math.round((data.correct / data.total) * 100);
      html += `
        <div class="difficulty-stat-card">
          <h6>${level}</h6>
          <div class="stat-number">${data.correct}/${data.total}</div>
          <div class="stat-percentage">${percentage}%</div>
        </div>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  renderDifficultyPattern(difficultyData) {
    const { questions, hasDifficultyData } = difficultyData;

    // Ordenar por dificuldade
    let sortedQuestions;
    if (hasDifficultyData) {
      sortedQuestions = [...questions].sort((a, b) => {
        if (a.difficulty !== null && b.difficulty !== null) {
          return a.difficulty - b.difficulty;
        }
        if (a.difficulty !== null) return -1;
        if (b.difficulty !== null) return 1;
        return a.originalPosition - b.originalPosition;
      });
    } else {
      // Se não há dados de dificuldade, manter ordem da prova
      sortedQuestions = questions;
    }

    const pattern = sortedQuestions
      .map((q) => {
        if (q.cancelled) return "C"; // C para cancelled (anulada)
        return q.isCorrect ? "1" : "0";
      })
      .join("");

    return `
      <div class="difficulty-pattern">
        <h5>${
          hasDifficultyData
            ? "Padrão Ordenado por Dificuldade (Fácil → Difícil)"
            : "Padrão na Ordem da Prova"
        }</h5>
        <div class="pattern-string">
          ${pattern
            .split("")
            .map((bit) => `<span class="bit bit-${bit}">${bit}</span>`)
            .join("")}
        </div>
        <small>${
          hasDifficultyData
            ? "Questões ordenadas da mais fácil para a mais difícil com base nos metadados (C=anulada, 1=acerto, 0=erro)"
            : "Padrão na ordem que as questões apareceram na prova (C=anulada, 1=acerto, 0=erro)"
        }</small>
      </div>
    `;
  }

  renderDifficultyTable(difficultyData) {
    const { questions, hasDifficultyData } = difficultyData;

    // Ordenar questões por dificuldade para exibir na tabela
    let sortedQuestions;
    if (hasDifficultyData) {
      sortedQuestions = [...questions].sort((a, b) => {
        if (a.difficulty !== null && b.difficulty !== null) {
          return a.difficulty - b.difficulty; // Ordem crescente (mais fácil primeiro)
        }
        if (a.difficulty !== null) return -1;
        if (b.difficulty !== null) return 1;
        return a.originalPosition - b.originalPosition;
      });
    } else {
      // Se não há dados de dificuldade, manter ordem da prova
      sortedQuestions = questions;
    }

    let html = `
      <div class="difficulty-table">
        <h5>Detalhamento das Questões ${
          hasDifficultyData ? "(Ordenadas por Dificuldade)" : ""
        }</h5>
        <div class="table-responsive">
          <table class="difficulty-questions-table">
            <thead>
              <tr>
                <th>Questão</th>
                <th>${hasDifficultyData ? "Dificuldade (TRI)" : "Posição"}</th>
                <th>Nível</th>
                <th>Área</th>
                <th>Sua Resposta</th>
                <th>Gabarito</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    sortedQuestions.forEach((question) => {
      const statusClass = question.isCorrect
        ? "answer-correct"
        : "answer-wrong";
      const status = question.isCorrect ? "Correto" : "Incorreto";

      html += `
        <tr class="${statusClass}">
          <td>${question.questionNumber}</td>
          <td>
            ${
              hasDifficultyData
                ? question.difficulty !== null
                  ? `${Math.round(question.difficulty)}`
                  : "N/A"
                : question.difficultyLevel
            }
          </td>
          <td>${question.difficultyLevel}</td>
          <td>${question.area}</td>
          <td>${question.userAnswer}</td>
          <td>${question.correctAnswer}</td>
          <td>${status}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
        ${
          hasDifficultyData
            ? `
          <div class="difficulty-legend">
            <small><strong>Escala TRI:</strong> Muito fácil (<550), Fácil (550-649), Média (650-749), Difícil (750-849), Muito difícil (≥850)</small>
          </div>
        `
            : ""
        }
      </div>
    `;

    return html;
  }

  setupDifficultyFilters() {
    const filterButtons = document.querySelectorAll(".difficulty-filter-btn");
    const difficultyViews = document.querySelectorAll(".difficulty-view");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetArea = button.dataset.area;

        // Remover active de todos os botões
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Mostrar/esconder views apropriadas
        difficultyViews.forEach((view) => {
          const viewArea = view.dataset.difficultyView;
          if (viewArea === targetArea) {
            view.style.display = "block";
          } else {
            view.style.display = "none";
          }
        });
      });
    });
  }
}
