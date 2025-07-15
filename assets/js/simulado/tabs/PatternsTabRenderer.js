import { BaseTabRenderer } from "./BaseTabRenderer.js";

export class PatternsTabRenderer extends BaseTabRenderer {
  constructor(app) {
    super(app);
  }

  render() {
    const container = document.getElementById("patterns-container");
    if (!container) return;

    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();

    // Obter string de respostas
    const answerString = this.getAnswerString(questions, answers);

    let html = `
      <div class="patterns-analysis">
        <h4><i class="fa fa-search"></i> Análise de Padrões</h4>
        
        <div class="pattern-overview">
          <div class="pattern-display">
            <h5>String de Respostas</h5>
            <div class="answer-pattern">
              ${answerString
                .split("")
                .map((bit, index) => {
                  const questionNum = index + 1;
                  return `<span class="bit bit-${bit}" title="Questão ${questionNum}: ${
                    bit === "1" ? "Correta" : "Incorreta"
                  }">${bit}</span>`;
                })
                .join("")}
            </div>
          </div>
        </div>

        <div class="patterns-grid">
          ${this.renderSequencePatterns(answerString)}
          ${this.renderOptionFrequency(questions, answers)}
          ${this.renderTemporalPatterns(answerString)}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  getAnswerString(questions, answers) {
    return questions
      .map((question) => {
        const userAnswer = answers[question.position];
        const correctAnswer =
          this.app.questionGenerator.getCorrectAnswer(question);

        let isCorrect = false;
        if (question.cancelled) {
          // Para questões anuladas, considera correto se o usuário respondeu
          isCorrect = userAnswer !== undefined && userAnswer !== null;
        } else {
          // Para questões não anuladas, compara com o gabarito
          isCorrect = userAnswer === correctAnswer;
        }

        return isCorrect ? "1" : "0";
      })
      .join("");
  }

  renderSequencePatterns(answerString) {
    // Analisar sequências de acertos e erros
    const sequences = this.analyzeSequences(answerString);

    return `
      <div class="pattern-card">
        <h5><i class="fa fa-chart-line"></i> Sequências</h5>
        
        <div class="sequence-stats">
          <div class="stat-item">
            <strong>Maior sequência de acertos:</strong>
            <span class="stat-value correct">${
              sequences.maxCorrectStreak
            }</span>
          </div>
          <div class="stat-item">
            <strong>Maior sequência de erros:</strong>
            <span class="stat-value incorrect">${
              sequences.maxIncorrectStreak
            }</span>
          </div>
          <div class="stat-item">
            <strong>Alternâncias:</strong>
            <span class="stat-value">${sequences.alternations}</span>
          </div>
        </div>

        <div class="sequence-details">
          <h6>Sequências Notáveis</h6>
          ${this.renderNotableSequences(sequences)}
        </div>
      </div>
    `;
  }

  analyzeSequences(answerString) {
    let maxCorrectStreak = 0;
    let maxIncorrectStreak = 0;
    let currentCorrectStreak = 0;
    let currentIncorrectStreak = 0;
    let alternations = 0;
    let lastBit = null;

    const correctStreaks = [];
    const incorrectStreaks = [];

    for (let i = 0; i < answerString.length; i++) {
      const bit = answerString[i];

      if (lastBit !== null && lastBit !== bit) {
        alternations++;
      }

      if (bit === "1") {
        if (currentIncorrectStreak > 0) {
          incorrectStreaks.push({
            length: currentIncorrectStreak,
            start: i - currentIncorrectStreak,
            end: i - 1,
          });
          currentIncorrectStreak = 0;
        }
        currentCorrectStreak++;
        maxCorrectStreak = Math.max(maxCorrectStreak, currentCorrectStreak);
      } else {
        if (currentCorrectStreak > 0) {
          correctStreaks.push({
            length: currentCorrectStreak,
            start: i - currentCorrectStreak,
            end: i - 1,
          });
          currentCorrectStreak = 0;
        }
        currentIncorrectStreak++;
        maxIncorrectStreak = Math.max(
          maxIncorrectStreak,
          currentIncorrectStreak
        );
      }

      lastBit = bit;
    }

    // Finalizar última sequência
    if (currentCorrectStreak > 0) {
      correctStreaks.push({
        length: currentCorrectStreak,
        start: answerString.length - currentCorrectStreak,
        end: answerString.length - 1,
      });
    }
    if (currentIncorrectStreak > 0) {
      incorrectStreaks.push({
        length: currentIncorrectStreak,
        start: answerString.length - currentIncorrectStreak,
        end: answerString.length - 1,
      });
    }

    return {
      maxCorrectStreak,
      maxIncorrectStreak,
      alternations,
      correctStreaks: correctStreaks.sort((a, b) => b.length - a.length),
      incorrectStreaks: incorrectStreaks.sort((a, b) => b.length - a.length),
    };
  }

  renderNotableSequences(sequences) {
    let html = "";

    // Maiores sequências de acertos
    if (sequences.correctStreaks.length > 0) {
      html += `
        <div class="sequence-group">
          <h6>Maiores Sequências de Acertos</h6>
          ${sequences.correctStreaks
            .slice(0, 3)
            .map(
              (streak) => `
            <div class="sequence-item correct">
              <span>${streak.length} acertos consecutivos</span>
              <small>Questões ${streak.start + 1} - ${streak.end + 1}</small>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    // Maiores sequências de erros
    if (sequences.incorrectStreaks.length > 0) {
      html += `
        <div class="sequence-group">
          <h6>Maiores Sequências de Erros</h6>
          ${sequences.incorrectStreaks
            .slice(0, 3)
            .map(
              (streak) => `
            <div class="sequence-item incorrect">
              <span>${streak.length} erros consecutivos</span>
              <small>Questões ${streak.start + 1} - ${streak.end + 1}</small>
            </div>
          `
            )
            .join("")}
        </div>
      `;
    }

    if (!html) {
      html = "<p>Nenhuma sequência notável encontrada.</p>";
    }

    return html;
  }

  renderOptionFrequency(questions, answers) {
    // Analisar frequência de escolha por alternativa
    const optionFreq = { A: 0, B: 0, C: 0, D: 0, E: 0 };
    let totalAnswered = 0;

    questions.forEach((question) => {
      const userAnswer = answers[question.position];
      if (userAnswer && ["A", "B", "C", "D", "E"].includes(userAnswer)) {
        optionFreq[userAnswer]++;
        totalAnswered++;
      }
    });

    const expectedPercentage = 20; // 20% para cada alternativa

    return `
      <div class="pattern-card">
        <h5><i class="fa fa-chart-pie"></i> Frequência das Alternativas</h5>
        
        <div class="option-frequency">
          ${Object.entries(optionFreq)
            .map(([option, count]) => {
              const percentage =
                totalAnswered > 0 ? (count / totalAnswered) * 100 : 0;
              const deviation = Math.abs(percentage - expectedPercentage);

              return `
                <div class="option-item">
                  <div class="option-label">${option}</div>
                  <div class="option-bar">
                    <div class="option-fill" style="width: ${percentage}%"></div>
                  </div>
                  <div class="option-stats">
                    <span class="option-count">${count}</span>
                    <span class="option-percentage">${percentage.toFixed(
                      1
                    )}%</span>
                    ${
                      deviation > 5
                        ? `<span class="deviation-warning">⚠</span>`
                        : ""
                    }
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
        
        <div class="frequency-analysis">
          <small>
            <strong>Análise:</strong> 
            ${this.analyzeOptionFrequency(optionFreq, totalAnswered)}
          </small>
        </div>
      </div>
    `;
  }

  analyzeOptionFrequency(optionFreq, totalAnswered) {
    if (totalAnswered === 0) return "Nenhuma questão respondida.";

    const expectedCount = totalAnswered / 5;
    const deviations = Object.entries(optionFreq).map(([option, count]) => ({
      option,
      count,
      deviation: Math.abs(count - expectedCount),
      percentage: (count / totalAnswered) * 100,
    }));

    const maxDeviation = Math.max(...deviations.map((d) => d.deviation));

    if (maxDeviation < 2) {
      return "Distribuição equilibrada entre as alternativas.";
    }

    const mostChosen = deviations.reduce((max, current) =>
      current.count > max.count ? current : max
    );

    const leastChosen = deviations.reduce((min, current) =>
      current.count < min.count ? current : min
    );

    let analysis = "";
    if (mostChosen.percentage > 30) {
      analysis += `Tendência a escolher alternativa ${
        mostChosen.option
      } (${mostChosen.percentage.toFixed(1)}%). `;
    }
    if (leastChosen.percentage < 10) {
      analysis += `Alternativa ${
        leastChosen.option
      } raramente escolhida (${leastChosen.percentage.toFixed(1)}%). `;
    }

    return analysis || "Padrão de escolha dentro do esperado.";
  }

  renderTemporalPatterns(answerString) {
    // Analisar padrões temporais (início, meio, fim da prova)
    const thirds = this.analyzeByThirds(answerString);

    return `
      <div class="pattern-card">
        <h5><i class="fa fa-clock"></i> Desempenho Temporal</h5>
        
        <div class="temporal-analysis">
          <div class="third-item">
            <h6>Início da Prova</h6>
            <div class="third-stats">
              <span class="third-score">${thirds.first.correct}/${
      thirds.first.total
    }</span>
              <span class="third-percentage">${thirds.first.percentage.toFixed(
                1
              )}%</span>
            </div>
          </div>
          
          <div class="third-item">
            <h6>Meio da Prova</h6>
            <div class="third-stats">
              <span class="third-score">${thirds.second.correct}/${
      thirds.second.total
    }</span>
              <span class="third-percentage">${thirds.second.percentage.toFixed(
                1
              )}%</span>
            </div>
          </div>
          
          <div class="third-item">
            <h6>Final da Prova</h6>
            <div class="third-stats">
              <span class="third-score">${thirds.third.correct}/${
      thirds.third.total
    }</span>
              <span class="third-percentage">${thirds.third.percentage.toFixed(
                1
              )}%</span>
            </div>
          </div>
        </div>
        
        <div class="temporal-trend">
          <small>
            <strong>Tendência:</strong> 
            ${this.analyzeTrend(thirds)}
          </small>
        </div>
      </div>
    `;
  }

  analyzeByThirds(answerString) {
    const total = answerString.length;
    const thirdSize = Math.ceil(total / 3);

    const first = answerString.slice(0, thirdSize);
    const second = answerString.slice(thirdSize, thirdSize * 2);
    const third = answerString.slice(thirdSize * 2);

    return {
      first: {
        correct: (first.match(/1/g) || []).length,
        total: first.length,
        percentage: ((first.match(/1/g) || []).length / first.length) * 100,
      },
      second: {
        correct: (second.match(/1/g) || []).length,
        total: second.length,
        percentage: ((second.match(/1/g) || []).length / second.length) * 100,
      },
      third: {
        correct: (third.match(/1/g) || []).length,
        total: third.length,
        percentage: ((third.match(/1/g) || []).length / third.length) * 100,
      },
    };
  }

  analyzeTrend(thirds) {
    const percentages = [
      thirds.first.percentage,
      thirds.second.percentage,
      thirds.third.percentage,
    ];

    if (percentages[0] > percentages[1] && percentages[1] > percentages[2]) {
      return "Desempenho decrescente ao longo da prova (possível fadiga)";
    } else if (
      percentages[0] < percentages[1] &&
      percentages[1] < percentages[2]
    ) {
      return "Desempenho crescente ao longo da prova (aquecimento)";
    } else if (
      percentages[1] > percentages[0] &&
      percentages[1] > percentages[2]
    ) {
      return "Melhor desempenho no meio da prova";
    } else if (Math.max(...percentages) - Math.min(...percentages) < 5) {
      return "Desempenho consistente ao longo da prova";
    } else {
      return "Desempenho irregular";
    }
  }
}
