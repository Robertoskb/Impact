import { BaseTabRenderer } from "./BaseTabRenderer.js";

export class AnswerSheetTabRenderer extends BaseTabRenderer {
  constructor(app) {
    super(app);
  }

  render() {
    const container = document.getElementById("answer-sheet-container");
    if (!container) return;

    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();

    container.innerHTML = this.renderAnswerSheetTable(questions, answers);
  }

  renderAnswerSheetTable(questions, answers) {
    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };

    let html = `
      <div class="answer-sheet">
        <h4><i class="fa fa-clipboard-list"></i> Cartão de Respostas</h4>
        <div class="table-responsive">
          <table class="answer-sheet-table">
            <thead>
              <tr>
                <th>Questão</th>
                <th>Área</th>
                <th>Sua Resposta</th>
                <th>Gabarito</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
    `;

    questions.forEach((question, index) => {
      const userAnswer = answers[question.position];
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);

      // Determinar se a resposta está correta
      let isCorrect = false;
      let status = "";
      let statusClass = "";

      if (question.cancelled) {
        // Para questões anuladas, considera correto se o usuário respondeu
        isCorrect = userAnswer !== undefined && userAnswer !== null;
        status = isCorrect
          ? "Anulada (Respondida)"
          : "Anulada (Não Respondida)";
        statusClass = isCorrect
          ? "answer-cancelled-answered"
          : "answer-cancelled";
      } else {
        // Para questões não anuladas, compara com o gabarito
        isCorrect = userAnswer === correctAnswer;
        if (!userAnswer) {
          status = "Não Respondida";
          statusClass = "answer-blank";
        } else if (isCorrect) {
          status = "Correto";
          statusClass = "answer-correct";
        } else {
          status = "Incorreto";
          statusClass = "answer-wrong";
        }
      }

      html += `
        <tr class="${statusClass}">
          <td>${question.position}</td>
          <td>${areaNames[question.area] || question.area}</td>
          <td class="answer-cell">
            ${userAnswer || "-"}
          </td>
          <td class="answer-cell">
            ${question.cancelled ? "X" : correctAnswer}
          </td>
          <td>
            <span class="status-badge ${statusClass}">
              ${status}
            </span>
          </td>
        </tr>
      `;
    });

    html += `
            </tbody>
          </table>
        </div>
        
        <div class="answer-sheet-summary">
          ${this.renderAnswerSheetSummary(questions, answers)}
        </div>
      </div>
    `;

    return html;
  }

  renderAnswerSheetSummary(questions, answers) {
    let correct = 0;
    let incorrect = 0;
    let blank = 0;
    let cancelledAnswered = 0;
    let cancelledBlank = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question.position];
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);

      if (question.cancelled) {
        if (userAnswer !== undefined && userAnswer !== null) {
          cancelledAnswered++;
          correct++; // Questões anuladas respondidas contam como corretas
        } else {
          cancelledBlank++;
        }
      } else {
        if (!userAnswer) {
          blank++;
        } else if (userAnswer === correctAnswer) {
          correct++;
        } else {
          incorrect++;
        }
      }
    });

    const total = questions.length;
    const answered = total - blank - cancelledBlank;
    const accuracy =
      answered > 0 ? ((correct / total) * 100).toFixed(1) : "0.0";

    return `
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-number correct">${correct}</div>
          <div class="summary-label">Corretas</div>
        </div>
        <div class="summary-item">
          <div class="summary-number incorrect">${incorrect}</div>
          <div class="summary-label">Incorretas</div>
        </div>
        <div class="summary-item">
          <div class="summary-number blank">${blank + cancelledBlank}</div>
          <div class="summary-label">Não Respondidas</div>
        </div>
        <div class="summary-item">
          <div class="summary-number accuracy">${accuracy}%</div>
          <div class="summary-label">Taxa de Acerto</div>
        </div>
        ${
          cancelledAnswered > 0 || cancelledBlank > 0
            ? `
        <div class="summary-item cancelled">
          <div class="summary-number">${
            cancelledAnswered + cancelledBlank
          }</div>
          <div class="summary-label">Anuladas</div>
          <div class="summary-detail">
            ${cancelledAnswered} respondidas, ${cancelledBlank} em branco
          </div>
        </div>
        `
            : ""
        }
      </div>
    `;
  }
}
