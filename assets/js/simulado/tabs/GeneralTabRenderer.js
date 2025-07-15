import { BaseTabRenderer } from "./BaseTabRenderer.js";

// Renderizador para a aba geral
export class GeneralTabRenderer extends BaseTabRenderer {
  render(resultsData) {
    const container = document.getElementById("general-stats-content");
    if (!container) {
      console.error(
        "GeneralTabRenderer: Container 'general-stats-content' não encontrado"
      );
      return;
    }

    const { areaPatterns, examOrderPattern } = this.app.resultsCalculator;

    let html = `
      <div class="general-overview">
        <div class="stat-grid">
          <div class="stat-card">
            <h4><i class="fa fa-chart-line"></i> Padrão Geral</h4>
            <p class="pattern-preview">${examOrderPattern}</p>
            <small>Sequência de acertos (1) e erros (0)</small>
          </div>
          
          <div class="stat-card">
            <h4><i class="fa fa-percentage"></i> Taxa de Acerto</h4>
            <p class="percentage-big">${resultsData.performance}%</p>
            <small>${resultsData.correctAnswers} de ${
      resultsData.totalQuestions
    } questões</small>
            ${
              resultsData.cancelledQuestions > 0
                ? `<small class="cancelled-info">(incluindo ${resultsData.cancelledQuestions} questões anuladas)</small>`
                : ""
            }
          </div>
          
          <div class="stat-card">
            <h4><i class="fa fa-layer-group"></i> Áreas Avaliadas</h4>
            <p class="areas-count">${
              Object.keys(areaPatterns).filter(
                (area) => areaPatterns[area].length > 0
              ).length
            }</p>
            <small>Diferentes áreas do conhecimento</small>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }
}
