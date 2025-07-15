// Teste real com dados do sistema para verificar o problema de porcentagem
console.log(
  "🧪 Teste REAL do cálculo de porcentagem com dados do sistema...\n"
);

// Simular uma execução real
const testScenario = {
  questions: [
    { position: 1, area: "CN", cancelled: false },
    { position: 2, area: "CN", cancelled: false },
    { position: 3, area: "CN", cancelled: true }, // Anulada
    { position: 4, area: "CN", cancelled: false },
  ],
  answers: {
    1: "A", // Usuário respondeu
    2: "B", // Usuário respondeu
    3: "C", // Usuário respondeu (mas questão anulada)
    4: null, // Usuário não respondeu (em branco)
  },
  correctAnswers: {
    1: "A", // Acerto
    2: "C", // Erro
    3: "A", // Irrelevante (anulada)
    4: "D", // Não respondida
  },
  meta: {
    1: { hability: 28 },
    2: { hability: 28 },
    3: { hability: 28 },
    4: { hability: 28 },
  },
};

console.log("📋 CENÁRIO DE TESTE:");
console.log("4 questões da habilidade H28 (CN):");
testScenario.questions.forEach((q, i) => {
  const userAnswer = testScenario.answers[q.position];
  const correctAnswer = testScenario.correctAnswers[q.position];
  const status = q.cancelled
    ? "ANULADA"
    : userAnswer === null
    ? "EM BRANCO"
    : userAnswer === correctAnswer
    ? "ACERTO"
    : "ERRO";
  console.log(
    `  Q${q.position}: Usuário=${
      userAnswer || "null"
    }, Gabarito=${correctAnswer}, Status=${status}`
  );
});

// Simular processamento do SkillsReportCalculator
let skillData = {
  total: 0,
  correct: 0,
  wrong: 0,
  cancelled: 0,
  questions: [],
};

console.log("\n🔍 PROCESSAMENTO PASSO A PASSO:");

testScenario.questions.forEach((question) => {
  skillData.total++;
  skillData.questions.push(question);

  console.log(`\nProcessando questão ${question.position}:`);

  if (question.cancelled) {
    skillData.cancelled++;
    console.log(`  ❌ Anulada - cancelled++`);
  } else {
    const correctAnswer = testScenario.correctAnswers[question.position];
    const userAnswer = testScenario.answers[question.position];

    console.log(`  👤 Resposta usuário: ${userAnswer || "null"}`);
    console.log(`  ✅ Resposta correta: ${correctAnswer}`);

    if (userAnswer && userAnswer === correctAnswer) {
      skillData.correct++;
      console.log(`  🎯 ACERTO - correct++`);
    } else if (userAnswer) {
      skillData.wrong++;
      console.log(`  ❌ ERRO - wrong++`);
    } else {
      console.log(`  ⚪ EM BRANCO - não conta nem acerto nem erro`);
    }
  }

  console.log(
    `  📊 Status atual: ${skillData.correct}C/${skillData.wrong}E/${skillData.cancelled}A/${skillData.total}T`
  );
});

console.log("\n📊 RESULTADOS FINAIS:");
console.log(`Total: ${skillData.total}`);
console.log(`Corretas: ${skillData.correct}`);
console.log(`Erradas: ${skillData.wrong}`);
console.log(`Anuladas: ${skillData.cancelled}`);

// Cálculo atual
const answeredQuestions = skillData.correct + skillData.wrong;
const currentPercentage =
  answeredQuestions > 0
    ? Math.round((skillData.correct / answeredQuestions) * 100)
    : 0;

// Cálculo alternativo 1: sobre questões válidas (não anuladas)
const validQuestions = skillData.total - skillData.cancelled;
const validPercentage =
  validQuestions > 0
    ? Math.round((skillData.correct / validQuestions) * 100)
    : 0;

// Cálculo alternativo 2: sobre total de questões
const totalPercentage =
  skillData.total > 0
    ? Math.round((skillData.correct / skillData.total) * 100)
    : 0;

console.log("\n🧮 CÁLCULOS DE PORCENTAGEM:");
console.log(
  `1️⃣ Método atual (acertos/respondidas): ${skillData.correct}/${answeredQuestions} = ${currentPercentage}%`
);
console.log(
  `2️⃣ Sobre questões válidas (acertos/válidas): ${skillData.correct}/${validQuestions} = ${validPercentage}%`
);
console.log(
  `3️⃣ Sobre total (acertos/total): ${skillData.correct}/${skillData.total} = ${totalPercentage}%`
);

console.log("\n🎯 QUAL DEVE SER O COMPORTAMENTO ESPERADO?");
console.log("Para H28 com 1 acerto, 1 erro, 1 anulada, 1 em branco:");
console.log("- Método 1: 50% (1 acerto de 2 respondidas)");
console.log("- Método 2: 33% (1 acerto de 3 válidas)");
console.log("- Método 3: 25% (1 acerto de 4 total)");
console.log("\n❓ Qual porcentagem faz mais sentido pedagogicamente?");
