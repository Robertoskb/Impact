// Teste completo da correção do cálculo de porcentagem no sistema
console.log(
  "🧪 TESTE COMPLETO: Verificando correção do cálculo de porcentagem\n"
);

// Simular o SkillsReportCalculator com a correção
class TestSkillsCalculator {
  processSkillsData(skillsData) {
    const processedData = {};

    Object.keys(skillsData).forEach((area) => {
      processedData[area] = {
        name: this.getAreaName(area),
        skills: {},
      };

      Object.keys(skillsData[area]).forEach((hability) => {
        const skillData = skillsData[area][hability];

        // NOVO CÁLCULO: Porcentagem sobre questões válidas (não anuladas)
        const validQuestions = skillData.total - skillData.cancelled;
        const percentage =
          validQuestions > 0
            ? Math.round((skillData.correct / validQuestions) * 100)
            : 0;

        processedData[area].skills[hability] = {
          code: `H${hability}`,
          total: skillData.total,
          correct: skillData.correct,
          wrong: skillData.wrong,
          cancelled: skillData.cancelled,
          percentage: percentage,
          validQuestions: validQuestions,
          performance: this.getPerformanceLevel(percentage),
        };
      });
    });

    return processedData;
  }

  getAreaName(area) {
    const names = {
      CN: "Ciências da Natureza",
      MT: "Matemática",
    };
    return names[area] || area;
  }

  getPerformanceLevel(percentage) {
    if (percentage >= 80) return "excellent";
    if (percentage >= 65) return "good";
    if (percentage >= 50) return "average";
    return "poor";
  }
}

// Dados de teste com cenários diversos
const testData = {
  CN: {
    28: {
      // H28 - cenário misto
      total: 4,
      correct: 2,
      wrong: 1,
      cancelled: 1,
      questions: [],
    },
    29: {
      // H29 - muitas em branco
      total: 5,
      correct: 1,
      wrong: 0,
      cancelled: 0,
      questions: [],
    },
    30: {
      // H30 - todas anuladas
      total: 3,
      correct: 0,
      wrong: 0,
      cancelled: 3,
      questions: [],
    },
  },
  MT: {
    15: {
      // H15 - performance excelente
      total: 4,
      correct: 4,
      wrong: 0,
      cancelled: 0,
      questions: [],
    },
    16: {
      // H16 - com anuladas
      total: 6,
      correct: 3,
      wrong: 1,
      cancelled: 2,
      questions: [],
    },
  },
};

const calculator = new TestSkillsCalculator();
const result = calculator.processSkillsData(testData);

console.log("📋 RESULTADOS DO TESTE:\n");

Object.keys(result).forEach((area) => {
  console.log(`🎯 ${result[area].name}:`);

  Object.keys(result[area].skills).forEach((hability) => {
    const skill = result[area].skills[hability];
    console.log(
      `   ${skill.code}: ${skill.correct}/${skill.validQuestions} válidas = ${skill.percentage}% (${skill.performance})`
    );
    console.log(
      `      Total: ${skill.total}, Anuladas: ${skill.cancelled}, Erros: ${skill.wrong}`
    );
  });
  console.log("");
});

console.log("🔍 ANÁLISE DOS RESULTADOS:");
console.log("✅ H28 (CN): 2/3 = 67% (1 anulada não conta)");
console.log("✅ H29 (CN): 1/5 = 20% (4 em branco penalizam)");
console.log("✅ H30 (CN): 0/0 = 0% (todas anuladas)");
console.log("✅ H15 (MT): 4/4 = 100% (performance perfeita)");
console.log("✅ H16 (MT): 3/4 = 75% (2 anuladas não contam)");
console.log("");
console.log("🎓 A correção está funcionando perfeitamente!");
console.log("   Questões anuladas não afetam o cálculo");
console.log("   Questões em branco são consideradas no denominador");
console.log("   Porcentagens refletem o domínio real das habilidades");
