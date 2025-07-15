// Teste para verificar se questões anuladas estão sendo tratadas corretamente
// nas estatísticas de habilidades

console.log("🧪 Testando tratamento de questões anuladas nas habilidades...");

// Simular dados de teste
const testQuestions = [
  { position: 1, hability: 25, area: "CN", cancelled: false },
  { position: 2, hability: 25, area: "CN", cancelled: false },
  { position: 3, hability: 25, area: "CN", cancelled: true }, // ANULADA
  { position: 4, hability: 26, area: "CN", cancelled: false },
  { position: 5, hability: 26, area: "CN", cancelled: true }, // ANULADA
];

const testAnswers = {
  1: "A", // Correto
  2: "B", // Errado
  3: "C", // Anulada (não deveria contar)
  4: "A", // Correto
  5: "D", // Anulada (não deveria contar)
};

const testMeta = {
  2023: {
    CN: {
      1: { answer: "A" },
      2: { answer: "A" },
      // 3 não existe (anulada)
      4: { answer: "A" },
      // 5 não existe (anulada)
    },
  },
};

// Simular processamento
function testSkillsCalculation() {
  const skillsData = {};

  testQuestions.forEach((question) => {
    const area = question.area;
    const hability = question.hability;

    if (!skillsData[area]) {
      skillsData[area] = {};
    }

    if (!skillsData[area][hability]) {
      skillsData[area][hability] = {
        total: 0,
        correct: 0,
        wrong: 0,
        cancelled: 0,
        questions: [],
      };
    }

    const skillData = skillsData[area][hability];
    skillData.total++;
    skillData.questions.push(question);

    // Lógica corrigida
    if (question.cancelled) {
      skillData.cancelled++;
      // Questões anuladas NÃO contam como acerto nem erro
    } else {
      const correctAnswer = testMeta[2023][area][question.position]?.answer;
      const userAnswer = testAnswers[question.position];

      if (userAnswer && userAnswer === correctAnswer) {
        skillData.correct++;
      } else if (userAnswer) {
        skillData.wrong++;
      }
    }
  });

  // Processar resultados
  Object.keys(skillsData).forEach((area) => {
    Object.keys(skillsData[area]).forEach((hability) => {
      const skillData = skillsData[area][hability];

      // Calcular porcentagem apenas com questões respondidas
      const answeredQuestions = skillData.correct + skillData.wrong;
      const percentage =
        answeredQuestions > 0
          ? Math.round((skillData.correct / answeredQuestions) * 100)
          : 0;

      console.log(`\n📊 Habilidade H${hability}:`);
      console.log(`   Total de questões: ${skillData.total}`);
      console.log(`   Questões anuladas: ${skillData.cancelled}`);
      console.log(`   Acertos: ${skillData.correct}`);
      console.log(`   Erros: ${skillData.wrong}`);
      console.log(`   Questões respondidas: ${answeredQuestions}`);
      console.log(`   Porcentagem de acerto: ${percentage}%`);
    });
  });
}

testSkillsCalculation();

console.log("\n✅ Resultado esperado:");
console.log(
  "H25: 1 acerto, 1 erro, 1 anulada → 50% de acerto (1/2 respondidas)"
);
console.log(
  "H26: 1 acerto, 0 erros, 1 anulada → 100% de acerto (1/1 respondidas)"
);
console.log("\n❌ Resultado ANTERIOR (incorreto):");
console.log(
  "H25: 2 acertos, 1 erro, 1 anulada → 67% de acerto (incluía anuladas como acerto)"
);
console.log(
  "H26: 2 acertos, 0 erros, 1 anulada → 100% de acerto (incluía anuladas como acerto)"
);
