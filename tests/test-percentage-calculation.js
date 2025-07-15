// Teste específico para verificar o cálculo de porcentagem nas habilidades
console.log("🧪 Testando cálculo de porcentagem das habilidades...\n");

// Simular dados de uma habilidade
const testCases = [
  {
    name: "Caso 1: 2 acertos, 1 erro, 0 anuladas, 0 em branco",
    data: { correct: 2, wrong: 1, cancelled: 0, total: 3 },
    expectedPercentage: 67, // 2/3 = 66.67% ≈ 67%
  },
  {
    name: "Caso 2: 1 acerto, 0 erros, 1 anulada, 0 em branco",
    data: { correct: 1, wrong: 0, cancelled: 1, total: 2 },
    expectedPercentage: 100, // 1/1 = 100% (anulada não conta)
  },
  {
    name: "Caso 3: 0 acertos, 1 erro, 1 anulada, 1 em branco",
    data: { correct: 0, wrong: 1, cancelled: 1, total: 3 },
    expectedPercentage: 0, // 0/1 = 0% (anulada e branco não contam)
  },
  {
    name: "Caso 4: 3 acertos, 0 erros, 2 anuladas",
    data: { correct: 3, wrong: 0, cancelled: 2, total: 5 },
    expectedPercentage: 100, // 3/3 = 100% (anuladas não contam)
  },
  {
    name: "Caso 5: 0 acertos, 0 erros, 2 anuladas, 1 em branco",
    data: { correct: 0, wrong: 0, cancelled: 2, total: 3 },
    expectedPercentage: 0, // 0/0 = 0% (caso especial - nada respondido válido)
  },
];

// Função atual do código
function calculatePercentageCurrent(skillData) {
  const answeredQuestions = skillData.correct + skillData.wrong;
  const percentage =
    answeredQuestions > 0
      ? Math.round((skillData.correct / answeredQuestions) * 100)
      : 0;
  return percentage;
}

// Função alternativa - considerando total de questões válidas
function calculatePercentageAlternative(skillData) {
  // Total de questões válidas (não anuladas)
  const validQuestions = skillData.total - skillData.cancelled;
  const percentage =
    validQuestions > 0
      ? Math.round((skillData.correct / validQuestions) * 100)
      : 0;
  return percentage;
}

console.log("🔍 TESTANDO CÁLCULOS DE PORCENTAGEM:\n");

testCases.forEach((testCase, index) => {
  console.log(`📊 ${testCase.name}`);
  console.log(
    `   Dados: ${testCase.data.correct} acertos, ${testCase.data.wrong} erros, ${testCase.data.cancelled} anuladas, total: ${testCase.data.total}`
  );

  const currentResult = calculatePercentageCurrent(testCase.data);
  const alternativeResult = calculatePercentageAlternative(testCase.data);

  console.log(`   🔵 Método atual: ${currentResult}%`);
  console.log(`   🟢 Método alternativo: ${alternativeResult}%`);
  console.log(`   🎯 Esperado: ${testCase.expectedPercentage}%`);

  const currentCorrect = currentResult === testCase.expectedPercentage;
  const alternativeCorrect = alternativeResult === testCase.expectedPercentage;

  console.log(`   ✅ Atual ${currentCorrect ? "CORRETO" : "INCORRETO"}`);
  console.log(
    `   ✅ Alternativo ${alternativeCorrect ? "CORRETO" : "INCORRETO"}`
  );
  console.log("");
});

console.log("🤔 ANÁLISE:");
console.log(
  "O método atual considera apenas questões respondidas (acertos + erros)"
);
console.log("Questões em branco não afetam a porcentagem.");
console.log("");
console.log("Questão: deve a porcentagem ser calculada sobre:");
console.log("A) Apenas questões respondidas (atual)");
console.log("B) Todas as questões válidas (não anuladas)");
console.log("");
console.log("❓ Qual comportamento é o esperado?");
