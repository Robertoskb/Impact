// Classe principal do Simulado ENEM
import { DataLoader } from "./DataLoader.js";
import { UIController } from "./UIController.js";
import { QuestionGenerator } from "./QuestionGenerator.js";
import { ResultsCalculator } from "./ResultsCalculator.js";
import { ModalController } from "./ModalController.js";
import { SkillsReportCalculator } from "./SkillsReportCalculator.js";
import { ResultsTabsController } from "./ResultsTabsController.js";
import { SavedSimuladosManager } from "./SavedSimuladosManager.js";
import { ScoreCalculator } from "./ScoreCalculator.js";

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
    this.isLoadingFromSaved = false; // Flag para controlar se está carregando um simulado salvo

    // Instanciar módulos
    this.dataLoader = new DataLoader();
    this.uiController = new UIController(this);
    this.questionGenerator = new QuestionGenerator(this);
    this.resultsCalculator = new ResultsCalculator(this);
    this.modalController = new ModalController(this);
    this.skillsReportCalculator = new SkillsReportCalculator(this);
    this.resultsTabsController = new ResultsTabsController(this);
    this.savedSimuladosManager = new SavedSimuladosManager(this);
    this.scoreCalculator = new ScoreCalculator(this);

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

    // Mostrar a tela de resultados primeiro
    this.uiController.showResultsScreen();

    // Garantir que as descrições de habilidades estejam carregadas
    await this.skillsReportCalculator.loadSkillsDescriptions();

    // Calcular e renderizar relatório de habilidades
    const skillsData = this.skillsReportCalculator.calculateSkillsReport();
    this.skillsReportCalculator.renderSkillsReport(skillsData);

    // Aguardar um pouco para garantir que as abas sejam renderizadas
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Forçar a renderização das abas primeiro
    if (this.resultsTabsController && this.resultsTabsController.resultsData) {
      this.resultsTabsController.renderTabContent("geral");
    }

    // DEPOIS calcular notas TRI para evitar sobrescrita
    console.log("Iniciando cálculo de notas TRI...");
    try {
      const triScores = await this.scoreCalculator.calculateAllScores();
      console.log("Notas TRI calculadas:", triScores);

      // Armazenar as notas TRI para uso nas abas
      this.triScores = triScores;

      // Aguardar um pouco mais para garantir que a aba geral foi renderizada
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Atualizar interface com as notas TRI se calculadas
      this.updateTRIScoresDisplay(triScores);
    } catch (error) {
      console.warn("Erro ao calcular notas TRI:", error);
      this.triScores = null;
    }

    // Mostrar modal de salvamento apenas se não estiver carregando um simulado salvo
    if (!this.isLoadingFromSaved) {
      this.uiController.showSaveConfirmation();
    }

    // Reset da flag
    this.isLoadingFromSaved = false;
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

  // Métodos para simulados salvos
  loadSavedSimulado(simuladoId) {
    const simuladoData = this.savedSimuladosManager.loadSimulado(simuladoId);
    if (simuladoData) {
      this.isLoadingFromSaved = true; // Marcar que está carregando um simulado salvo
      this.savedSimuladosManager.applySimuladoToApp(simuladoData);
      this.calculateAndShowResults();
      return true;
    }
    return false;
  }

  showSavedSimuladosList() {
    this.uiController.showSavedSimuladosScreen();
  }

  getSavedSimulados() {
    return this.savedSimuladosManager.getSavedSimulados();
  }

  deleteSavedSimulado(simuladoId) {
    this.savedSimuladosManager.deleteSimulado(simuladoId);
  }

  saveCurrentSimulado() {
    const simuladoId = this.savedSimuladosManager.saveCurrentSimulado();
    console.log("Simulado salvo com ID:", simuladoId);
    return simuladoId;
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

  /**
   * Atualiza a interface com as notas TRI calculadas
   * @param {Object} triScores - Resultados do cálculo TRI
   */
  updateTRIScoresDisplay(triScores) {
    console.log(
      "🎯 updateTRIScoresDisplay: INICIANDO atualização da interface"
    );

    if (!triScores || !triScores.scores) {
      console.log("❌ updateTRIScoresDisplay: Nenhuma nota TRI para exibir");
      return;
    }

    console.log("✅ updateTRIScoresDisplay: Dados TRI recebidos:", triScores);
    console.log(
      "📊 updateTRIScoresDisplay: Número de notas:",
      Object.keys(triScores.scores).length
    );

    // Função para tentar atualizar a interface
    const tryUpdateInterface = () => {
      console.log("🔍 tryUpdateInterface: Procurando container geral...");

      const generalContainer = document.getElementById("general-stats-content");

      if (!generalContainer) {
        console.warn(
          "⚠️ updateTRIScoresDisplay: Container 'general-stats-content' não encontrado!"
        );
        console.log(
          "🔍 Containers disponíveis:",
          document.querySelectorAll('[id*="content"]')
        );
        return false;
      }

      console.log(
        "✅ tryUpdateInterface: Container encontrado:",
        generalContainer
      );

      if (Object.keys(triScores.scores).length === 0) {
        console.log(
          "⚠️ updateTRIScoresDisplay: Nenhuma nota TRI foi calculada"
        );
        return true; // Não é erro, apenas não há dados
      }

      // Remover seção anterior se existir
      const existingSection = generalContainer.querySelector(
        ".tri-scores-section"
      );
      if (existingSection) {
        console.log("🗑️ Removendo seção TRI anterior");
        existingSection.remove();
      }

      console.log("🎨 Criando nova seção TRI...");

      // Criar nova seção de notas TRI
      const triSection = document.createElement("div");
      triSection.className = "tri-scores-section";
      triSection.style.marginTop = "2rem"; // Garantir espaçamento
      triSection.innerHTML = `
        <h4><i class="fa fa-calculator"></i> 🎯 Notas TRI Estimadas</h4>
        <div class="tri-info-header">
          <p><strong>✨ Calculos com base no padrão de acertos</strong></p>
        </div>
        <div class="tri-scores-grid" id="tri-scores-grid">
          <!-- Notas serão inseridas aqui -->
        </div>
      `;

      generalContainer.appendChild(triSection);
      console.log("✅ Seção TRI adicionada ao container");

      // Preencher as notas
      const triGrid = triSection.querySelector("#tri-scores-grid");
      if (triGrid) {
        triGrid.innerHTML = "";
        console.log("📝 Preenchendo notas TRI...");

        Object.entries(triScores.scores).forEach(([areaCode, data]) => {
          console.log(`💯 Exibindo nota ${areaCode}: ${data.score} pontos`);

          const scoreCard = document.createElement("div");
          scoreCard.className = "score-card";
          scoreCard.innerHTML = `
            <div class="score-area">🎯 ${data.name}</div>
            <div class="score-value">${data.score.toFixed(1)}</div>
            <div class="score-subtitle">pontos TRI</div>
            <div class="score-pattern" title="Padrão de respostas ordenado por dificuldade: ${
              data.pattern
            }">
          }
            </div>
          `;
          triGrid.appendChild(scoreCard);
        });

        // Mostrar informações adicionais
        const infoDiv = document.createElement("div");
        infoDiv.className = "tri-calculation-info";
        infoDiv.innerHTML = `
          <div class="calculation-details">
            <h5><i class="fa fa-info-circle"></i> 📋 Detalhes do Cálculo</h5>
            <ul>
              <li><strong>📅 Ano:</strong> ${triScores.year}</li>
              <li><strong>📚 Tipo de Prova:</strong> ${triScores.examType}</li>
              <li><strong>🎯 Áreas Calculadas:</strong> ${
                triScores.totalCalculated
              }</li>
              ${
                triScores.language
                  ? `<li><strong>🌐 Idioma:</strong> ${triScores.language}</li>`
                  : ""
              }
            </ul>
          </div>
        `;
        triSection.appendChild(infoDiv);

        // Mostrar erros se houver
        if (triScores.errors.length > 0) {
          const errorInfo = document.createElement("div");
          errorInfo.className = "tri-error-info";
          errorInfo.innerHTML = `
            <h5><i class="fa fa-exclamation-triangle"></i> ⚠️ Observações</h5>
            <ul>
              ${triScores.errors.map((error) => `<li>• ${error}</li>`).join("")}
            </ul>
          `;
          triSection.appendChild(errorInfo);
        }
      }

      console.log(
        "🎉 updateTRIScoresDisplay: Interface TRI atualizada com SUCESSO!"
      );

      // Adicionar destaque visual temporário
      triSection.style.border = "3px solid #28a745";
      triSection.style.boxShadow = "0 0 20px rgba(40, 167, 69, 0.3)";

      setTimeout(() => {
        triSection.style.border = "2px solid var(--primary-color)";
        triSection.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.1)";
      }, 2000);

      return true;
    };

    // Tentar atualizar imediatamente
    console.log("🚀 Tentando atualizar interface TRI imediatamente...");
    if (!tryUpdateInterface()) {
      console.log("⏳ Primeira tentativa falhou, aguardando 500ms...");
      // Se falhar, aguardar um pouco e tentar novamente
      setTimeout(() => {
        console.log("🔄 Segunda tentativa...");
        if (!tryUpdateInterface()) {
          console.log("⏳ Segunda tentativa falhou, aguardando 1000ms...");
          // Última tentativa após mais tempo
          setTimeout(() => {
            console.log("🔄 Última tentativa...");
            if (tryUpdateInterface()) {
              console.log("✅ Interface TRI atualizada na terceira tentativa!");
            } else {
              console.error(
                "❌ FALHA: Não foi possível atualizar interface TRI após 3 tentativas"
              );
            }
          }, 1000);
        } else {
          console.log("✅ Interface TRI atualizada na segunda tentativa!");
        }
      }, 500);
    } else {
      console.log("✅ Interface TRI atualizada na primeira tentativa!");
    }

    // Log para debug
    if (triScores.errors.length > 0) {
      console.warn(
        "⚠️ Algumas notas TRI não puderam ser calculadas:",
        triScores.errors
      );
    }
  }

  /**
   * Método auxiliar para garantir que as notas TRI sejam exibidas na aba geral
   * Pode ser chamado a qualquer momento após o cálculo
   */
  ensureTRIScoresDisplay() {
    if (this.triScores) {
      console.log(
        "🔄 ensureTRIScoresDisplay: Re-aplicando notas TRI na interface"
      );
      this.updateTRIScoresDisplay(this.triScores);
    } else {
      console.log("ℹ️ ensureTRIScoresDisplay: Nenhuma nota TRI disponível");
    }
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

  getTRIScores() {
    return this.triScores;
  }

  setAnswer(position, answer) {
    this.answers[position] = answer;
  }
}
