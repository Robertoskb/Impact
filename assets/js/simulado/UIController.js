// Controlador de interface do usuário
export class UIController {
  constructor(app) {
    this.app = app;
  }

  initEventListeners() {
    // Toggle do menu
    const menuToggle = document.getElementById("menuToggleBtn");
    const sidebar = document.getElementById("sidebar");

    if (menuToggle && sidebar) {
      menuToggle.addEventListener("click", () => {
        if (sidebar.style.transform === "translateX(0px)") {
          sidebar.style.transform = "translateX(-250px)";
        } else {
          sidebar.style.transform = "translateX(0px)";
        }
      });
    }

    // Toggle do tema
    const toggleTheme = document.getElementById("toggleTheme");
    if (toggleTheme) {
      toggleTheme.addEventListener("click", this.toggleTheme.bind(this));
    }

    // Event delegation para seleções
    document.addEventListener("click", (e) => {
      const yearBtn = e.target.closest(".year-btn");
      if (yearBtn) {
        this.selectYear(yearBtn.dataset.year);
        return;
      }

      const examTypeBtn = e.target.closest(".exam-type-btn");
      if (examTypeBtn) {
        this.selectExamType(examTypeBtn.dataset.type);
        return;
      }

      const colorBtn = e.target.closest(".color-btn");
      if (colorBtn) {
        this.selectColor(colorBtn.dataset.color);
        return;
      }

      const languageBtn = e.target.closest(".language-btn");
      if (languageBtn) {
        this.selectLanguage(languageBtn.dataset.language);
        return;
      }
    });

    // Botões principais
    this.setupMainButtons();
  }

  setupMainButtons() {
    const startBtn = document.getElementById("start-simulado");
    if (startBtn) {
      startBtn.addEventListener("click", () => this.app.startSimulado());
    }

    const viewSavedBtn = document.getElementById("view-saved-simulados");
    if (viewSavedBtn) {
      viewSavedBtn.addEventListener("click", () =>
        this.app.showSavedSimuladosList()
      );
    }

    const backToConfigBtn = document.getElementById("back-to-config");
    if (backToConfigBtn) {
      backToConfigBtn.addEventListener("click", () => this.showConfigScreen());
    }

    // Modal de exclusão de simulado
    const deleteModal = document.getElementById("delete-simulado-modal");
    const deleteCancelBtn = document.getElementById("delete-cancel");
    const deleteConfirmBtn = document.getElementById("delete-confirm");

    if (deleteCancelBtn) {
      deleteCancelBtn.addEventListener("click", () => {
        deleteModal.style.display = "none";
      });
    }

    if (deleteConfirmBtn) {
      deleteConfirmBtn.addEventListener("click", () => {
        const simuladoId = deleteConfirmBtn.dataset.simuladoId;
        if (simuladoId) {
          this.app.deleteSavedSimulado(simuladoId);
          this.loadSavedSimuladosList();
          deleteModal.style.display = "none";
        }
      });
    }

    // Modal de salvamento de simulado
    const saveModal = document.getElementById("save-simulado-modal");
    const saveCancelBtn = document.getElementById("save-cancel");
    const saveConfirmBtn = document.getElementById("save-confirm");

    if (saveCancelBtn) {
      saveCancelBtn.addEventListener("click", () => {
        saveModal.style.display = "none";
      });
    }

    if (saveConfirmBtn) {
      saveConfirmBtn.addEventListener("click", () => {
        this.app.saveCurrentSimulado();
        saveModal.style.display = "none";
        this.showSaveSuccessMessage();
      });
    }

    const finishBtn = document.getElementById("finish-simulado");
    if (finishBtn) {
      // Criar e armazenar o handler original
      const originalHandler = () => this.app.finishSimulado();

      finishBtn._originalHandler = originalHandler;
      finishBtn.addEventListener("click", originalHandler);
    }

    const backBtn = document.getElementById("back-config");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.app.backToConfig());
    }

    const newSimuladoBtn = document.getElementById("new-simulado");
    if (newSimuladoBtn) {
      newSimuladoBtn.addEventListener("click", () => this.app.newSimulado());
    }

    const reviewBtn = document.getElementById("review-answers");
    if (reviewBtn) {
      reviewBtn.addEventListener("click", () => this.app.reviewAnswers());
    }
  }

  initTheme() {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  loadYearButtons() {
    const yearContainer = document.getElementById("year-selection");
    const years = Object.keys(this.app.getPositions()).sort((a, b) => b - a);

    yearContainer.innerHTML = "";
    years.forEach((year) => {
      const button = document.createElement("button");
      button.className = "year-btn";
      button.dataset.year = year;
      button.textContent = year;
      yearContainer.appendChild(button);
    });

    // Inicializar estado sequencial
    this.initializeSequentialState();
  }

  initializeSequentialState() {
    // Desabilitar todas as etapas exceto ano
    this.disableExamTypeSelection();
    this.disableLanguageSelection();
    this.disableColorSelection();

    // Esconder seção de idioma inicialmente
    const languageSection = document.getElementById("language-section");
    if (languageSection) {
      languageSection.style.display = "none";
    }

    // Atualizar indicadores visuais
    this.updateProgressIndicators();
  }

  selectYear(year) {
    // Limpar seleções posteriores quando ano muda
    this.clearSubsequentSelections("year");

    document.querySelectorAll(".year-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    document.querySelector(`[data-year="${year}"]`).classList.add("selected");
    this.app.currentConfig.year = year;

    // Habilitar próxima etapa (área/tipo)
    this.enableExamTypeSelection();
    this.updateColorSelection(year);
    this.updateProgressIndicators();
    this.updateStartButton();
  }

  selectExamType(type) {
    // Só permitir se ano estiver selecionado
    if (!this.app.currentConfig.year) {
      this.showStepMessage("type", "Selecione um ano primeiro");
      return;
    }

    // Limpar seleções posteriores quando tipo muda
    this.clearSubsequentSelections("type");

    document.querySelectorAll(".exam-type-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    document.querySelector(`[data-type="${type}"]`).classList.add("selected");
    this.app.currentConfig.type = type;

    // Mostrar/esconder seleção de idioma
    const languageSection = document.getElementById("language-section");
    if (type === "dia1") {
      languageSection.style.display = "block";
      this.enableLanguageSelection();
      // Desabilitar seleção de cor até idioma ser escolhido
      this.disableColorSelection();
    } else {
      languageSection.style.display = "none";
      this.app.currentConfig.language = null;
      // Habilitar seleção de cor diretamente
      this.enableColorSelection();
    }

    if (this.app.currentConfig.year) {
      this.updateColorSelection(this.app.currentConfig.year, type);
    }

    this.updateProgressIndicators();
    this.updateStartButton();
  }

  selectColor(color) {
    // Verificar se pode selecionar cor
    if (!this.canSelectColor()) {
      const message = this.getColorSelectionMessage();
      this.showStepMessage("color", message);
      return;
    }

    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    document.querySelector(`[data-color="${color}"]`).classList.add("selected");
    this.app.currentConfig.color = color;
    this.updateProgressIndicators();
    this.updateStartButton();
  }

  selectLanguage(language) {
    // Só permitir se tipo estiver selecionado e for dia1
    if (
      !this.app.currentConfig.type ||
      this.app.currentConfig.type !== "dia1"
    ) {
      this.showStepMessage("language", 'Selecione "1º Dia" primeiro');
      return;
    }

    // Limpar seleções posteriores quando idioma muda
    this.clearSubsequentSelections("language");

    document.querySelectorAll(".language-btn").forEach((btn) => {
      btn.classList.remove("selected");
    });

    document
      .querySelector(`[data-language="${language}"]`)
      .classList.add("selected");
    this.app.currentConfig.language = language;

    // Habilitar seleção de cor
    this.enableColorSelection();

    if (this.app.currentConfig.year) {
      this.updateColorSelection(
        this.app.currentConfig.year,
        this.app.currentConfig.type,
        language
      );
    }

    this.updateProgressIndicators();
    this.updateStartButton();
  }

  updateColorSelection(year, examType = null, language = null) {
    const colorContainer = document.querySelector(".color-selection");
    if (!colorContainer) return;

    if (!year) {
      colorContainer.innerHTML =
        '<p style="color: var(--muted-color); font-style: italic;">Selecione um ano primeiro</p>';
      return;
    }

    if (examType === "dia1" && !language) {
      colorContainer.innerHTML =
        '<p style="color: var(--muted-color); font-style: italic;">Selecione o idioma primeiro</p>';
      return;
    }

    const availableColors = this.getAvailableColors(year, examType, language);

    if (availableColors.length === 0) {
      colorContainer.innerHTML =
        '<p style="color: var(--muted-color); font-style: italic;">Nenhuma cor disponível para este ano</p>';
      return;
    }

    const colorInfo = {
      AZUL: { name: "Azul", class: "blue", value: "azul" },
      AMARELA: { name: "Amarela", class: "yellow", value: "amarela" },
      BRANCA: { name: "Branca", class: "white", value: "branca" },
      ROSA: { name: "Rosa", class: "pink", value: "rosa" },
      VERDE: { name: "Verde", class: "green", value: "verde" },
      CINZA: { name: "Cinza", class: "gray", value: "cinza" },
    };

    colorContainer.innerHTML = "";

    availableColors.forEach((color) => {
      if (colorInfo[color]) {
        const info = colorInfo[color];
        const button = document.createElement("button");
        button.className = "color-btn";
        button.dataset.color = info.value;
        button.innerHTML = `
          <div class="color-circle ${info.class}"></div>
          <span style="pointer-events: none;">${info.name}</span>
        `;
        colorContainer.appendChild(button);
      }
    });

    // Limpar seleção anterior de cor se não estiver disponível
    if (this.app.currentConfig.color) {
      const colorMapping = {
        azul: "AZUL",
        amarela: "AMARELA",
        branca: "BRANCA",
        rosa: "ROSA",
        verde: "VERDE",
        cinza: "CINZA",
      };

      const selectedColorKey = colorMapping[this.app.currentConfig.color];
      if (!availableColors.includes(selectedColorKey)) {
        this.app.currentConfig.color = null;
        this.updateStartButton();
      }
    }
  }

  getAvailableColors(year, examType = null, language = null) {
    const positions = this.app.getPositions();
    if (!positions[year]) return [];

    let areasToCheck = [];
    if (examType) {
      const range = this.app.questionGenerator.getQuestionRanges(examType);
      areasToCheck = range.areas;

      if (examType === "dia1" && language) {
        areasToCheck = [language, "CH"];
      } else if (examType === "dia1") {
        areasToCheck = ["LC0", "CH"];
      }
    } else {
      areasToCheck = Object.keys(positions[year]);
    }

    if (areasToCheck.length === 0) return [];

    const firstAreaWithData = areasToCheck.find((area) => {
      const areaData = positions[year][area];
      return areaData && Object.keys(areaData).length > 0;
    });

    if (!firstAreaWithData) return [];

    const firstQuestion = Object.keys(positions[year][firstAreaWithData])[0];
    const questionData = positions[year][firstAreaWithData][firstQuestion];

    return Object.keys(questionData);
  }

  updateStartButton() {
    const startBtn = document.getElementById("start-simulado");
    const config = this.app.getCurrentConfig();

    let isValid = config.year && config.type && config.color;

    if (config.type === "dia1") {
      isValid = isValid && config.language;
    }

    startBtn.disabled = !isValid;
  }

  showSimuladoScreen() {
    document.getElementById("config-screen").style.display = "none";
    document.getElementById("simulado-screen").style.display = "block";
    document.getElementById("results-screen").style.display = "none";
    document.getElementById("saved-simulados-screen").style.display = "none";

    const config = this.app.getCurrentConfig();
    document.getElementById(
      "simulado-year"
    ).textContent = `Ano: ${config.year}`;
    document.getElementById(
      "simulado-type"
    ).textContent = `Tipo: ${this.getTypeName(config.type)}`;
    document.getElementById(
      "simulado-color"
    ).textContent = `Cor: ${this.getColorName(config.color)}`;
  }

  showConfigScreen() {
    document.getElementById("config-screen").style.display = "block";
    document.getElementById("simulado-screen").style.display = "none";
    document.getElementById("results-screen").style.display = "none";
    document.getElementById("saved-simulados-screen").style.display = "none";
  }

  showSavedSimuladosScreen() {
    document.getElementById("config-screen").style.display = "none";
    document.getElementById("simulado-screen").style.display = "none";
    document.getElementById("results-screen").style.display = "none";
    document.getElementById("saved-simulados-screen").style.display = "block";
    this.loadSavedSimuladosList();
  }

  showResultsScreen() {
    document.getElementById("config-screen").style.display = "none";
    document.getElementById("simulado-screen").style.display = "none";
    document.getElementById("results-screen").style.display = "block";
    document.getElementById("saved-simulados-screen").style.display = "none";
  }

  showDataLoadSuccess() {
    // Pode implementar feedback visual se necessário
  }

  showDataLoadError(error) {
    const yearContainer = document.getElementById("year-selection");
    if (yearContainer) {
      yearContainer.innerHTML =
        '<p style="color: red;">Erro ao carregar dados. Verifique o console.</p>';
    }
  }

  getTypeName(type) {
    const names = {
      dia1: "1º Dia",
      dia2: "2º Dia",
      LC0: "LC - Inglês",
      LC1: "LC - Espanhol",
      CH: "Ciências Humanas",
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };
    return names[type] || type;
  }

  getColorName(color) {
    const names = {
      azul: "Azul",
      amarela: "Amarela",
      branca: "Branca",
      rosa: "Rosa",
      verde: "Verde",
      cinza: "Cinza",
    };
    return names[color] || color;
  }

  renderQuestions() {
    const container = document.getElementById("questions-container");
    container.innerHTML = "";

    this.app.getQuestions().forEach((question) => {
      const questionDiv = this.createQuestionElement(question);
      container.appendChild(questionDiv);
    });
  }

  createQuestionElement(question) {
    const questionDiv = document.createElement("div");
    questionDiv.className = "question-card";

    const questionTitle = question.cancelled
      ? `Questão ${question.position} (ANULADA)`
      : `Questão ${question.position}`;

    const questionDescription = question.cancelled
      ? "Esta questão foi anulada. Qualquer alternativa marcada será considerada correta."
      : `${question.area} - Prova ${this.getColorName(question.color)}`;

    questionDiv.innerHTML = `
      <div class="question-header">
        <div class="question-number">${questionTitle}</div>
        ${
          question.cancelled
            ? '<div class="question-cancelled">ANULADA</div>'
            : ""
        }
      </div>
      <div class="question-text">${questionDescription}</div>
      <div class="alternatives">
        ${["A", "B", "C", "D", "E"]
          .map(
            (letter) => `
          <label class="alternative">
            <input type="radio" name="question_${question.position}" value="${letter}">
            <span class="alternative-letter">${letter}</span>
            <span>Alternativa ${letter}</span>
          </label>`
          )
          .join("")}
      </div>
    `;

    this.setupQuestionEventListeners(questionDiv, question);
    return questionDiv;
  }

  setupQuestionEventListeners(questionDiv, question) {
    questionDiv.querySelectorAll(".alternative").forEach((alternative) => {
      const radio = alternative.querySelector('input[type="radio"]');

      alternative.addEventListener("click", (e) => {
        if (e.target.type === "radio") return;

        radio.checked = true;
        questionDiv.querySelectorAll(".alternative").forEach((alt) => {
          alt.classList.remove("selected");
        });
        alternative.classList.add("selected");
        this.app.setAnswer(question.position, radio.value);
      });

      radio.addEventListener("change", (e) => {
        questionDiv.querySelectorAll(".alternative").forEach((alt) => {
          alt.classList.remove("selected");
        });
        e.target.closest(".alternative").classList.add("selected");
        this.app.setAnswer(question.position, e.target.value);
      });
    });
  }

  showReviewMode() {
    this.showSimuladoScreen();

    const answers = this.app.getAnswers();
    Object.keys(answers).forEach((position) => {
      const radio = document.querySelector(
        `input[name="question_${position}"][value="${answers[position]}"]`
      );
      if (radio) {
        radio.checked = true;
        radio.closest(".alternative").classList.add("selected");
      }
    });

    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.disabled = true;
    });

    // Mudar apenas o texto e função do botão para modo revisão
    this.setReviewModeButton();
  }

  setReviewModeButton() {
    const finishBtn = document.getElementById("finish-simulado");
    finishBtn.innerHTML =
      '<i class="fa fa-arrow-left"></i> Voltar aos Resultados';

    // Armazenar o handler atual para poder remover depois
    if (!finishBtn._originalHandler) {
      finishBtn._originalHandler = () => this.app.finishSimulado();
    }

    // Remover handler original
    finishBtn.removeEventListener("click", finishBtn._originalHandler);

    // Criar handler para modo revisão
    const reviewHandler = () => {
      this.restoreNormalModeButton();
      this.showResultsScreen();
    };

    // Armazenar handler de revisão para poder remover depois
    finishBtn._reviewHandler = reviewHandler;

    // Adicionar handler de revisão
    finishBtn.addEventListener("click", reviewHandler);
  }

  restoreNormalModeButton() {
    const finishBtn = document.getElementById("finish-simulado");
    finishBtn.innerHTML = '<i class="fa fa-check"></i> Finalizar Simulado';

    // Remover handler de revisão
    if (finishBtn._reviewHandler) {
      finishBtn.removeEventListener("click", finishBtn._reviewHandler);
      delete finishBtn._reviewHandler;
    }

    // Restaurar handler original
    if (!finishBtn._originalHandler) {
      finishBtn._originalHandler = () => this.app.finishSimulado();
    }
    finishBtn.addEventListener("click", finishBtn._originalHandler);

    // Habilitar radios novamente
    document.querySelectorAll('input[type="radio"]').forEach((radio) => {
      radio.disabled = false;
    });
  }

  resetUI() {
    document.querySelectorAll(".selected").forEach((el) => {
      el.classList.remove("selected");
    });

    // Remover mensagens de step
    document.querySelectorAll(".step-message").forEach((msg) => {
      if (msg.parentNode) {
        msg.parentNode.removeChild(msg);
      }
    });

    const languageSection = document.getElementById("language-section");
    if (languageSection) {
      languageSection.style.display = "none";
    }

    this.app.currentConfig = {
      year: null,
      type: null,
      color: null,
      language: null,
    };

    // Reinicializar estado sequencial
    this.initializeSequentialState();
    this.updateProgressIndicators();
    this.updateStartButton();
  }

  // Métodos para gerenciar fluxo sequencial
  clearSubsequentSelections(currentStep) {
    const steps = ["year", "type", "language", "color"];
    const currentIndex = steps.indexOf(currentStep);

    // Limpar tudo que vem depois do passo atual
    for (let i = currentIndex + 1; i < steps.length; i++) {
      const step = steps[i];

      switch (step) {
        case "type":
          this.app.currentConfig.type = null;
          document.querySelectorAll(".exam-type-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });
          this.disableExamTypeSelection();
          break;

        case "language":
          this.app.currentConfig.language = null;
          document.querySelectorAll(".language-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });
          this.disableLanguageSelection();
          break;

        case "color":
          this.app.currentConfig.color = null;
          document.querySelectorAll(".color-btn").forEach((btn) => {
            btn.classList.remove("selected");
          });
          this.disableColorSelection();
          break;
      }
    }
  }

  canSelectColor() {
    const config = this.app.currentConfig;

    // Precisa ter ano e tipo selecionados
    if (!config.year || !config.type) {
      return false;
    }

    // Se for dia1, também precisa ter idioma
    if (config.type === "dia1" && !config.language) {
      return false;
    }

    return true;
  }

  getColorSelectionMessage() {
    const config = this.app.currentConfig;

    if (!config.year) {
      return "Selecione um ano primeiro";
    }

    if (!config.type) {
      return "Selecione o tipo de prova primeiro";
    }

    if (config.type === "dia1" && !config.language) {
      return "Selecione o idioma primeiro";
    }

    return "Complete as etapas anteriores";
  }

  showStepMessage(step, message) {
    // Criar ou atualizar mensagem de orientação
    let messageElement = document.querySelector(`.step-message-${step}`);

    if (!messageElement) {
      messageElement = document.createElement("div");
      messageElement.className = `step-message step-message-${step}`;
      messageElement.style.cssText = `
        color: var(--warning-color);
        font-size: 0.9rem;
        margin-top: 0.5rem;
        padding: 0.5rem;
        background: rgba(255, 193, 7, 0.1);
        border-radius: 4px;
        border-left: 3px solid var(--warning-color);
      `;

      // Encontrar o container correto para cada step
      let container;
      switch (step) {
        case "type":
          container = document.querySelector(
            ".exam-type-selection"
          )?.parentNode;
          break;
        case "language":
          container = document.querySelector("#language-section");
          break;
        case "color":
          container = document.querySelector(".color-selection")?.parentNode;
          break;
      }

      if (container) {
        container.appendChild(messageElement);
      }
    }

    messageElement.textContent = message;

    // Remover mensagem após 3 segundos
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.parentNode.removeChild(messageElement);
      }
    }, 3000);
  }

  enableExamTypeSelection() {
    document.querySelectorAll(".exam-type-btn").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
    });
  }

  disableExamTypeSelection() {
    document.querySelectorAll(".exam-type-btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    });
  }

  enableLanguageSelection() {
    document.querySelectorAll(".language-btn").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
    });
  }

  disableLanguageSelection() {
    document.querySelectorAll(".language-btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    });
  }

  enableColorSelection() {
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.disabled = false;
      btn.style.opacity = "1";
      btn.style.pointerEvents = "auto";
    });
  }

  disableColorSelection() {
    document.querySelectorAll(".color-btn").forEach((btn) => {
      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.pointerEvents = "none";
    });
  }

  updateProgressIndicators() {
    const config = this.app.currentConfig;

    // Encontrar seções de configuração
    const sections = {
      year: document
        .querySelector("#year-selection")
        ?.closest(".config-section"),
      type: document
        .querySelector(".exam-type-selection")
        ?.closest(".config-section"),
      language: document
        .querySelector("#language-section")
        ?.closest(".config-section"),
      color: document
        .querySelector(".color-selection")
        ?.closest(".config-section"),
    };

    // Remover classes anteriores
    Object.values(sections).forEach((section) => {
      if (section) {
        section.classList.remove("active", "completed", "disabled");
      }
    });

    // Ano
    if (sections.year) {
      if (config.year) {
        sections.year.classList.add("completed");
      } else {
        sections.year.classList.add("active");
      }
    }

    // Tipo/Área
    if (sections.type) {
      if (!config.year) {
        sections.type.classList.add("disabled");
      } else if (config.type) {
        sections.type.classList.add("completed");
      } else {
        sections.type.classList.add("active");
      }
    }

    // Idioma (se aplicável)
    if (sections.language && config.type === "dia1") {
      if (!config.type) {
        sections.language.classList.add("disabled");
      } else if (config.language) {
        sections.language.classList.add("completed");
      } else {
        sections.language.classList.add("active");
      }
    }

    // Cor
    if (sections.color) {
      if (!this.canSelectColor()) {
        sections.color.classList.add("disabled");
      } else if (config.color) {
        sections.color.classList.add("completed");
      } else {
        sections.color.classList.add("active");
      }
    }
  }

  // Métodos para simulados salvos
  loadSavedSimuladosList() {
    const savedSimulados = this.app.getSavedSimulados();
    const stats = this.app.savedSimuladosManager.getStats();

    // Atualizar estatísticas
    document.getElementById("total-saved").textContent = stats.total;
    document.getElementById(
      "average-performance"
    ).textContent = `${stats.averagePerformance}%`;
    document.getElementById(
      "best-performance"
    ).textContent = `${stats.bestPerformance}%`;
    document.getElementById("recent-count").textContent = stats.recentCount;

    // Renderizar lista de simulados
    this.renderSavedSimuladosList(savedSimulados);
  }

  renderSavedSimuladosList(savedSimulados) {
    const container = document.getElementById("saved-simulados-container");
    if (!container) return;

    if (savedSimulados.length === 0) {
      container.innerHTML = `
        <div class="empty-saved-simulados">
          <i class="fa fa-clipboard-list"></i>
          <h3>Nenhum simulado salvo</h3>
          <p>Faça um simulado e veja seus resultados aqui!</p>
        </div>
      `;
      return;
    }

    // Ordenar por data (mais recente primeiro)
    const sortedSimulados = [...savedSimulados].sort(
      (a, b) => b.timestamp - a.timestamp
    );

    let html = "";

    sortedSimulados.forEach((simulado) => {
      html += `
        <div class="saved-simulado-item">
          <div class="simulado-item-header">
            <div>
              <h4 class="simulado-title">${simulado.title}</h4>
              <span class="simulado-date">${simulado.date}</span>
            </div>
            <div class="simulado-actions">
              <button class="view-btn" onclick="window.simuladoApp.loadSavedSimulado('${simulado.id}')">
                <i class="fa fa-eye"></i> Ver Resultados
              </button>
              <button class="delete-btn" onclick="window.simuladoApp.uiController.showDeleteConfirmation('${simulado.id}')">
                <i class="fa fa-trash"></i> Excluir
              </button>
            </div>
          </div>
          
          <div class="simulado-info">
            <div class="info-item">
              <span class="info-label">Questões</span>
              <span class="info-value">${simulado.questionsCount}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Acertos</span>
              <span class="info-value">${simulado.correctAnswers}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Aproveitamento</span>
              <span class="info-value performance-indicator">${simulado.performance}%</span>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  showDeleteConfirmation(simuladoId) {
    const deleteModal = document.getElementById("delete-simulado-modal");
    const deleteConfirmBtn = document.getElementById("delete-confirm");

    if (deleteModal && deleteConfirmBtn) {
      deleteConfirmBtn.dataset.simuladoId = simuladoId;
      deleteModal.style.display = "flex";
    }
  }

  showSaveConfirmation() {
    const saveModal = document.getElementById("save-simulado-modal");
    if (saveModal) {
      saveModal.style.display = "flex";
    }
  }

  showSaveSuccessMessage() {
    // Criar uma notificação temporária de sucesso
    const notification = document.createElement("div");
    notification.className = "save-success-notification";
    notification.innerHTML = `
      <i class="fa fa-check-circle"></i>
      <span>Simulado salvo com sucesso!</span>
    `;

    document.body.appendChild(notification);

    // Remover após 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }
}
