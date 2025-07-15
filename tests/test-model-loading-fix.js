// Teste específico para os problemas de carregamento de modelo reportados
import { ScoreCalculator } from "./assets/js/simulado/ScoreCalculator.js";

class ModelLoadingTest {
  constructor() {
    this.app = {
      getCurrentConfig: () => ({ year: 2024, type: "dia2", language: null }),
      getQuestions: () => this.generateMockQuestions(),
      getAnswers: () => this.generateMockAnswers(),
      getMeta: () => this.generateMockMeta(),
    };
    this.scoreCalculator = new ScoreCalculator(this.app);
  }

  generateMockQuestions() {
    const questions = [];

    // Gerar questões de CN (Ciências da Natureza)
    for (let i = 1; i <= 45; i++) {
      questions.push({
        position: i,
        originalPosition: i,
        area: "CN",
        cancelled: false,
      });
    }

    // Gerar questões de MT (Matemática)
    for (let i = 46; i <= 90; i++) {
      questions.push({
        position: i,
        originalPosition: i - 45,
        area: "MT",
        cancelled: false,
      });
    }

    return questions;
  }

  generateMockAnswers() {
    const answers = {};

    // Respostas aleatórias para simular um usuário
    for (let i = 1; i <= 90; i++) {
      const options = ["A", "B", "C", "D", "E"];
      answers[i] = options[Math.floor(Math.random() * options.length)];
    }

    return answers;
  }

  generateMockMeta() {
    const meta = { 2024: { CN: {}, MT: {} } };

    // Meta para CN
    for (let i = 1; i <= 45; i++) {
      meta[2024].CN[i] = {
        discrimination: 1.5 + Math.random(),
        difficulty: -1 + Math.random() * 2,
        answer: ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)],
      };
    }

    // Meta para MT
    for (let i = 1; i <= 45; i++) {
      meta[2024].MT[i] = {
        discrimination: 1.5 + Math.random(),
        difficulty: -1 + Math.random() * 2,
        answer: ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)],
      };
    }

    return meta;
  }

  async testModelLoading() {
    console.log("🧪 TESTE: Verificando carregamento de modelos problemáticos");
    console.log("======================================================");

    try {
      // Testar carregamento específico dos modelos que falharam
      console.log("\n📋 Testando modelos individuais...");

      // Teste 1: Matemática 2024
      console.log("\n🧮 Teste 1: Matemática 2024");
      const mtResult = await this.scoreCalculator.calculateAreaScore(
        "MT",
        null
      );
      console.log("Resultado MT:", mtResult);

      // Teste 2: Ciências da Natureza 2024
      console.log("\n🔬 Teste 2: Ciências da Natureza 2024");
      const cnResult = await this.scoreCalculator.calculateAreaScore(
        "CN",
        null
      );
      console.log("Resultado CN:", cnResult);

      // Teste 3: Cálculo completo
      console.log("\n🎯 Teste 3: Cálculo completo (dia2)");
      const allResults = await this.scoreCalculator.calculateAllScores();
      console.log("Resultados completos:", allResults);

      // Análise dos resultados
      console.log("\n📊 ANÁLISE DOS RESULTADOS:");
      console.log("==========================");

      if (mtResult.success) {
        console.log("✅ Matemática: SUCESSO");
        console.log(`   Nota: ${mtResult.score}`);
        console.log(`   Modelo: ${mtResult.modelKey}`);
      } else {
        console.log("❌ Matemática: FALHOU");
        console.log(`   Erro: ${mtResult.error}`);
      }

      if (cnResult.success) {
        console.log("✅ Ciências da Natureza: SUCESSO");
        console.log(`   Nota: ${cnResult.score}`);
        console.log(`   Modelo: ${cnResult.modelKey}`);
      } else {
        console.log("❌ Ciências da Natureza: FALHOU");
        console.log(`   Erro: ${cnResult.error}`);
      }

      console.log(
        `\n📈 Total de áreas calculadas: ${allResults.totalCalculated}/2`
      );
      console.log(`🚨 Total de erros: ${allResults.errors.length}`);

      if (allResults.errors.length > 0) {
        console.log("\n⚠️ ERROS ENCONTRADOS:");
        allResults.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      }

      // Verificar se o problema foi resolvido
      const isFixed =
        mtResult.success && cnResult.success && allResults.errors.length === 0;

      console.log("\n🎉 CONCLUSÃO:");
      console.log("=============");
      if (isFixed) {
        console.log(
          "✅ PROBLEMA RESOLVIDO! Todos os modelos carregaram corretamente."
        );
      } else {
        console.log("❌ PROBLEMA PERSISTE. Alguns modelos ainda falharam.");
      }
    } catch (error) {
      console.error("💥 ERRO CRÍTICO no teste:", error);
      console.error("Stack trace:", error.stack);
    }
  }
}

// Executar teste
console.log("🚀 Iniciando teste de carregamento de modelos...");
const test = new ModelLoadingTest();
test.testModelLoading();
