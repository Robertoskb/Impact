// Calculadora de Notas TRI usando modelos LightGBM específicos
export class ScoreCalculator {
  constructor(app) {
    this.app = app;
    this.loadedModels = new Map(); // Cache de modelos carregados
  }

  /**
   * Gera o nome do arquivo do modelo baseado nos parâmetros
   * @param {number} year - Ano da prova
   * @param {string} area - Área (LC, CH, CN, MT)
   * @param {string} language - Idioma (0 ou 1 para LC0/LC1, null para outras áreas)
   * @returns {string} Nome do arquivo do modelo
   */
  generateModelFileName(year, area, language = null) {
    // Padrão: modelo_de_nota_{year}_{area}_B{_language}.js
    let fileName = `modelo_de_nota_${year}_${area}_B`;

    // Adicionar language apenas para LC (Linguagens e Códigos)
    if (area === "LC" && language !== null) {
      fileName += `_${language}`;
    }

    return `${fileName}.js`;
  }

  /**
   * Verifica se existe um modelo para os parâmetros dados
   * @param {number} year - Ano da prova
   * @param {string} area - Área
   * @param {string} language - Idioma (opcional)
   * @returns {Promise<boolean>} True se o modelo existe
   */
  async modelExists(year, area, language = null) {
    const fileName = this.generateModelFileName(year, area, language);
    const modelPath = `assets/js/models/${fileName}`;

    try {
      const response = await fetch(modelPath, { method: "HEAD" });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Carrega um modelo específico dinamicamente
   * @param {number} year - Ano da prova
   * @param {string} area - Área
   * @param {string} language - Idioma (opcional)
   * @returns {Promise<Object|null>} Modelo carregado ou null se não existir
   */
  async loadModel(year, area, language = null) {
    const modelKey = `${year}_${area}${language ? "_" + language : ""}`;

    // Verificar se já está no cache
    if (this.loadedModels.has(modelKey)) {
      return this.loadedModels.get(modelKey);
    }

    const fileName = this.generateModelFileName(year, area, language);
    // Caminho para fetch (absoluto da raiz)
    const modelPath = `assets/js/models/${fileName}`;

    try {
      console.log(
        `ScoreCalculator: Tentando carregar modelo ${fileName} em ${modelPath}`
      );

      // Método alternativo: carregar via script tag dinâmico
      // Isso funciona melhor com arquivos que usam window.model
      const model = await this.loadModelViaScript(modelPath, modelKey);

      if (!model) {
        throw new Error("Modelo não encontrado no arquivo");
      }

      // Validar se o modelo tem os métodos necessários
      if (
        typeof model.predict !== "function" &&
        typeof model.predictWithArray !== "function"
      ) {
        throw new Error("Modelo não possui métodos de predição válidos");
      }

      // Cache do modelo
      this.loadedModels.set(modelKey, model);
      console.log(`ScoreCalculator: Modelo ${fileName} carregado com sucesso`);

      return model;
    } catch (error) {
      console.warn(
        `ScoreCalculator: Erro ao carregar modelo ${fileName}:`,
        error.message
      );
      return null;
    }
  }

  /**
   * Carrega modelo via script tag dinâmico
   * @param {string} modelPath - Caminho para o modelo
   * @param {string} modelKey - Chave única do modelo
   * @returns {Promise<Object|null>} Modelo carregado
   */
  async loadModelViaScript(modelPath, modelKey) {
    return new Promise((resolve, reject) => {
      // Criar um script tag único
      const script = document.createElement("script");
      script.src = modelPath;
      script.type = "text/javascript";

      // Callback quando carregado
      script.onload = () => {
        try {
          // O modelo deve estar disponível em window.model
          const model = window.model;

          if (model && typeof model.predict === "function") {
            // Limpar o script do DOM
            document.head.removeChild(script);
            resolve(model);
          } else {
            reject(new Error("Modelo não encontrado em window.model"));
          }
        } catch (error) {
          reject(error);
        }
      };

      // Callback quando há erro
      script.onerror = () => {
        document.head.removeChild(script);
        reject(new Error("Erro ao carregar script do modelo"));
      };

      // Adicionar ao DOM para carregar
      document.head.appendChild(script);
    });
  }

  /**
   * Prepara o padrão de respostas na ordem de dificuldade
   * @param {Array} questions - Array de questões
   * @param {Object} answers - Respostas do usuário
   * @param {string} area - Área específica para filtrar
   * @returns {Array} Array de 0s e 1s na ordem de dificuldade
   */
  prepareDifficultyOrderedPattern(questions, answers, area) {
    console.log(`ScoreCalculator: Preparando padrão para área ${area}`);
    console.log(`ScoreCalculator: Total de questões: ${questions.length}`);
    console.log(
      `ScoreCalculator: Total de respostas: ${Object.keys(answers).length}`
    );

    // Filtrar questões da área específica
    const areaQuestions = questions.filter((q) => q.area === area);
    console.log(
      `ScoreCalculator: Questões da área ${area}: ${areaQuestions.length}`
    );

    // Separar questões válidas das anuladas
    const validQuestions = areaQuestions.filter((q) => !q.cancelled);
    const cancelledQuestions = areaQuestions.filter((q) => q.cancelled);

    console.log(
      `ScoreCalculator: Questões válidas: ${validQuestions.length}, anuladas: ${cancelledQuestions.length}`
    );

    // Ordenar questões válidas por dificuldade
    validQuestions.sort((a, b) => {
      // Obter dados de dificuldade do meta
      const difficultyA = this.getQuestionDifficulty(a);
      const difficultyB = this.getQuestionDifficulty(b);

      console.log(
        `ScoreCalculator: Questão ${a.position} (original: ${a.originalPosition}) - dificuldade: ${difficultyA}`
      );
      console.log(
        `ScoreCalculator: Questão ${b.position} (original: ${b.originalPosition}) - dificuldade: ${difficultyB}`
      );

      // Se ambos têm dificuldade, ordenar por dificuldade
      if (difficultyA !== null && difficultyB !== null) {
        return difficultyA - difficultyB;
      }

      // Se só um tem dificuldade, o que tem vai primeiro
      if (difficultyA !== null) return -1;
      if (difficultyB !== null) return 1;

      // Se nenhum tem, ordenar por posição original
      return (
        (a.originalPosition || a.position) - (b.originalPosition || b.position)
      );
    });

    console.log(
      `ScoreCalculator: Ordem final das questões válidas:`,
      validQuestions.map((q) => `${q.position}(${q.originalPosition})`)
    );

    // Criar padrão para questões válidas
    const validPattern = validQuestions.map((question) => {
      const userAnswer = answers[question.position];
      const correctAnswer = this.getCorrectAnswer(question);

      console.log(
        `ScoreCalculator: Questão ${question.position} - Resposta: ${userAnswer}, Correta: ${correctAnswer}`
      );

      // Se não respondeu ou respondeu errado, retorna 0
      if (!userAnswer || userAnswer !== correctAnswer) {
        return 0;
      }

      return 1;
    });

    // Adicionar zeros para questões anuladas no final
    const cancelledPattern = new Array(cancelledQuestions.length).fill(0);

    const finalPattern = [...validPattern, ...cancelledPattern];
    console.log(
      `ScoreCalculator: Padrão final para ${area}: ${finalPattern.join("")} (${
        finalPattern.length
      } elementos)`
    );

    return finalPattern;
  }

  /**
   * Obtém a dificuldade de uma questão do meta
   * @param {Object} question - Questão
   * @returns {number|null} Dificuldade ou null se não disponível
   */
  getQuestionDifficulty(question) {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();

    if (!meta[config.year] || !meta[config.year][question.area]) {
      return null;
    }

    const questionMeta =
      meta[config.year][question.area][question.originalPosition];
    return questionMeta ? questionMeta.difficulty : null;
  }

  /**
   * Obtém a resposta correta de uma questão
   * @param {Object} question - Questão
   * @returns {string|null} Alternativa correta
   */
  getCorrectAnswer(question) {
    const config = this.app.getCurrentConfig();
    const meta = this.app.getMeta();

    if (!meta[config.year] || !meta[config.year][question.area]) {
      return null;
    }

    const questionMeta =
      meta[config.year][question.area][question.originalPosition];
    return questionMeta ? questionMeta.answer : null;
  }

  /**
   * Calcula a nota TRI para uma área específica
   * @param {string} area - Área (LC, CH, CN, MT)
   * @param {string} language - Idioma para LC (0 ou 1)
   * @returns {Promise<Object>} Resultado do cálculo
   */
  async calculateAreaScore(area, language = null) {
    const config = this.app.getCurrentConfig();
    const questions = this.app.getQuestions();
    const answers = this.app.getAnswers();

    console.log(
      `ScoreCalculator: Calculando nota para área: ${area}, idioma: ${language}`
    );
    console.log(`ScoreCalculator: Configuração atual:`, config);

    // Determinar a área correta para LC e a área de questões para filtrar
    let targetArea = area;
    let questionFilterArea = area;

    if (area === "LC0") {
      targetArea = "LC";
      questionFilterArea = "LC0"; // Manter LC0 para filtrar questões
      language = "1"; // LC0 = Inglês = language 1 no modelo
    } else if (area === "LC1") {
      targetArea = "LC";
      questionFilterArea = "LC1"; // Manter LC1 para filtrar questões
      language = "1"; // LC1 = Espanhol = language 1 no modelo
    }

    console.log(
      `ScoreCalculator: Área alvo para modelo: ${targetArea}, área para filtrar questões: ${questionFilterArea}`
    );

    try {
      // Verificar se existe modelo para esta configuração
      const modelExists = await this.modelExists(
        config.year,
        targetArea,
        language
      );

      if (!modelExists) {
        return {
          success: false,
          error: `Modelo não encontrado para ${config.year} - ${targetArea}${
            language ? ` (${language})` : ""
          }`,
          area: area,
          score: null,
        };
      }

      // Carregar o modelo
      const model = await this.loadModel(config.year, targetArea, language);

      if (!model) {
        return {
          success: false,
          error: `Erro ao carregar modelo para ${targetArea}`,
          area: area,
          score: null,
        };
      }

      // Preparar padrão de respostas na ordem de dificuldade
      // Usar questionFilterArea para filtrar as questões corretas
      const pattern = this.prepareDifficultyOrderedPattern(
        questions,
        answers,
        questionFilterArea
      );

      // Garantir que temos exatamente 45 valores
      if (pattern.length !== 45) {
        console.log(
          `ScoreCalculator: Ajustando padrão de ${pattern.length} para 45 elementos`
        );
        // Ajustar o padrão para ter exatamente 45 elementos
        if (pattern.length < 45) {
          // Preencher com zeros se necessário
          pattern.push(...new Array(45 - pattern.length).fill(0));
        } else {
          // Truncar se necessário
          pattern.splice(45);
        }
      }

      console.log(
        `ScoreCalculator: Padrão final preparado para ${area}:`,
        pattern.join("")
      );

      // Calcular a nota usando o modelo
      const score = model.predictWithArray
        ? model.predictWithArray(pattern)
        : model.predict(pattern);

      console.log(`ScoreCalculator: Nota calculada para ${area}: ${score}`);

      return {
        success: true,
        area: area,
        score: Math.round(score * 10) / 10, // Arredondar para 1 casa decimal
        pattern: pattern.join(""),
        modelInfo: model.getModelInfo ? model.getModelInfo() : null,
      };
    } catch (error) {
      console.error(
        `ScoreCalculator: Erro ao calcular nota para ${area}:`,
        error
      );
      return {
        success: false,
        error: error.message,
        area: area,
        score: null,
      };
    }
  }

  /**
   * Calcula notas TRI para todas as áreas do simulado atual
   * @returns {Promise<Object>} Resultados de todas as áreas
   */
  async calculateAllScores() {
    const config = this.app.getCurrentConfig();
    const questions = this.app.getQuestions();

    // Determinar quais áreas calcular baseado no tipo de prova
    const areas = this.getAreasForExamType(config.type, config.language);

    const results = {
      year: config.year,
      examType: config.type,
      language: config.language,
      scores: {},
      totalCalculated: 0,
      errors: [],
    };

    // Calcular nota para cada área
    for (const area of areas) {
      try {
        const result = await this.calculateAreaScore(area.code, area.language);

        if (result.success) {
          results.scores[area.code] = {
            score: result.score,
            pattern: result.pattern,
            name: area.name,
          };
          results.totalCalculated++;
        } else {
          results.errors.push(`${area.name}: ${result.error}`);
        }
      } catch (error) {
        results.errors.push(`${area.name}: ${error.message}`);
      }
    }

    console.log("ScoreCalculator: Resultados finais:", results);
    return results;
  }

  /**
   * Determina as áreas a calcular baseado no tipo de prova
   * @param {string} examType - Tipo de prova
   * @param {string} language - Idioma selecionado
   * @returns {Array} Array de áreas para calcular
   */
  getAreasForExamType(examType, language) {
    const areaMap = {
      LC0: [{ code: "LC0", name: "Linguagens - Inglês", language: "1" }],
      LC1: [{ code: "LC1", name: "Linguagens - Espanhol", language: "1" }],
      CH: [{ code: "CH", name: "Ciências Humanas", language: null }],
      CN: [{ code: "CN", name: "Ciências da Natureza", language: null }],
      MT: [{ code: "MT", name: "Matemática", language: null }],
      dia1: [
        {
          code: language || "LC0",
          name: `Linguagens - ${language === "LC1" ? "Espanhol" : "Inglês"}`,
          language: "1",
        },
        { code: "CH", name: "Ciências Humanas", language: null },
      ],
      dia2: [
        { code: "CN", name: "Ciências da Natureza", language: null },
        { code: "MT", name: "Matemática", language: null },
      ],
    };

    return areaMap[examType] || [];
  }

  /**
   * Limpa o cache de modelos carregados
   */
  clearCache() {
    this.loadedModels.clear();
    console.log("ScoreCalculator: Cache de modelos limpo");
  }
}
