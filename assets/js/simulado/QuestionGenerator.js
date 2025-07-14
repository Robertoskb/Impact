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
    if (config.type === "dia1") {
      if (config.language) {
        areas = [config.language, "CH"];
      } else {
        areas = ["LC0", "CH"];
      }
    }

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
    let questionArea = this.determineQuestionArea(pos, areas);

    if (!questionArea || !areas.includes(questionArea)) {
      return null;
    }

    let realPosition = null;
    let hasValidPosition = false;

    // Buscar a posição real baseada na cor da prova
    if (yearData && yearData[questionArea]) {
      for (const [originalPos, colorMapping] of Object.entries(
        yearData[questionArea]
      )) {
        if (colorMapping[color] === pos) {
          realPosition = parseInt(originalPos);
          hasValidPosition = true;
          break;
        }
      }
    }

    // Verificar se a questão é anulada
    let isCancelled = !hasValidPosition;

    if (
      hasValidPosition &&
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
    }

    if (!realPosition && hasValidPosition) {
      realPosition = pos;
    }

    return {
      position: pos,
      originalPosition: realPosition,
      area: questionArea,
      cancelled: isCancelled,
      color: config.color,
    };
  }

  determineQuestionArea(pos, areas) {
    if (pos >= 1 && pos <= 45) {
      return areas.includes("LC0")
        ? "LC0"
        : areas.includes("LC1")
        ? "LC1"
        : null;
    } else if (pos >= 46 && pos <= 90) {
      return "CH";
    } else if (pos >= 91 && pos <= 135) {
      return "CN";
    } else if (pos >= 136 && pos <= 180) {
      return "MT";
    }
    return null;
  }

  getCorrectAnswer(question) {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();

    // Verificar se há gabarito real no meta.json
    if (
      meta[config.year] &&
      meta[config.year][question.area] &&
      meta[config.year][question.area][question.originalPosition]
    ) {
      const metaData =
        meta[config.year][question.area][question.originalPosition];

      if (metaData.answer) {
        console.log(
          `Questão ${question.originalPosition} (${question.area}): Gabarito oficial = ${metaData.answer}`
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
