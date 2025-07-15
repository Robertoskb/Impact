import { BaseTabRenderer } from "./BaseTabRenderer.js";

export class PatternsTabRenderer extends BaseTabRenderer {
  constructor(app) {
    super(app);
  }

  /**
   * Obtém o casual hit de uma questão dos metadados
   * @param {Object} meta - Metadados do simulado
   * @param {Object} config - Configuração atual
   * @param {Object} question - Objeto da questão
   * @returns {number|null} - Valor do casual hit em decimal (0-1) ou null se não encontrado
   */
  getCasualHit(meta, config, question) {
    try {
      if (
        !meta[config.year] ||
        !meta[config.year][question.area] ||
        !meta[config.year][question.area][question.originalPosition]
      ) {
        return null;
      }

      const questionMeta =
        meta[config.year][question.area][question.originalPosition];
      const casualHitPercent = questionMeta["casual hit"];

      if (casualHitPercent === null || casualHitPercent === undefined) {
        return null;
      }

      // Converter de percentual para decimal
      return casualHitPercent / 100;
    } catch (error) {
      console.warn("Erro ao obter casual hit:", error);
      return null;
    }
  }

  /**
   * Função de teste para verificar se o casual hit está sendo obtido corretamente
   * Use no console: renderer.testCasualHit()
   */
  testCasualHit() {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();
    const questions = this.app.getQuestions();

    console.log("=== TESTE DE CASUAL HIT ===");
    console.log("Config:", config);

    // Testar com as primeiras 5 questões
    questions.slice(0, 5).forEach((question, index) => {
      if (question.cancelled) {
        console.log(
          `Questão ${index + 1} (${question.originalPosition}): ANULADA`
        );
        return;
      }

      const casualHit = this.getCasualHit(meta, config, question);
      const questionMeta =
        meta[config.year]?.[question.area]?.[question.originalPosition];

      console.log(`Questão ${index + 1} (${question.originalPosition}):`, {
        area: question.area,
        casualHitPercent: questionMeta?.["casual hit"],
        casualHitDecimal: casualHit,
        difficulty: questionMeta?.difficulty,
        discrimination: questionMeta?.discrimination,
      });
    });
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
            <h5>Padrão de Respostas</h5>
            <div class="answer-pattern">
              ${answerString
                .split("")
                .map((bit, index) => {
                  const questionNum = index + 1;
                  let title, status;
                  if (bit === "C") {
                    title = `Questão ${questionNum}: Anulada`;
                    status = "Anulada";
                  } else if (bit === "1") {
                    title = `Questão ${questionNum}: Correta`;
                    status = "Correta";
                  } else {
                    title = `Questão ${questionNum}: Incorreta`;
                    status = "Incorreta";
                  }
                  return `<span class="bit bit-${bit}" title="${title}"></span>`;
                })
                .join("")}
            </div>
          </div>
        </div>

        <div class="patterns-grid">
          ${this.renderTRIConsistencyAnalysis(questions, answers)}
          ${this.renderTemporalPatterns(answerString)}
          ${this.renderSequencePatterns(answerString)}
          ${this.renderOptionFrequency(questions, answers)}
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  getAnswerString(questions, answers) {
    return questions
      .map((question) => {
        if (question.cancelled) {
          return "C"; // C para cancelled (anulada)
        }

        const userAnswer = answers[question.position];
        const correctAnswer =
          this.app.questionGenerator.getCorrectAnswer(question);

        // Para questões não anuladas, compara com o gabarito
        const isCorrect = userAnswer === correctAnswer;
        return isCorrect ? "1" : "0";
      })
      .join("");
  }

  renderSequencePatterns(answerString) {
    // Analisar sequências de acertos e erros
    const sequences = this.analyzeSequences(answerString);

    return `
      <div class="pattern-card">
        <h5><i class="fa fa-chart-line"></i> Análise de Sequências</h5>
        
        <div class="sequence-summary" style="margin-bottom: 1.5rem;">
          <div class="summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <div class="summary-card success" style="
              background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
              border: 1px solid #b8dabc;
              border-radius: 12px;
              padding: 1.5rem 1rem;
              text-align: center;
              box-shadow: 0 4px 8px rgba(40, 167, 69, 0.1);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(40, 167, 69, 0.15)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(40, 167, 69, 0.1)'">
              <div class="card-icon" style="margin-bottom: 0.75rem;">
                <i class="fa fa-trophy" style="
                  font-size: 2rem;
                  color: #28a745;
                  background: rgba(40, 167, 69, 0.1);
                  width: 3.5rem;
                  height: 3.5rem;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                "></i>
              </div>
              <div class="card-content">
                <div class="card-value" style="
                  font-size: 2rem;
                  font-weight: 700;
                  color: #155724;
                  margin-bottom: 0.25rem;
                ">${sequences.maxCorrectStreak}</div>
                <div class="card-label" style="
                  font-size: 0.875rem;
                  color: #155724;
                  font-weight: 500;
                  line-height: 1.3;
                ">Maior sequência<br>de acertos</div>
              </div>
            </div>
            
            <div class="summary-card danger" style="
              background: linear-gradient(135deg, #f8d7da 0%, #f1b0b7 100%);
              border: 1px solid #f5c6cb;
              border-radius: 12px;
              padding: 1.5rem 1rem;
              text-align: center;
              box-shadow: 0 4px 8px rgba(220, 53, 69, 0.1);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(220, 53, 69, 0.15)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(220, 53, 69, 0.1)'">
              <div class="card-icon" style="margin-bottom: 0.75rem;">
                <i class="fa fa-exclamation-triangle" style="
                  font-size: 2rem;
                  color: #dc3545;
                  background: rgba(220, 53, 69, 0.1);
                  width: 3.5rem;
                  height: 3.5rem;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                "></i>
              </div>
              <div class="card-content">
                <div class="card-value" style="
                  font-size: 2rem;
                  font-weight: 700;
                  color: #721c24;
                  margin-bottom: 0.25rem;
                ">${sequences.maxIncorrectStreak}</div>
                <div class="card-label" style="
                  font-size: 0.875rem;
                  color: #721c24;
                  font-weight: 500;
                  line-height: 1.3;
                ">Maior sequência<br>de erros</div>
              </div>
            </div>
            
            <div class="summary-card info" style="
              background: linear-gradient(135deg, #cce7ff 0%, #b3d7ff 100%);
              border: 1px solid #b8daff;
              border-radius: 12px;
              padding: 1.5rem 1rem;
              text-align: center;
              box-shadow: 0 4px 8px rgba(0, 123, 255, 0.1);
              transition: transform 0.2s ease, box-shadow 0.2s ease;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(0, 123, 255, 0.15)'" 
               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 8px rgba(0, 123, 255, 0.1)'">
              <div class="card-icon" style="margin-bottom: 0.75rem;">
                <i class="fa fa-arrows-alt-h" style="
                  font-size: 2rem;
                  color: #007bff;
                  background: rgba(0, 123, 255, 0.1);
                  width: 3.5rem;
                  height: 3.5rem;
                  display: inline-flex;
                  align-items: center;
                  justify-content: center;
                  border-radius: 50%;
                "></i>
              </div>
              <div class="card-content">
                <div class="card-value" style="
                  font-size: 2rem;
                  font-weight: 700;
                  color: #004085;
                  margin-bottom: 0.25rem;
                ">${sequences.alternations}</div>
                <div class="card-label" style="
                  font-size: 0.875rem;
                  color: #004085;
                  font-weight: 500;
                  line-height: 1.3;
                ">Mudanças entre<br>acerto/erro</div>
              </div>
            </div>
          </div>
        </div>

        ${this.renderDetailedSequences(sequences)}
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

      // Pular questões anuladas (C) para análise de sequências
      if (bit === "C") {
        // Se estava em uma sequência, finalizá-la
        if (currentCorrectStreak > 0) {
          correctStreaks.push({
            length: currentCorrectStreak,
            start: i - currentCorrectStreak,
            end: i - 1,
          });
          currentCorrectStreak = 0;
        }
        if (currentIncorrectStreak > 0) {
          incorrectStreaks.push({
            length: currentIncorrectStreak,
            start: i - currentIncorrectStreak,
            end: i - 1,
          });
          currentIncorrectStreak = 0;
        }
        continue; // Pular questão anulada
      }

      if (lastBit !== null && lastBit !== bit && lastBit !== "C") {
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
      } else if (bit === "0") {
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

      // Só atualizar lastBit se não for questão anulada
      if (bit !== "C") {
        lastBit = bit;
      }
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

  renderDetailedSequences(sequences) {
    // Se não há sequências notáveis, mostrar mensagem
    if (
      sequences.correctStreaks.length === 0 &&
      sequences.incorrectStreaks.length === 0
    ) {
      return `
        <div class="no-sequences" style="
          text-align: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          border: 1px solid #dee2e6;
        ">
          <i class="fa fa-info-circle" style="
            font-size: 2.5rem;
            color: #6c757d;
            margin-bottom: 1rem;
          "></i>
          <div style="
            font-size: 1.1rem;
            color: #495057;
            font-weight: 500;
          ">Nenhuma sequência significativa identificada</div>
        </div>
      `;
    }

    let html = `<div class="sequences-container" style="display: grid; gap: 1.5rem;">`;

    // Sequências de acertos
    if (sequences.correctStreaks.length > 0) {
      html += `
        <div class="sequence-section" style="
          background: linear-gradient(135deg, #f8fff9 0%, #f0f9f0 100%);
          border: 1px solid #d4edda;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(40, 167, 69, 0.08);
        ">
          <div class="section-header success" style="
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #d4edda;
          ">
            <i class="fa fa-check-circle" style="
              font-size: 1.25rem;
              color: #28a745;
              margin-right: 0.5rem;
            "></i>
            <h6 style="
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
              color: #155724;
            ">Sequências de Acertos</h6>
          </div>
          <div class="sequence-items" style="display: grid; gap: 0.75rem;">
            ${sequences.correctStreaks
              .slice(0, 3)
              .map(
                (streak, index) => `
                <div class="sequence-row ${index === 0 ? "best" : ""}" style="
                  display: flex;
                  align-items: center;
                  padding: 1rem;
                  background: ${
                    index === 0
                      ? "linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)"
                      : "#ffffff"
                  };
                  border: 1px solid ${index === 0 ? "#b8dabc" : "#e9ecef"};
                  border-radius: 8px;
                  transition: all 0.2s ease;
                  ${
                    index === 0
                      ? "box-shadow: 0 3px 12px rgba(40, 167, 69, 0.15);"
                      : ""
                  }
                " onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 16px rgba(40, 167, 69, 0.12)'" 
                   onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='${
                     index === 0
                       ? "0 3px 12px rgba(40, 167, 69, 0.15)"
                       : "0 2px 8px rgba(0, 0, 0, 0.1)"
                   }'">
                  <div class="sequence-badge success" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 4rem;
                    height: 4rem;
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    border-radius: 50%;
                    margin-right: 1rem;
                    box-shadow: 0 2px 8px rgba(40, 167, 69, 0.3);
                  ">
                    <span class="badge-number" style="
                      font-size: 1.25rem;
                      font-weight: 700;
                      color: white;
                      line-height: 1;
                    ">${streak.length}</span>
                    <span class="badge-label" style="
                      font-size: 0.625rem;
                      color: rgba(255, 255, 255, 0.9);
                      text-transform: uppercase;
                      font-weight: 600;
                      letter-spacing: 0.5px;
                    ">acertos</span>
                  </div>
                  <div class="sequence-info" style="flex: 1;">
                    <div class="sequence-description" style="
                      font-size: 1rem;
                      font-weight: 600;
                      color: #155724;
                      margin-bottom: 0.25rem;
                    ">
                      ${streak.length} questões corretas consecutivas
                    </div>
                    <div class="sequence-position" style="
                      display: flex;
                      align-items: center;
                      font-size: 0.875rem;
                      color: #6c757d;
                    ">
                      <i class="fa fa-map-marker-alt" style="
                        margin-right: 0.5rem;
                        color: #28a745;
                      "></i>
                      Questões ${streak.start + 1} até ${streak.end + 1}
                    </div>
                  </div>
                  ${
                    index === 0
                      ? `<div class="best-indicator" style="
                    margin-left: 1rem;
                  "><i class="fa fa-star" style="
                    font-size: 1.25rem;
                    color: #ffc107;
                    filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3));
                  "></i></div>`
                      : ""
                  }
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    // Sequências de erros
    if (sequences.incorrectStreaks.length > 0) {
      html += `
        <div class="sequence-section" style="
          background: linear-gradient(135deg, #fff5f5 0%, #fef0f0 100%);
          border: 1px solid #f8d7da;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(220, 53, 69, 0.08);
        ">
          <div class="section-header danger" style="
            display: flex;
            align-items: center;
            margin-bottom: 1rem;
            padding-bottom: 0.75rem;
            border-bottom: 2px solid #f8d7da;
          ">
            <i class="fa fa-times-circle" style="
              font-size: 1.25rem;
              color: #dc3545;
              margin-right: 0.5rem;
            "></i>
            <h6 style="
              margin: 0;
              font-size: 1.1rem;
              font-weight: 600;
              color: #721c24;
            ">Sequências de Erros</h6>
          </div>
          <div class="sequence-items" style="display: grid; gap: 0.75rem;">
            ${sequences.incorrectStreaks
              .slice(0, 3)
              .map(
                (streak, index) => `
                <div class="sequence-row ${index === 0 ? "worst" : ""}" style="
                  display: flex;
                  align-items: center;
                  padding: 1rem;
                  background: ${
                    index === 0
                      ? "linear-gradient(135deg, #f8d7da 0%, #f1b0b7 100%)"
                      : "#ffffff"
                  };
                  border: 1px solid ${index === 0 ? "#f5c6cb" : "#e9ecef"};
                  border-radius: 8px;
                  transition: all 0.2s ease;
                  ${
                    index === 0
                      ? "box-shadow: 0 3px 12px rgba(220, 53, 69, 0.15);"
                      : ""
                  }
                " onmouseover="this.style.transform='translateX(4px)'; this.style.boxShadow='0 4px 16px rgba(220, 53, 69, 0.12)'" 
                   onmouseout="this.style.transform='translateX(0)'; this.style.boxShadow='${
                     index === 0
                       ? "0 3px 12px rgba(220, 53, 69, 0.15)"
                       : "0 2px 8px rgba(0, 0, 0, 0.1)"
                   }'">
                  <div class="sequence-badge danger" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 4rem;
                    height: 4rem;
                    background: linear-gradient(135deg, #dc3545 0%, #e74c3c 100%);
                    border-radius: 50%;
                    margin-right: 1rem;
                    box-shadow: 0 2px 8px rgba(220, 53, 69, 0.3);
                  ">
                    <span class="badge-number" style="
                      font-size: 1.25rem;
                      font-weight: 700;
                      color: white;
                      line-height: 1;
                    ">${streak.length}</span>
                    <span class="badge-label" style="
                      font-size: 0.625rem;
                      color: rgba(255, 255, 255, 0.9);
                      text-transform: uppercase;
                      font-weight: 600;
                      letter-spacing: 0.5px;
                    ">erros</span>
                  </div>
                  <div class="sequence-info" style="flex: 1;">
                    <div class="sequence-description" style="
                      font-size: 1rem;
                      font-weight: 600;
                      color: #721c24;
                      margin-bottom: 0.25rem;
                    ">
                      ${streak.length} questões incorretas consecutivas
                    </div>
                    <div class="sequence-position" style="
                      display: flex;
                      align-items: center;
                      font-size: 0.875rem;
                      color: #6c757d;
                    ">
                      <i class="fa fa-map-marker-alt" style="
                        margin-right: 0.5rem;
                        color: #dc3545;
                      "></i>
                      Questões ${streak.start + 1} até ${streak.end + 1}
                    </div>
                  </div>
                  ${
                    index === 0
                      ? `<div class="worst-indicator" style="
                    margin-left: 1rem;
                  "><i class="fa fa-exclamation" style="
                    font-size: 1.25rem;
                    color: #dc3545;
                    filter: drop-shadow(0 2px 4px rgba(220, 53, 69, 0.3));
                  "></i></div>`
                      : ""
                  }
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    html += `</div>`;
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
        
        <div class="frequency-summary">
          <div class="summary-item">
            <strong>Total respondidas:</strong> ${totalAnswered} questões
          </div>
          <div class="summary-item">
            <strong>Distribuição esperada:</strong> ${expectedPercentage}% por alternativa
          </div>
        </div>
        
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
                    <div class="option-count">${count} vezes</div>
                    <div class="option-percentage">${percentage.toFixed(
                      1
                    )}%</div>
                    ${
                      deviation > 5
                        ? `<span class="deviation-warning" title="Desvio significativo da distribuição esperada">⚠</span>`
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
    const totalQuestions = answerString.length;
    const validQuestions = answerString.replace(/C/g, "").length;

    return `
      <div class="pattern-card">
        <h5><i class="fa fa-clock"></i> Desempenho Temporal</h5>
        
        <div class="temporal-summary">
          <div class="summary-item">
            <strong>Total de questões:</strong> ${totalQuestions} (${validQuestions} válidas)
          </div>
          <div class="summary-item">
            <strong>Análise:</strong> Divisão em terços para identificar fadiga ou melhora
          </div>
        </div>
        
        <div class="temporal-analysis">
          <div class="temporal-item">
            <div class="temporal-label">
              <i class="fa fa-play"></i>
              <span>Início da Prova</span>
              <small>1º terço</small>
            </div>
            <div class="temporal-bar">
              <div class="temporal-fill" style="width: ${
                thirds.first.percentage
              }%"></div>
            </div>
            <div class="temporal-stats">
              <div class="temporal-score">${thirds.first.correct}/${
      thirds.first.total
    }</div>
              <div class="temporal-percentage">${thirds.first.percentage.toFixed(
                1
              )}%</div>
            </div>
          </div>
          
          <div class="temporal-item">
            <div class="temporal-label">
              <i class="fa fa-pause"></i>
              <span>Meio da Prova</span>
              <small>2º terço</small>
            </div>
            <div class="temporal-bar">
              <div class="temporal-fill" style="width: ${
                thirds.second.percentage
              }%"></div>
            </div>
            <div class="temporal-stats">
              <div class="temporal-score">${thirds.second.correct}/${
      thirds.second.total
    }</div>
              <div class="temporal-percentage">${thirds.second.percentage.toFixed(
                1
              )}%</div>
            </div>
          </div>
          
          <div class="temporal-item">
            <div class="temporal-label">
              <i class="fa fa-stop"></i>
              <span>Final da Prova</span>
              <small>3º terço</small>
            </div>
            <div class="temporal-bar">
              <div class="temporal-fill" style="width: ${
                thirds.third.percentage
              }%"></div>
            </div>
            <div class="temporal-stats">
              <div class="temporal-score">${thirds.third.correct}/${
      thirds.third.total
    }</div>
              <div class="temporal-percentage">${thirds.third.percentage.toFixed(
                1
              )}%</div>
            </div>
          </div>
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

    const analyzeSection = (section) => {
      // Contar apenas questões não anuladas
      const validAnswers = section.replace(/C/g, "");
      const correct = (validAnswers.match(/1/g) || []).length;
      const total = validAnswers.length;
      const percentage = total > 0 ? (correct / total) * 100 : 0;

      return { correct, total, percentage };
    };

    return {
      first: analyzeSection(first),
      second: analyzeSection(second),
      third: analyzeSection(third),
    };
  }

  renderTRIConsistencyAnalysis(questions, answers) {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();

    // Obter notas TRI calculadas do app
    const triResult = this.app.getTRIScores();

    if (!triResult || !triResult.success || !triResult.score) {
      return `
        <div class="pattern-card">
          <h5><i class="fa fa-chart-area"></i> Análise de Consistência TRI</h5>
          <div class="consistency-area">
            <p>Notas TRI não disponíveis. Calcule as notas primeiro para ver a análise de consistência.</p>
          </div>
        </div>
      `;
    }

    // Analisar inconsistências para a área do simulado
    const area = triResult.areaCode;
    const areaQuestions = questions.filter((q) => q.area === area);

    if (areaQuestions.length === 0) {
      return `
        <div class="pattern-card">
          <h5><i class="fa fa-chart-area"></i> Análise de Consistência TRI</h5>
          <div class="consistency-area">
            <p>Nenhuma questão encontrada para análise de consistência.</p>
          </div>
        </div>
      `;
    }

    const userScore = triResult.score;
    const userTheta = (userScore - 500) / 100; // Converter nota para parâmetro θ (theta)

    const inconsistencies = this.analyzeAreaInconsistencies(
      areaQuestions,
      answers,
      userTheta,
      meta,
      config
    );

    let html = `
      <div class="pattern-card">
        <h5><i class="fa fa-chart-area"></i> Análise de Consistência TRI</h5>
        ${this.renderAreaConsistency(area, inconsistencies, userScore)}
      </div>
    `;

    return html;
  }

  analyzeAreaInconsistencies(questions, answers, userTheta, meta, config) {
    const inconsistentItems = [];
    let totalAnalyzed = 0;
    let totalInconsistent = 0;

    questions.forEach((question, index) => {
      // Pular questões anuladas
      if (question.cancelled) return;

      // Verificar se há metadados disponíveis
      if (
        !meta[config.year] ||
        !meta[config.year][question.area] ||
        !meta[config.year][question.area][question.originalPosition]
      ) {
        return;
      }

      const questionMeta =
        meta[config.year][question.area][question.originalPosition];
      const difficulty = questionMeta.difficulty;
      const discrimination = questionMeta.discrimination;

      // Usar a função helper para obter casual hit
      const casualHitDecimal = this.getCasualHit(meta, config, question);

      if (difficulty === null || discrimination === null) return;

      // Calcular probabilidade de acerto usando modelo 3PL da TRI
      // P(θ) = c + (1 - c) / (1 + exp(-a * (θ - b)))
      // onde: c = casual_hit, a = discrimination, θ = ability (userTheta), b = difficulty
      const c = casualHitDecimal !== null ? casualHitDecimal : 0.2;
      const a = discrimination;
      const theta = userTheta;
      const b = difficulty;
      const probability = c + (1 - c) / (1 + Math.exp(-a * (theta - b)));

      const userAnswer = answers[question.position];
      const correctAnswer =
        this.app.questionGenerator.getCorrectAnswer(question);
      const isCorrect = userAnswer === correctAnswer;

      totalAnalyzed++;

      // Considerar inconsistente se:
      // 1. Probabilidade alta (>70%) mas errou
      // 2. Probabilidade baixa (<30%) mas acertou
      if (
        (probability > 0.7 && !isCorrect) ||
        (probability < 0.3 && isCorrect)
      ) {
        totalInconsistent++;
        inconsistentItems.push({
          questionNumber: question.position, // Usar posição real na prova
          originalPosition: question.originalPosition,
          probability: probability * 100,
          isCorrect: isCorrect,
          expectedResult: probability > 0.5 ? "acerto" : "erro",
          actualResult: isCorrect ? "acerto" : "erro",
          severity: Math.abs(probability - (isCorrect ? 1 : 0)),
          difficulty: difficulty,
          discrimination: discrimination,
          casualHit: c, // Adicionar casual_hit para debug/análise
        });
      }
    });

    // Ordenar por severidade (maior inconsistência primeiro)
    inconsistentItems.sort((a, b) => b.severity - a.severity);

    return {
      items: inconsistentItems.slice(0, 10), // Top 10 inconsistências
      totalAnalyzed: totalAnalyzed,
      totalInconsistent: totalInconsistent,
      consistencyRate:
        totalAnalyzed > 0
          ? ((totalAnalyzed - totalInconsistent) / totalAnalyzed) * 100
          : 0,
    };
  }

  renderAreaConsistency(area, analysis, userScore) {
    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };

    const consistencyLevel =
      analysis.consistencyRate >= 80
        ? "alta"
        : analysis.consistencyRate >= 60
        ? "média"
        : "baixa";

    let html = `
      <div class="consistency-area">
        <h6><i class="fa fa-chart-bar"></i> ${areaNames[area] || area}</h6>
        <div class="consistency-stats">
          <div class="stat-item">
            <strong>Nota TRI:</strong> ${Math.round(userScore)} pontos
          </div>
          <div class="stat-item">
            <strong>Consistência:</strong> 
            <span class="consistency-${consistencyLevel}">${analysis.consistencyRate.toFixed(
      1
    )}%</span>
          </div>
          <div class="stat-item">
            <strong>Questões analisadas:</strong> ${analysis.totalAnalyzed}
          </div>
        </div>
    `;

    if (analysis.items.length > 0) {
      html += `
        <div class="inconsistent-items">
          <h6>Principais Inconsistências:</h6>
          <div class="inconsistency-list">
            ${analysis.items
              .slice(0, 5)
              .map(
                (item) => `
              <div class="inconsistency-item">
                <div class="item-info">
                  <strong>Q${item.questionNumber}</strong>
                  <span class="probability">${item.probability.toFixed(
                    1
                  )}% prob.</span>
                  <span class="result ${
                    item.isCorrect ? "correct" : "incorrect"
                  }">
                    ${item.actualResult}
                  </span>
                </div>
                <div class="item-description">
                  ${
                    item.probability > 70 && !item.isCorrect
                      ? "Erro em questão com alta probabilidade de acerto"
                      : "Acerto em questão com baixa probabilidade"
                  }
                </div>
              </div>
            `
              )
              .join("")}
          </div>
        </div>
      `;
    }

    html += `
        <div class="consistency-analysis">
          <small>
            <strong>Análise:</strong> 
            ${this.getConsistencyDescription(
              analysis.consistencyRate,
              analysis.totalInconsistent
            )}
          </small>
        </div>
      </div>
    `;

    return html;
  }

  getAreaName(area) {
    const areaNames = {
      LC0: "Linguagens (Inglês)",
      LC1: "Linguagens (Espanhol)",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };
    return areaNames[area] || area;
  }

  getConsistencyDescription(consistencyRate, totalInconsistent) {
    if (consistencyRate >= 85) {
      return "Desempenho muito consistente com a habilidade estimada.";
    } else if (consistencyRate >= 70) {
      return "Desempenho razoavelmente consistente, com algumas inconsistências pontuais.";
    } else if (consistencyRate >= 50) {
      return "Desempenho moderadamente inconsistente. Revise estratégias de resolução.";
    } else {
      return "Desempenho inconsistente. Pode indicar problemas de concentração, chutes ou gaps de conhecimento.";
    }
  }
}
