// Classe principal do Simulado ENEM
import { DataLoader } from "./DataLoader.js";
import { UIController } from "./UIController.js";
import { QuestionGenerator } from "./QuestionGenerator.js";
import { ResultsCalculator } from "./ResultsCalculator.js";
import { ModalController } from "./ModalController.js";
import { SkillsReportCalculator } from "./SkillsReportCalculator.js";

export class SimuladoApp {
  constructor() {
    this.currentConfig = {
      year: null,
      type: null,
      color: null,
      language: null, // Para quando tipo = "dia1"
    };
    this.questions = [];
    this.answers = {};
    this.positions = {};
    this.meta = {};

    // Instanciar módulos
    this.dataLoader = new DataLoader();
    this.uiController = new UIController(this);
    this.questionGenerator = new QuestionGenerator(this);
    this.resultsCalculator = new ResultsCalculator(this);
    this.modalController = new ModalController(this);
    this.skillsReportCalculator = new SkillsReportCalculator(this);

    this.init();
  }

  async init() {
    await this.loadData();
    this.uiController.initEventListeners();
    this.uiController.loadYearButtons();
    this.uiController.updateColorSelection(null); // Inicializar com mensagem
    this.uiController.initTheme();
  }

  async loadData() {
    try {
      const data = await this.dataLoader.loadAllData();
      this.positions = data.positions;
      this.meta = data.meta;
      this.uiController.showDataLoadSuccess();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      this.uiController.showDataLoadError(error);
      // Fallback data
      this.positions = { 2017: { LC0: {}, LC1: {}, CH: {}, CN: {}, MT: {} } };
      this.meta = { 2017: { LC0: {}, LC1: {}, CH: {}, CN: {}, MT: {} } };
    }
  }

  // Métodos de configuração
  selectYear(year) {
    this.uiController.selectYear(year);
  }

  selectExamType(type) {
    this.uiController.selectExamType(type);
  }

  selectColor(color) {
    this.uiController.selectColor(color);
  }

  selectLanguage(language) {
    this.uiController.selectLanguage(language);
  }

  // Métodos do simulado
  startSimulado() {
    this.questions = this.questionGenerator.generateQuestions();
    this.uiController.showSimuladoScreen();
    this.uiController.renderQuestions();
  }

  finishSimulado() {
    this.modalController.showFinishModal();
  }

  async calculateAndShowResults() {
    this.resultsCalculator.calculateResults();

    // Garantir que as descrições de habilidades estejam carregadas
    await this.skillsReportCalculator.loadSkillsDescriptions();

    // Calcular e renderizar relatório de habilidades
    const skillsData = this.skillsReportCalculator.calculateSkillsReport();
    this.skillsReportCalculator.renderSkillsReport(skillsData);

    this.uiController.showResultsScreen();
  }

  backToConfig() {
    this.modalController.showBackModal();
  }

  newSimulado() {
    this.uiController.showConfigScreen();
    this.resetSimulado();
  }

  resetSimulado() {
    this.questions = [];
    this.answers = {};
    this.resultsCalculator.resetPatterns();
    this.uiController.resetUI();

    // Limpar container de habilidades
    const skillsContainer = document.getElementById("skills-container");
    if (skillsContainer) {
      skillsContainer.innerHTML = "";
    }
  }

  reviewAnswers() {
    this.uiController.showReviewMode();
  }

  // Getters para os módulos acessarem os dados
  getCurrentConfig() {
    return this.currentConfig;
  }

  getQuestions() {
    return this.questions;
  }

  getAnswers() {
    return this.answers;
  }

  getPositions() {
    return this.positions;
  }

  getMeta() {
    return this.meta;
  }

  setAnswer(position, answer) {
    this.answers[position] = answer;
  }
}
