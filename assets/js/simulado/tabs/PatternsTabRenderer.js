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
        
        <div class="temporal-analysis-text">
          <small>
            <strong>Interpretação:</strong> 
            ${this.analyzeTemporalPerformance(thirds)}
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
    const triScoresData = this.app.triScores;

    if (!triScoresData || !triScoresData.scores) {
      return `
        <div class="pattern-card">
          <h5><i class="fa fa-chart-area"></i> Análise de Consistência TRI</h5>
          <div class="consistency-area">
            <p>Notas TRI não disponíveis. Calcule as notas primeiro para ver a análise de consistência.</p>
          </div>
        </div>
      `;
    }

    // Analisar inconsistências para cada área
    const areas = [...new Set(questions.map((q) => q.area))];
    let html = `
      <div class="pattern-card">
        <h5><i class="fa fa-chart-area"></i> Análise de Consistência TRI</h5>
    `;

    areas.forEach((area) => {
      const areaQuestions = questions.filter((q) => q.area === area);
      const areaScore = triScoresData.scores[area];

      if (!areaScore) {
        html += `
          <div class="consistency-area">
            <h6><i class="fa fa-chart-bar"></i> ${this.getAreaName(area)}</h6>
            <p>Nota TRI não disponível para esta área.</p>
          </div>
        `;
        return;
      }

      const userScore = areaScore.score || 500; // Fallback para 500 se não houver nota
      const userTheta = (userScore - 500) / 100; // Converter nota para parâmetro θ (theta)

      const inconsistencies = this.analyzeAreaInconsistencies(
        areaQuestions,
        answers,
        userTheta,
        meta,
        config
      );

      html += this.renderAreaConsistency(area, inconsistencies, userScore);
    });

    html += `</div>`;
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

      if (difficulty === null || discrimination === null) return;

      // Calcular probabilidade de acerto usando modelo 3PL da TRI
      // P(θ) = c + (1-c) * [e^(Da(θ-b)) / (1 + e^(Da(θ-b)))]
      // Assumindo c = 0.2 (chute) e D = 1.7 (constante de escala)
      const c = 0.2; // Probabilidade de acerto ao acaso
      const D = 1.7; // Constante de escala
      const exponent = D * discrimination * (userTheta - difficulty);
      const probability =
        c + (1 - c) * (Math.exp(exponent) / (1 + Math.exp(exponent)));

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

  analyzeTemporalPerformance(thirds) {
    const performances = [
      thirds.first.percentage,
      thirds.second.percentage,
      thirds.third.percentage,
    ];
    const maxPerf = Math.max(...performances);
    const minPerf = Math.min(...performances);
    const difference = maxPerf - minPerf;

    if (difference < 10) {
      return "Desempenho consistente ao longo da prova, sem sinais significativos de fadiga ou melhora.";
    }

    // Identificar padrão
    if (
      thirds.first.percentage > thirds.second.percentage &&
      thirds.second.percentage > thirds.third.percentage
    ) {
      return "Declínio progressivo: possível fadiga mental ou redução da concentração ao longo da prova.";
    } else if (
      thirds.first.percentage < thirds.second.percentage &&
      thirds.second.percentage < thirds.third.percentage
    ) {
      return "Melhora progressiva: aquecimento gradual ou estratégia de acelerar no final da prova.";
    } else if (
      thirds.second.percentage < thirds.first.percentage &&
      thirds.second.percentage < thirds.third.percentage
    ) {
      return "Queda no meio: possível perda de foco na parte central, com recuperação no final.";
    } else if (
      thirds.second.percentage > thirds.first.percentage &&
      thirds.second.percentage > thirds.third.percentage
    ) {
      return "Pico no meio: melhor desempenho na parte central, com início e final mais fracos.";
    } else {
      return "Padrão irregular: desempenho varia significativamente entre as seções da prova.";
    }
  }
}
