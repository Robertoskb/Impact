// Teste da correção do cálculo de porcentagem
console.log("🧪 Testando CORREÇÃO do cálculo de porcentagem...\n");

// Função corrigida
function calculatePercentageCorrected(skillData) {
  // Calcular porcentagem sobre questões válidas (não anuladas)
  // Questões em branco são consideradas como "não dominadas" na habilidade
  const validQuestions = skillData.total - skillData.cancelled;
  const percentage =
    validQuestions > 0
      ? Math.round((skillData.correct / validQuestions) * 100)
      : 0;
  return percentage;
}

const testCases = [
  {
    name: "Cenário Real: 1 acerto, 1 erro, 1 anulada, 1 em branco",
    data: { correct: 1, wrong: 1, cancelled: 1, total: 4 },
    expectedOld: 50, // 1/2 = 50% (método antigo)
    expectedNew: 33, // 1/3 = 33% (método novo)
  },
  {
    name: "Caso simples: 2 acertos, 1 erro (todas respondidas)",
    data: { correct: 2, wrong: 1, cancelled: 0, total: 3 },
    expectedOld: 67, // 2/3 = 67%
    expectedNew: 67, // 2/3 = 67% (mesmo resultado)
  },
  {
    name: "Com anuladas: 3 acertos, 1 erro, 2 anuladas",
    data: { correct: 3, wrong: 1, cancelled: 2, total: 6 },
    expectedOld: 75, // 3/4 = 75% (método antigo)
    expectedNew: 75, // 3/4 = 75% (mesmo resultado)
  },
  {
    name: "Muitas em branco: 1 acerto, 0 erros, 0 anuladas, 3 em branco",
    data: { correct: 1, wrong: 0, cancelled: 0, total: 4 },
    expectedOld: 100, // 1/1 = 100% (método antigo - só respondidas)
    expectedNew: 25, // 1/4 = 25% (método novo - todas válidas)
  },
];

console.log("📊 COMPARAÇÃO DOS MÉTODOS:\n");

testCases.forEach((testCase) => {
  console.log(`🎯 ${testCase.name}`);
  console.log(
    `   Dados: ${testCase.data.correct}C, ${testCase.data.wrong}E, ${testCase.data.cancelled}A, ${testCase.data.total}T`
  );

  // Simular método antigo
  const answeredQuestions = testCase.data.correct + testCase.data.wrong;
  const oldResult =
    answeredQuestions > 0
      ? Math.round((testCase.data.correct / answeredQuestions) * 100)
      : 0;

  // Método novo
  const newResult = calculatePercentageCorrected(testCase.data);

  console.log(
    `   📊 Método antigo: ${oldResult}% (${testCase.data.correct}/${answeredQuestions} respondidas)`
  );
  console.log(
    `   📈 Método novo: ${newResult}% (${testCase.data.correct}/${
      testCase.data.total - testCase.data.cancelled
    } válidas)`
  );
  console.log(
    `   ✅ Esperado antigo: ${testCase.expectedOld}%, novo: ${testCase.expectedNew}%`
  );
  console.log("");
});

console.log("🎓 ANÁLISE PEDAGÓGICA:");
console.log("");
console.log("📚 Método ANTIGO (acertos/respondidas):");
console.log("   ✅ Não penaliza questões em branco");
console.log("   ❌ Pode inflar artificialmente a porcentagem");
console.log(
  "   ❌ Estudante pode parecer dominar habilidade mesmo deixando muitas em branco"
);
console.log("");
console.log("📖 Método NOVO (acertos/válidas):");
console.log("   ✅ Reflete melhor o domínio real da habilidade");
console.log("   ✅ Questões em branco indicam falta de conhecimento");
console.log("   ✅ Porcentagem mais realista para feedback pedagógico");
console.log('   ❌ Pode ser mais "dura" com o estudante');
console.log("");
console.log(
  "🎯 CONCLUSÃO: O método novo é mais adequado para avaliação educacional!"
);
