// Gerador de questões do simulado
export class QuestionGenerator {
  constructor(app) {
    this.app = app;
  }

  getQuestionRanges(type) {
    const ranges = {
      LC0: { start: 1, end: 45, areas: ["LC0"] },
      LC1: { start: 1, end: 45, areas: ["LC1"] },
      CH: { start: 46, end: 90, areas: ["CH"] },
      CN: { start: 91, end: 135, areas: ["CN"] },
      MT: { start: 136, end: 180, areas: ["MT"] },
      dia1: { start: 1, end: 90, areas: ["LC0", "LC1", "CH"] },
      dia2: { start: 91, end: 180, areas: ["CN", "MT"] },
    };

    return ranges[type] || ranges["LC0"];
  }

  generateQuestions() {
    const config = this.app.getCurrentConfig();
    const range = this.getQuestionRanges(config.type);
    const yearData = this.app.getPositions()[config.year];

    const colorMapping = {
      azul: "AZUL",
      amarela: "AMARELA",
      branca: "BRANCA",
      rosa: "ROSA",
      verde: "VERDE",
      cinza: "CINZA",
    };

    const color = colorMapping[config.color];
    const questions = [];

    // Para dia1, usar o idioma selecionado
    let areas = range.areas;
    console.log(
      `🎯 QuestionGenerator: Tipo de simulado: ${
        config.type
      }, áreas padrão: [${range.areas.join(", ")}]`
    );

    if (config.type === "dia1") {
      if (config.language) {
        areas = [config.language, "CH"];
      } else {
        areas = ["LC0", "CH"];
      }
      console.log(
        `📝 QuestionGenerator: Dia1 - áreas ajustadas: [${areas.join(", ")}]`
      );
    } else if (config.type === "dia2") {
      // Para dia2, usar as áreas padrão CN e MT
      areas = ["CN", "MT"];
      console.log(`📝 QuestionGenerator: Dia2 - áreas: [${areas.join(", ")}]`);
    }

    console.log(
      `✅ QuestionGenerator: Áreas finais para ${config.type}: [${areas.join(
        ", "
      )}]`
    );

    // Mapear posições baseado na cor da prova
    for (let pos = range.start; pos <= range.end; pos++) {
      const questionData = this.processQuestion(
        pos,
        areas,
        yearData,
        color,
        config
      );
      if (questionData) {
        questions.push(questionData);
      }
    }

    // Ordenar por posição (ordem da prova)
    questions.sort((a, b) => a.position - b.position);

    console.log(
      `Geradas ${questions.length} questões, sendo ${
        questions.filter((q) => q.cancelled).length
      } anuladas`
    );

    return questions;
  }

  processQuestion(pos, areas, yearData, color, config) {
    let questionArea = this.determineQuestionArea(pos, areas, config);

    if (!questionArea || !areas.includes(questionArea)) {
      console.log(
        `❌ QuestionGenerator: Questão ${pos} rejeitada - área: ${questionArea}, áreas permitidas: [${areas.join(
          ", "
        )}]`
      );
      return null;
    }

    let realPosition = null;
    let hasValidPosition = false;

    // CORREÇÃO: Para questões LC1, tentar buscar primeiro em LC1, depois em LC0 se não existir
    let searchArea = questionArea;
    if (
      questionArea === "LC1" &&
      yearData &&
      !yearData["LC1"] &&
      yearData["LC0"]
    ) {
      console.log(
        `🔄 QuestionGenerator: LC1 não encontrado para ${pos}, usando LC0 como fallback`
      );
      searchArea = "LC0";
    }

    // Buscar a posição real baseada na cor da prova
    if (yearData && yearData[searchArea]) {
      console.log(
        `🔍 QuestionGenerator: Buscando posição ${pos} na área ${searchArea} para cor ${color}`
      );
      for (const [originalPos, colorMapping] of Object.entries(
        yearData[searchArea]
      )) {
        if (colorMapping[color] === pos) {
          realPosition = parseInt(originalPos);
          hasValidPosition = true;
          console.log(
            `✅ QuestionGenerator: Posição ${pos} mapeada para posição original ${realPosition} na área ${searchArea}`
          );
          break;
        }
      }
    } else {
      console.log(
        `❌ QuestionGenerator: Dados não encontrados para área ${searchArea} no ano ${config.year}`
      );
    }

    // Se não encontrou posição válida no mapeamento, a questão é anulada
    if (!hasValidPosition) {
      return {
        position: pos,
        originalPosition: pos,
        area: questionArea,
        cancelled: true,
        color: config.color,
      };
    }

    // Verificar se a questão existe no meta.json (posição da prova azul)
    let isCancelled = false;
    if (
      this.app.getMeta()[config.year] &&
      this.app.getMeta()[config.year][questionArea]
    ) {
      const metaData =
        this.app.getMeta()[config.year][questionArea][realPosition];
      if (!metaData) {
        isCancelled = true;
        console.log(
          `Questão ${realPosition} da área ${questionArea} anulada (não encontrada no meta.json)`
        );
      }
    } else {
      // Se não há dados no meta.json para esse ano/área, considera anulada
      isCancelled = true;
      console.log(
        `Questão ${realPosition} da área ${questionArea} anulada (sem dados no meta.json)`
      );
    }

    return {
      position: pos,
      originalPosition: realPosition,
      area: questionArea,
      cancelled: isCancelled,
      color: config.color,
    };
  }

  determineQuestionArea(pos, areas, config) {
    console.log(
      `🔍 QuestionGenerator: determineQuestionArea para posição ${pos}, áreas disponíveis: [${areas.join(
        ", "
      )}], tipo: ${config?.type}`
    );

    if (pos >= 1 && pos <= 45) {
      // Para questões de Linguagens (posições 1-45)
      // No ENEM real, todas as 45 questões são da língua escolhida
      let area = null;

      // Se há configuração de idioma, usar ela
      if (config && config.language) {
        if (areas.includes(config.language)) {
          area = config.language;
          console.log(
            `📝 QuestionGenerator: Posição ${pos} (1-45, idioma configurado) -> área: ${area}`
          );
          return area;
        }
      }

      // Fallback: usar a primeira área de linguagem disponível
      if (areas.includes("LC0")) {
        area = "LC0";
      } else if (areas.includes("LC1")) {
        area = "LC1";
      }

      console.log(
        `📝 QuestionGenerator: Posição ${pos} (1-45, fallback) -> área: ${area}`
      );
      return area;
    } else if (pos >= 46 && pos <= 90) {
      if (areas.includes("CH")) {
        console.log(`📝 QuestionGenerator: Posição ${pos} (46-90) -> área: CH`);
        return "CH";
      } else {
        console.log(
          `❌ QuestionGenerator: Posição ${pos} (46-90) CH não disponível nas áreas: [${areas.join(
            ", "
          )}]`
        );
        return null;
      }
    } else if (pos >= 91 && pos <= 135) {
      if (areas.includes("CN")) {
        console.log(
          `📝 QuestionGenerator: Posição ${pos} (91-135) -> área: CN`
        );
        return "CN";
      } else {
        console.log(
          `❌ QuestionGenerator: Posição ${pos} (91-135) CN não disponível nas áreas: [${areas.join(
            ", "
          )}]`
        );
        return null;
      }
    } else if (pos >= 136 && pos <= 180) {
      if (areas.includes("MT")) {
        console.log(
          `📝 QuestionGenerator: Posição ${pos} (136-180) -> área: MT`
        );
        return "MT";
      } else {
        console.log(
          `❌ QuestionGenerator: Posição ${pos} (136-180) MT não disponível nas áreas: [${areas.join(
            ", "
          )}]`
        );
        return null;
      }
    }
    console.log(
      `❌ QuestionGenerator: Posição ${pos} não mapeada para nenhuma área`
    );
    return null;
  }

  /**
   * Mapeia posição da cor escolhida para posição na prova azul
   * @param {number} position - Posição na cor escolhida
   * @param {string} area - Área da questão
   * @param {string} color - Cor da prova
   * @param {number} year - Ano da prova
   * @returns {number} - Posição correspondente na prova azul
   */
  getMappedPosition(position, area, color, year) {
    const positions = this.app.getPositions();
    const yearData = positions[year];

    if (!yearData || !yearData[area]) {
      console.warn(`Dados de posição não encontrados para ${year}/${area}`);
      return position; // fallback para posição original
    }

    const colorMapping = {
      azul: "AZUL",
      amarela: "AMARELA",
      branca: "BRANCA",
      rosa: "ROSA",
      verde: "VERDE",
      cinza: "CINZA",
    };

    const mappedColor = colorMapping[color];

    // Buscar a posição real baseada na cor da prova
    for (const [originalPos, colorMap] of Object.entries(yearData[area])) {
      if (colorMap[mappedColor] === position) {
        const realPosition = parseInt(originalPos);
        console.log(
          `📍 Mapeamento: Posição ${position} (${color}) → ${realPosition} (azul) na área ${area}`
        );
        return realPosition;
      }
    }

    console.warn(
      `Mapeamento não encontrado para posição ${position} na cor ${color} da área ${area}`
    );
    return position; // fallback
  }

  getCorrectAnswer(question) {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();

    // Mapear posição da cor escolhida para posição na prova azul
    const mappedPosition = this.getMappedPosition(
      question.position,
      question.area,
      config.color,
      config.year
    );

    // Verificar se há gabarito real no meta.json usando a posição mapeada
    if (
      meta[config.year] &&
      meta[config.year][question.area] &&
      meta[config.year][question.area][mappedPosition]
    ) {
      const metaData = meta[config.year][question.area][mappedPosition];

      if (metaData.answer) {
        console.log(
          `Questão ${question.position} (${question.area}) [cor: ${config.color}] → posição azul: ${mappedPosition} → Gabarito: ${metaData.answer}`
        );
        return metaData.answer;
      }
    }

    // Fallback: simular gabarito baseado na posição original
    const answers = ["A", "B", "C", "D", "E"];
    const position = question.originalPosition || question.position;
    return answers[position % 5];
  }
}
