// Controlador para as abas de resultados
export class ResultsTabsController {
  constructor(app) {
    this.app = app;
    this.currentTab = "geral";
    this.resultsData = null;

    this.init();
  }

  init() {
    this.setupTabListeners();
  }

  setupTabListeners() {
    // Event delegation para os botões das abas
    document.addEventListener("click", (e) => {
      if (e.target.closest(".tab-button")) {
        const button = e.target.closest(".tab-button");
        const tabName = button.dataset.tab;
        this.switchTab(tabName);
      }
    });
  }

  switchTab(tabName) {
    // Remover active de todos os botões e painéis
    document.querySelectorAll(".tab-button").forEach((btn) => {
      btn.classList.remove("active");
    });

    document.querySelectorAll(".tab-panel").forEach((panel) => {
      panel.classList.remove("active");
    });

    // Ativar o botão e painel atual
    const activeButton = document.querySelector(`[data-tab="${tabName}"]`);
    const activePanel = document.getElementById(`tab-${tabName}`);

    if (activeButton && activePanel) {
      activeButton.classList.add("active");
      activePanel.classList.add("active");
      this.currentTab = tabName;

      // Renderizar conteúdo específico da aba se necessário
      this.renderTabContent(tabName);
    }
  }

  renderTabContent(tabName) {
    if (!this.resultsData) return;

    switch (tabName) {
      case "geral":
        this.renderGeneralTab();
        break;
      case "areas":
        this.renderAreasTab();
        break;
      case "dificuldade":
        this.renderDifficultyTab();
        break;
      case "padroes":
        this.renderPatternsTab();
        break;
      case "gabarito":
        this.renderAnswerSheetTab();
        break;
      // 'habilidades' já é renderizada pelo SkillsReportCalculator
    }
  }

  updateResults(resultsData) {
    this.resultsData = resultsData;

    // Renderizar conteúdo da aba atual
    this.renderTabContent(this.currentTab);
  }

  renderGeneralTab() {
    const container = document.getElementById("general-stats-content");
    if (!container) return;

    const { areaPatterns, examOrderPattern } = this.app.resultsCalculator;

    let html = `
      <div class="general-overview">
        <div class="stat-grid">
          <div class="stat-card">
            <h4><i class="fa fa-chart-line"></i> Padrão Geral</h4>
            <p class="pattern-preview">${examOrderPattern}</p>
            <small>Sequência de acertos (1) e erros (0)</small>
          </div>
          
          <div class="stat-card">
            <h4><i class="fa fa-percentage"></i> Taxa de Acerto</h4>
            <p class="percentage-big">${this.resultsData.performance}%</p>
            <small>${this.resultsData.correctAnswers} de ${
      this.resultsData.totalQuestions
    } questões</small>
            ${
              this.resultsData.cancelledQuestions > 0
                ? `<small class="cancelled-info">(incluindo ${this.resultsData.cancelledQuestions} questões anuladas)</small>`
                : ""
            }
          </div>
          
          <div class="stat-card">
            <h4><i class="fa fa-layer-group"></i> Áreas Avaliadas</h4>
            <p class="areas-count">${
              Object.keys(areaPatterns).filter(
                (area) => areaPatterns[area].length > 0
              ).length
            }</p>
            <small>Diferentes áreas do conhecimento</small>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  renderAreasTab() {
    const container = document.getElementById("areas-container");
    if (!container) return;

    // Obter questões e respostas
    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();

    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };

    // Agrupar questões por área na ordem da prova
    const areaData = {};

    questions.forEach((question, examIndex) => {
      const area = question.area;
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

      if (!areaData[area]) {
        areaData[area] = {
          correct: 0,
          total: 0,
          pattern: [],
          questions: [],
        };
      }

      areaData[area].total++;
      if (isCorrect) {
        areaData[area].correct++;
      }

      // Adicionar ao padrão na ordem da prova
      areaData[area].pattern.push(isCorrect ? "1" : "0");

      // Adicionar questão para visualização detalhada
      areaData[area].questions.push({
        questionNumber: examIndex + 1,
        originalPosition: question.originalPosition || question.position,
        isCorrect: isCorrect,
        userAnswer: userAnswer || "-",
        correctAnswer: correctAnswer,
      });
    });

    const availableAreas = Object.keys(areaData).filter(
      (area) => areaData[area].total > 0
    );

    let html = "";

    // Se há múltiplas áreas, adicionar sub-navegação
    if (availableAreas.length > 1) {
      html += `
        <div class="areas-sub-nav">
          <button class="area-filter-btn active" data-area="all">
            <i class="fa fa-layer-group"></i> Todas as Áreas
          </button>
          ${availableAreas
            .map(
              (area) => `
            <button class="area-filter-btn" data-area="${area}">
              <i class="fa fa-chart-bar"></i> ${areaNames[area] || area}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    html += '<div class="areas-content">';

    // Visão geral (todas as áreas)
    html += '<div class="area-view" data-area-view="all">';
    html += '<div class="areas-grid">';

    for (const [area, data] of Object.entries(areaData)) {
      if (data.total === 0) continue;

      const percentage = Math.round((data.correct / data.total) * 100);
      const patternString = data.pattern.join("");

      html += `
        <div class="area-card">
          <h4>${areaNames[area] || area}</h4>
          <div class="area-stats">
            <span>${data.correct}/${data.total} questões</span>
            <span class="area-percentage">${percentage}%</span>
          </div>
          <div class="pattern-mini" title="Padrão de acertos na ordem da prova">
            ${patternString
              .split("")
              .map((bit) => `<span class="bit bit-${bit}">${bit}</span>`)
              .join("")}
          </div>
        </div>
      `;
    }

    html += "</div>";
    html += "</div>";

    // Visões individuais por área
    if (availableAreas.length > 1) {
      availableAreas.forEach((area) => {
        const data = areaData[area];
        const percentage = Math.round((data.correct / data.total) * 100);
        const patternString = data.pattern.join("");

        html += `
          <div class="area-view" data-area-view="${area}" style="display: none;">
            <div class="area-detailed-view">
              <div class="area-header">
                <h4><i class="fa fa-chart-bar"></i> ${
                  areaNames[area] || area
                }</h4>
                <div class="area-summary">
                  <span class="summary-item">
                    <strong>${data.correct}/${
          data.total
        }</strong> questões corretas
                  </span>
                  <span class="summary-item">
                    <strong>${percentage}%</strong> de aproveitamento
                  </span>
                </div>
              </div>
              
              <div class="area-pattern-section">
                <h5>Padrão de Acertos</h5>
                <div class="pattern-display">
                  ${patternString
                    .split("")
                    .map(
                      (bit, index) => `
                      <span class="bit bit-${bit}" title="Questão ${
                        data.questions[index].questionNumber
                      }: ${bit === "1" ? "Correto" : "Incorreto"}">
                        ${bit}
                      </span>
                    `
                    )
                    .join("")}
                </div>
                <small>Sequência na ordem da prova (1=acerto, 0=erro)</small>
              </div>
              
              <div class="area-questions-table">
                <h5>Questões Detalhadas</h5>
                <div class="table-responsive">
                  <table class="area-table">
                    <thead>
                      <tr>
                        <th>Questão</th>
                        <th>Sua Resposta</th>
                        <th>Gabarito</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${data.questions
                        .map((question) => {
                          const statusClass = question.isCorrect
                            ? "answer-correct"
                            : "answer-wrong";
                          const status = question.isCorrect
                            ? "Correto"
                            : "Incorreto";

                          return `
                          <tr class="${statusClass}">
                            <td>${question.questionNumber}</td>
                            <td>${question.userAnswer}</td>
                            <td>${question.correctAnswer}</td>
                            <td>${status}</td>
                          </tr>
                        `;
                        })
                        .join("")}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        `;
      });
    }

    html += "</div>";

    container.innerHTML = html;

    // Adicionar event listeners para a sub-navegação
    if (availableAreas.length > 1) {
      this.setupAreaFilters();
    }
  }

  setupAreaFilters() {
    const filterButtons = document.querySelectorAll(".area-filter-btn");
    const areaViews = document.querySelectorAll(".area-view");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetArea = button.dataset.area;

        // Remover active de todos os botões
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Mostrar/esconder views apropriadas
        areaViews.forEach((view) => {
          const viewArea = view.dataset.areaView;
          if (viewArea === targetArea) {
            view.style.display = "block";
          } else {
            view.style.display = "none";
          }
        });
      });
    });
  }

  renderDifficultyTab() {
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
      if (
        meta[config.year] &&
        meta[config.year][question.area] &&
        meta[config.year][question.area][
          question.originalPosition || question.position
        ]
      ) {
        const metaData =
          meta[config.year][question.area][
            question.originalPosition || question.position
          ]; // Calcular dificuldade usando parâmetros da TRI: 100*B + 500
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

        if (position <= totalQuestions * 0.3)
          difficultyLevel = "Início da Prova";
        else if (position <= totalQuestions * 0.7)
          difficultyLevel = "Meio da Prova";
        else difficultyLevel = "Fim da Prova";
      }

      questionsWithDifficulty.push({
        questionNumber: examIndex + 1,
        originalPosition: question.originalPosition || question.position,
        area: question.area,
        difficulty: difficulty,
        difficultyLevel: difficultyLevel,
        isCorrect: isCorrect,
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
      .map((q) => (q.isCorrect ? "1" : "0"))
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
            ? "Questões ordenadas da mais fácil para a mais difícil com base nos metadados"
            : "Padrão na ordem que as questões apareceram na prova"
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

  renderPatternsTab() {
    const container = document.getElementById("patterns-container");
    if (!container) return;

    const calculator = this.app.resultsCalculator;

    const patterns = [
      {
        id: "exam",
        name: "Ordem da Prova",
        icon: "fa-list-ol",
        pattern: calculator.examOrderPattern,
        description: "Sequência como você viu no exame",
      },
      {
        id: "original",
        name: "Ordem Original",
        icon: "fa-sort-numeric-up",
        pattern: calculator.originalOrderPattern,
        description: "Questões ordenadas por numeração original",
      },
      {
        id: "difficulty",
        name: "Por Dificuldade",
        icon: "fa-signal",
        pattern: calculator.difficultyOrderPattern,
        description: "Da questão mais fácil para a mais difícil",
      },
      {
        id: "discrimination",
        name: "Por Discriminação",
        icon: "fa-chart-line",
        pattern: calculator.discriminationOrderPattern,
        description: "Da menor para a maior capacidade de discriminação",
      },
    ];

    let html = `
      <div class="patterns-sub-nav">
        <button class="pattern-filter-btn active" data-pattern="all">
          <i class="fa fa-th-list"></i> Todos os Padrões
        </button>
        ${patterns
          .map(
            (pattern) => `
          <button class="pattern-filter-btn" data-pattern="${pattern.id}">
            <i class="fa ${pattern.icon}"></i> ${pattern.name}
          </button>
        `
          )
          .join("")}
      </div>
      
      <div class="patterns-content">
        <!-- Visão geral -->
        <div class="pattern-view" data-pattern-view="all">
          <div class="patterns-list">
            ${patterns
              .map(
                (pattern) => `
              <div class="pattern-item">
                <span class="pattern-label">
                  <i class="fa ${pattern.icon}"></i> ${pattern.name}:
                </span>
                <div class="pattern-string">${pattern.pattern}</div>
                <small class="pattern-description">${pattern.description}</small>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="patterns-info">
            <h4><i class="fa fa-info-circle"></i> Como Interpretar</h4>
            <ul>
              <li><strong>1:</strong> Resposta correta</li>
              <li><strong>0:</strong> Resposta incorreta</li>
              <li>Cada padrão oferece uma perspectiva diferente do seu desempenho</li>
              <li>Compare os padrões para identificar tendências e áreas de melhoria</li>
            </ul>
          </div>
        </div>
        
        <!-- Visões individuais -->
        ${patterns
          .map(
            (pattern) => `
          <div class="pattern-view" data-pattern-view="${
            pattern.id
          }" style="display: none;">
            <div class="pattern-detailed-view">
              <div class="pattern-header">
                <h4><i class="fa ${pattern.icon}"></i> ${pattern.name}</h4>
                <p class="pattern-subtitle">${pattern.description}</p>
              </div>
              
              <div class="pattern-display-large">
                <h5>Padrão Completo</h5>
                <div class="pattern-string-large">
                  ${pattern.pattern
                    .split("")
                    .map(
                      (bit, index) => `
                    <span class="bit bit-${bit}" title="Questão ${index + 1}: ${
                        bit === "1" ? "Correto" : "Incorreto"
                      }">
                      ${bit}
                    </span>
                  `
                    )
                    .join("")}
                </div>
                <div class="pattern-stats">
                  <span class="stat-item">
                    <strong>Acertos:</strong> ${
                      pattern.pattern.split("1").length - 1
                    }
                  </span>
                  <span class="stat-item">
                    <strong>Erros:</strong> ${
                      pattern.pattern.split("0").length - 1
                    }
                  </span>
                  <span class="stat-item">
                    <strong>Total:</strong> ${pattern.pattern.length} questões
                  </span>
                </div>
              </div>
              
              <div class="pattern-analysis">
                <h5>Análise do Padrão</h5>
                ${this.analyzePattern(pattern.pattern, pattern.name)}
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `;

    container.innerHTML = html;
    this.setupPatternFilters();
  }

  analyzePattern(pattern, patternName) {
    const correct = pattern.split("1").length - 1;
    const total = pattern.length;
    const percentage = Math.round((correct / total) * 100);

    // Análise de sequências
    const correctStreaks = [];
    const wrongStreaks = [];
    let currentStreak = 1;
    let currentBit = pattern[0];

    for (let i = 1; i < pattern.length; i++) {
      if (pattern[i] === currentBit) {
        currentStreak++;
      } else {
        if (currentBit === "1") {
          correctStreaks.push(currentStreak);
        } else {
          wrongStreaks.push(currentStreak);
        }
        currentBit = pattern[i];
        currentStreak = 1;
      }
    }

    // Adicionar última sequência
    if (currentBit === "1") {
      correctStreaks.push(currentStreak);
    } else {
      wrongStreaks.push(currentStreak);
    }

    const maxCorrectStreak =
      correctStreaks.length > 0 ? Math.max(...correctStreaks) : 0;
    const maxWrongStreak =
      wrongStreaks.length > 0 ? Math.max(...wrongStreaks) : 0;

    let analysis = `
      <div class="analysis-cards">
        <div class="analysis-card">
          <h6>Performance Geral</h6>
          <p><strong>${percentage}%</strong> de aproveitamento</p>
          <p>${correct} acertos de ${total} questões</p>
        </div>
        
        <div class="analysis-card">
          <h6>Maior Sequência de Acertos</h6>
          <p><strong>${maxCorrectStreak}</strong> questões consecutivas</p>
        </div>
        
        <div class="analysis-card">
          <h6>Maior Sequência de Erros</h6>
          <p><strong>${maxWrongStreak}</strong> questões consecutivas</p>
        </div>
      </div>
    `;

    // Análise específica por tipo de padrão
    if (patternName === "Ordem da Prova") {
      analysis += `
        <div class="pattern-insights">
          <h6>Insights</h6>
          <p>Este padrão mostra seu desempenho na ordem que você respondeu as questões durante a prova.</p>
          ${
            percentage < 50
              ? '<p class="warning">⚠️ Considere revisar sua estratégia de resolução da prova.</p>'
              : ""
          }
        </div>
      `;
    } else if (patternName === "Por Dificuldade") {
      analysis += `
        <div class="pattern-insights">
          <h6>Insights</h6>
          <p>Este padrão ordena as questões da mais fácil para a mais difícil.</p>
          ${
            pattern.substring(0, Math.floor(total * 0.3)).includes("0")
              ? '<p class="warning">⚠️ Você errou algumas questões fáceis. Foque na atenção e revisão.</p>'
              : '<p class="success">✅ Bom aproveitamento nas questões mais fáceis!</p>'
          }
        </div>
      `;
    }

    return analysis;
  }

  setupPatternFilters() {
    const filterButtons = document.querySelectorAll(".pattern-filter-btn");
    const patternViews = document.querySelectorAll(".pattern-view");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetPattern = button.dataset.pattern;

        // Remover active de todos os botões
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Mostrar/esconder views apropriadas
        patternViews.forEach((view) => {
          const viewPattern = view.dataset.patternView;
          if (viewPattern === targetPattern) {
            view.style.display = "block";
          } else {
            view.style.display = "none";
          }
        });
      });
    });
  }

  renderAnswerSheetTab() {
    const container = document.getElementById("answer-sheet-container");
    if (!container) return;

    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();

    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };

    // Obter áreas disponíveis
    const availableAreas = [...new Set(questions.map((q) => q.area))];

    let html = "";

    // Se há múltiplas áreas, adicionar sub-navegação
    if (availableAreas.length > 1) {
      html += `
        <div class="answer-sheet-sub-nav">
          <button class="answer-sheet-filter-btn active" data-area="all">
            <i class="fa fa-list"></i> Todas as Áreas
          </button>
          ${availableAreas
            .map(
              (area) => `
            <button class="answer-sheet-filter-btn" data-area="${area}">
              <i class="fa fa-chart-bar"></i> ${areaNames[area] || area}
            </button>
          `
            )
            .join("")}
        </div>
      `;
    }

    html += '<div class="answer-sheet-content">';

    // Visão geral (todas as áreas)
    html += '<div class="answer-sheet-view" data-sheet-view="all">';
    html += this.renderAnswerSheetTable(
      questions,
      answers,
      "Todas as Questões"
    );
    html += "</div>";

    // Visões por área
    if (availableAreas.length > 1) {
      availableAreas.forEach((area) => {
        const areaQuestions = questions.filter((q) => q.area === area);
        html += `
          <div class="answer-sheet-view" data-sheet-view="${area}" style="display: none;">
            ${this.renderAnswerSheetTable(
              areaQuestions,
              answers,
              areaNames[area] || area
            )}
          </div>
        `;
      });
    }

    html += "</div>";

    container.innerHTML = html;

    // Configurar filtros se necessário
    if (availableAreas.length > 1) {
      this.setupAnswerSheetFilters();
    }
  }

  renderAnswerSheetTable(questions, answers, title) {
    let html = `
      <div class="answer-sheet">
        <div class="answer-sheet-header">
          <h4><i class="fa fa-clipboard-list"></i> ${title}</h4>
          <span class="question-count">${questions.length} questões</span>
        </div>
        <div class="table-responsive">
          <table class="answer-table">
            <thead>
              <tr>
                <th>Questão</th>
                <th>Sua Resposta</th>
                <th>Gabarito</th>
                <th>Status</th>
                <th>Área</th>
              </tr>
            </thead>
            <tbody>
    `;

    questions.forEach((question, index) => {
      const questionNum = questions.findIndex((q) => q === question) + 1;
      const userAnswer = answers[question.position] || "-";
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);

      let status = "Não respondida";
      let statusClass = "answer-not-answered";

      if (userAnswer !== "-") {
        if (question.cancelled) {
          // Para questões anuladas, qualquer resposta é considerada correta
          status = "Correto (Anulada)";
          statusClass = "answer-correct";
        } else if (userAnswer === correctAnswer) {
          status = "Correto";
          statusClass = "answer-correct";
        } else {
          status = "Incorreto";
          statusClass = "answer-wrong";
        }
      } else if (question.cancelled) {
        status = "Não respondida (Anulada)";
        statusClass = "answer-not-answered";
      }

      html += `
        <tr class="${statusClass}">
          <td>${
            this.app.getQuestions().findIndex((q) => q === question) + 1
          }</td>
          <td>${userAnswer}</td>
          <td>${correctAnswer}</td>
          <td>${status}</td>
          <td>${question.area}</td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    return html;
  }

  setupAnswerSheetFilters() {
    const filterButtons = document.querySelectorAll(".answer-sheet-filter-btn");
    const sheetViews = document.querySelectorAll(".answer-sheet-view");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetArea = button.dataset.area;

        // Remover active de todos os botões
        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        // Mostrar/esconder views apropriadas
        sheetViews.forEach((view) => {
          const viewArea = view.dataset.sheetView;
          if (viewArea === targetArea) {
            view.style.display = "block";
          } else {
            view.style.display = "none";
          }
        });
      });
    });
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

  renderLegendTab() {
    const container = document.getElementById("legend-container");
    if (!container) return;

    const meta = this.app.getMeta();
    const config = this.app.getCurrentConfig();

    let html = `
      <div class="legend-content">
        <h4><i class="fa fa-info-circle"></i> Legenda</h4>
        <div class="legend-section">
          <h5><i class="fa fa-chart-pie"></i> Desempenho Geral</h5>
          <div class="legend-item">
            <span class="legend-color correct"></span>
            <span class="legend-label">Correto</span>
          </div>
          <div class="legend-item">
            <span class="legend-color wrong"></span>
            <span class="legend-label">Incorreto</span>
          </div>
          <div class="legend-item">
            <span class="legend-color not-answered"></span>
            <span class="legend-label">Não Respondida</span>
          </div>
        </div>
        
        <div class="legend-section">
          <h5><i class="fa fa-signal"></i> Nível de Dificuldade</h5>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #d1e7dd;"></span>
            <span class="legend-label">Muito fácil</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #cfe2ff;"></span>
            <span class="legend-label">Fácil</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #fff3cd;"></span>
            <span class="legend-label">Média</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #f8d7da;"></span>
            <span class="legend-label">Difícil</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #f5c6cb;"></span>
            <span class="legend-label">Muito difícil</span>
          </div>
        </div>
        
        <div class="legend-section">
          <h5><i class="fa fa-layer-group"></i> Áreas do Conhecimento</h5>
          ${Object.keys(meta[config.year])
            .map(
              (area) => `
            <div class="legend-item">
              <span class="legend-color" style="background-color: ${this.getAreaColor(
                area
              )};"></span>
              <span class="legend-label">${area}</span>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  getAreaColor(area) {
    const colors = {
      LC0: "#d1e7dd",
      LC1: "#cfe2ff",
      CH: "#fff3cd",
      CN: "#f8d7da",
      MT: "#f5c6cb",
    };

    return colors[area] || "#e2e3e5";
  }
}
