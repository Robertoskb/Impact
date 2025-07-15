import { BaseTabRenderer } from "./BaseTabRenderer.js";

// Renderizador para a aba de áreas
export class AreasTabRenderer extends BaseTabRenderer {
  render() {
    const container = document.getElementById("areas-container");
    if (!container) return;

    const { questions, answers } = this.getQuestionsAndAnswers();
    const areaNames = this.getAreaNames();
    const areaData = this.processAreaData(questions, answers);
    const availableAreas = Object.keys(areaData).filter(
      (area) => areaData[area].total > 0
    );

    let html = this.renderSubNavigation(availableAreas, areaNames);
    html += '<div class="areas-content">';
    html += this.renderOverview(areaData, areaNames);
    html += this.renderDetailedViews(availableAreas, areaData, areaNames);
    html += "</div>";

    container.innerHTML = html;

    if (availableAreas.length > 1) {
      this.setupAreaFilters();
    }
  }

  processAreaData(questions, answers) {
    const areaData = {};

    questions.forEach((question, examIndex) => {
      const area = question.area;
      const userAnswer = answers[question.position];
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);
      const isCorrect = this.isCorrectAnswer(
        question,
        userAnswer,
        correctAnswer
      );

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

      // Adicionar ao padrão: C para anulada, 1 para acerto, 0 para erro
      if (question.cancelled) {
        areaData[area].pattern.push("C");
      } else {
        areaData[area].pattern.push(isCorrect ? "1" : "0");
      }
      
      areaData[area].questions.push({
        questionNumber: examIndex + 1,
        originalPosition: question.originalPosition,
        isCorrect: isCorrect,
        userAnswer: userAnswer || "-",
        correctAnswer: correctAnswer,
        cancelled: question.cancelled,
      });
    });

    return areaData;
  }

  renderSubNavigation(availableAreas, areaNames) {
    if (availableAreas.length <= 1) return "";

    return `
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

  renderOverview(areaData, areaNames) {
    let html = '<div class="area-view" data-area-view="all">';
    html += '<div class="areas-grid">';

    for (const [area, data] of Object.entries(areaData)) {
      if (data.total === 0) continue;

      const percentage = this.calculatePercentage(data.correct, data.total);
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
    return html;
  }

  renderDetailedViews(availableAreas, areaData, areaNames) {
    if (availableAreas.length <= 1) return "";

    let html = "";

    availableAreas.forEach((area) => {
      const data = areaData[area];
      const percentage = this.calculatePercentage(data.correct, data.total);
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
            
            ${this.renderAreaPattern(patternString, data.questions)}
            ${this.renderAreaTable(data.questions)}
          </div>
        </div>
      `;
    });

    return html;
  }

  renderAreaPattern(patternString, questions) {
    return `
      <div class="area-pattern-section">
        <h5>Padrão de Acertos</h5>
        <div class="pattern-display">
          ${patternString
            .split("")
            .map(
              (bit, index) => {
                const question = questions[index];
                let title, status;
                if (bit === "C") {
                  title = `Questão ${question.questionNumber}: Anulada`;
                  status = "Anulada";
                } else if (bit === "1") {
                  title = `Questão ${question.questionNumber}: Correto`;
                  status = "Correto";
                } else {
                  title = `Questão ${question.questionNumber}: Incorreto`;
                  status = "Incorreto";
                }
                
                return `
                  <span class="bit bit-${bit}" title="${title}">
                    ${bit}
                  </span>
                `;
              }
            )
            .join("")}
        </div>
        <small>Sequência na ordem da prova (C=anulada, 1=acerto, 0=erro)</small>
      </div>
    `;
  }

  renderAreaTable(questions) {
    return `
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
              ${questions
                .map((question) => {
                  const statusClass = question.isCorrect
                    ? "answer-correct"
                    : "answer-wrong";
                  const status = question.isCorrect ? "Correto" : "Incorreto";

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
    `;
  }

  setupAreaFilters() {
    const filterButtons = document.querySelectorAll(".area-filter-btn");
    const areaViews = document.querySelectorAll(".area-view");

    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetArea = button.dataset.area;

        filterButtons.forEach((btn) => btn.classList.remove("active"));
        button.classList.add("active");

        areaViews.forEach((view) => {
          const viewArea = view.dataset.areaView;
          view.style.display = viewArea === targetArea ? "block" : "none";
        });
      });
    });
  }
}
