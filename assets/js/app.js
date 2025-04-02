// Função para buscar os dados
async function fetchQuestions() {
    const response = await fetch('questions.json');
    return response.json();
}

// Atualizado: Obtém os filtros selecionados incluindo busca
function getSelectedFilters() {
    const anos = Array.from(document.querySelectorAll('button[data-filter="ano"].active'))
                      .map(btn => btn.dataset.value);
    const areas = Array.from(document.querySelectorAll('button[data-filter="area"].active'))
                      .map(btn => btn.dataset.value);
    const acertosBtn = document.querySelector('button[data-filter="acertos"].active');
    const acertos = acertosBtn ? acertosBtn.dataset.value : null;
    const search = document.getElementById('search').value.trim();
    return { anos, areas, acertos, search };
}

// Limpa a área de resultados
function clearResults() {
    document.getElementById('results').innerHTML = '';
}

// Exibe mensagem de erro
function showError(error) {
    const results = document.getElementById('results');
    results.innerHTML = '<p>Erro ao carregar os dados.</p>';
    console.error(error);
}

// Cria o elemento de questão e anexa o listener
function createQuestionElement(ano, area, numero, impacto) {
    const questionKey = `${ano}|${area}|${numero}`;
    let isDone = localStorage.getItem(questionKey) === 'true';
    const questionDiv = document.createElement('div');
    let baseClasses = "question-item";
    if (isDone) baseClasses += " done";
    questionDiv.className = baseClasses;
    questionDiv.innerHTML = `
        <div class="item-content" style="display: flex; align-items: center; gap: 0.5rem;">
            <span class="checkmark-icon">
                <i class="fa ${ isDone ? 'fa-check-circle' : 'fa-circle'}"></i>
            </span>
            <span class="question-text">Questão ${numero}</span>
            <span class="dropdown-toggle" style="cursor: pointer;">
                <i class="fa fa-caret-down"></i>
            </span>
            <span class="impact-info" style="margin-left:auto;">
                ${impacto.toFixed(2)}% de impacto
            </span>
        </div>
        <div class="question-details" style="display: none;">
            <div>Data: ${ano}</div>
            <div>Área: ${area}</div>
        </div>
    `;
    // Listener para dropdown (evita propagação para o evento de toggle da questão)
    const dropdownToggle = questionDiv.querySelector('.dropdown-toggle');
    const detailsDiv = questionDiv.querySelector('.question-details');
    dropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if(detailsDiv.style.display === "none"){
            detailsDiv.style.display = "block";
            dropdownToggle.innerHTML = '<i class="fa fa-caret-up"></i>';
        } else {
            detailsDiv.style.display = "none";
            dropdownToggle.innerHTML = '<i class="fa fa-caret-down"></i>';
        }
    });
    // Listener para marcar como concluída
    questionDiv.addEventListener('click', () => {
        const newState = !isDone;
        localStorage.setItem(questionKey, newState ? 'true' : 'false');
        questionDiv.classList.toggle("done", newState);
        const checkmarkIcon = questionDiv.querySelector('.checkmark-icon i');
        if (checkmarkIcon) {
            checkmarkIcon.className = newState ? 'fa fa-check-circle' : 'fa fa-circle';
        }
        isDone = newState;
    });
    return questionDiv;
}

// Atualizado: Renderiza uma seção considerando o termo da busca
function renderSection(ano, areasData, selectedArea, acertos, search) {
    if (areasData[selectedArea] && acertos && areasData[selectedArea][acertos]) {
        const section = document.createElement('div');
        section.className = "result-section";
        section.innerHTML = `<h2 class="h5 mb-3">${ano} Caderno Azul - ${selectedArea}</h2>`;
        const questionsList = document.createElement('div');
        questionsList.className = "row g-2";
        areasData[selectedArea][acertos].forEach(([impacto, numero]) => {
            const questionEl = createQuestionElement(ano, selectedArea, numero, impacto);
            // Filtra pela busca (caso haja termo, compara com o texto da questão)
            if (!search || questionEl.textContent.toLowerCase().includes(search.toLowerCase())) {
                const col = document.createElement('div');
                col.className = "col-12";
                col.appendChild(questionEl);
                questionsList.appendChild(col);
            }
        });
        section.appendChild(questionsList);
        return section;
    }
    return null;
}

// Atualizado: Função principal que carrega e renderiza as questões
async function loadAndRenderQuestions() {
    clearResults();
    const { anos, areas, acertos, search } = getSelectedFilters();
    try {
        const data = await fetchQuestions();
        const sortedData = Object.entries(data).sort(([anoA], [anoB]) => anoB - anoA);
        const results = document.getElementById('results');
        sortedData.forEach(([year, areasData]) => {
            if (anos.length && !anos.includes(year)) return;
            if (areas.length) {
                areas.forEach(selectedArea => {
                    const section = renderSection(year, areasData, selectedArea, acertos, search);
                    if (section) {
                        results.appendChild(section);
                    }
                });
            } else {
                Object.keys(areasData).forEach(selectedArea => {
                    const section = renderSection(year, areasData, selectedArea, acertos, search);
                    if (section) {
                        results.appendChild(section);
                    }
                });
            }
        });
    } catch (error) {
        showError(error);
    }
}

// Atualizado: Adiciona listener para o input de busca
function bindEvents() {
    document.getElementById('carregarBtn').addEventListener('click', loadAndRenderQuestions);
    
    // Listener para os botões de filtros
    document.querySelectorAll('button[data-filter]').forEach(btn => {
        btn.addEventListener('click', function () {
            const filter = btn.getAttribute('data-filter');
            if (filter === 'acertos') {
                // Apenas um botão de acertos pode ficar ativo
                document.querySelectorAll('button[data-filter="acertos"]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            } else {
                btn.classList.toggle('active');
            }
            loadAndRenderQuestions();
        });
    });
    
    // Listener para o input de busca
    document.getElementById('search').addEventListener('input', loadAndRenderQuestions);
    
    document.getElementById('toggleTheme').addEventListener('click', (e) => {
        e.preventDefault();
        toggleTheme();
    });
    bindMenuToggle();
}

// Alterna entre tema light e dark usando o atributo data-theme
function toggleTheme() {
    const htmlEl = document.documentElement;
    const currentTheme = htmlEl.getAttribute("data-theme") || "light";
    if (currentTheme === "light") {
        htmlEl.setAttribute("data-theme", "dark");
        localStorage.setItem("theme", "dark");
    } else {
        htmlEl.setAttribute("data-theme", "light");
        localStorage.setItem("theme", "light");
    }
}

// Inicializa o tema conforme localStorage
function initTheme() {
    const storedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", storedTheme);
}

// Adiciona listener para alternar o menu lateral no mobile
function bindMenuToggle() {
    const menuBtn = document.getElementById('menuToggleBtn');
    const sidebar = document.getElementById('sidebar');
    menuBtn.addEventListener('click', () => {
        if (sidebar.style.transform === "translateX(0px)") {
            sidebar.style.transform = "translateX(-250px)";
        } else {
            sidebar.style.transform = "translateX(0px)";
        }
    });
}

// Inicializa a aplicação ao carregar a página
window.addEventListener('load', () => {
    initTheme();
    bindEvents();
    loadAndRenderQuestions();
});
