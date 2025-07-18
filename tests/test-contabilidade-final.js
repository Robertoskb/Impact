// Teste rápido para verificar se a contabilidade de acertos está funcionando corretamente
// após as correções de mapeamento

console.log("🧪 TESTE: Verificação de Contabilidade de Acertos");
console.log("===============================================");

// Simular um cenário real
const testData = {
  // Configuração do usuário
  config: {
    year: 2023,
    color: "amarela",
    area: "MT",
    type: "MT",
  },

  // Positions.json - estrutura [ano][area][pos_azul] = {cores}
  positions: {
    2023: {
      MT: {
        // Questão 136 da prova azul existe em todas as cores
        136: {
          AZUL: 136,
          AMARELA: 145,
          BRANCA: 138,
          ROSA: 142,
        },
        // Questão 137 da prova azul existe em todas as cores
        137: {
          AZUL: 137,
          AMARELA: 146,
          BRANCA: 139,
          ROSA: 143,
        },
        // Questão 138 da prova azul foi ANULADA - não existe no positions nem no meta
        // Por isso não aparece aqui
      },
    },
  },

  // Meta.json - estrutura [ano][area][pos_azul] = {answer, difficulty, etc}
  meta: {
    2023: {
      MT: {
        136: { answer: "A", difficulty: 0.5, hability: "H1" },
        137: { answer: "B", difficulty: 0.7, hability: "H2" },
        // 138 não existe porque foi anulada
      },
    },
  },

  // Respostas do usuário na prova amarela
  userAnswers: {
    145: "A", // Usuário respondeu A na posição 145 (prova amarela)
    146: "C", // Usuário respondeu C na posição 146 (prova amarela)
    147: "B", // Usuário respondeu B na posição 147 (prova amarela) - esta seria uma questão anulada
  },
};

// Simular o mapeamento correto
function simulateMapping() {
  console.log("\n📍 1. TESTE DE MAPEAMENTO");
  console.log("========================");

  // Questão 145 da prova amarela
  console.log("Questão 145 (prova amarela):");
  // Deve mapear para 136 da prova azul
  let mappedPos = findMappedPosition(
    145,
    "AMARELA",
    testData.positions[2023].MT
  );
  console.log(`  → Mapeada para posição azul: ${mappedPos}`);
  console.log(
    `  → Meta existe? ${testData.meta[2023].MT[mappedPos] ? "SIM" : "NÃO"}`
  );
  if (testData.meta[2023].MT[mappedPos]) {
    console.log(`  → Gabarito: ${testData.meta[2023].MT[mappedPos].answer}`);
  }

  // Questão 146 da prova amarela
  console.log("\nQuestão 146 (prova amarela):");
  mappedPos = findMappedPosition(146, "AMARELA", testData.positions[2023].MT);
  console.log(`  → Mapeada para posição azul: ${mappedPos}`);
  console.log(
    `  → Meta existe? ${testData.meta[2023].MT[mappedPos] ? "SIM" : "NÃO"}`
  );
  if (testData.meta[2023].MT[mappedPos]) {
    console.log(`  → Gabarito: ${testData.meta[2023].MT[mappedPos].answer}`);
  }

  // Questão 147 da prova amarela (anulada)
  console.log("\nQuestão 147 (prova amarela):");
  mappedPos = findMappedPosition(147, "AMARELA", testData.positions[2023].MT);
  console.log(
    `  → Mapeada para posição azul: ${mappedPos || "NÃO ENCONTRADA"}`
  );
  console.log(`  → Esta questão deve ser ANULADA (sem mapeamento)`);
}

function findMappedPosition(position, color, positionsData) {
  for (const [bluePos, colorMap] of Object.entries(positionsData)) {
    if (colorMap[color] === position) {
      return parseInt(bluePos);
    }
  }
  return null;
}

// Simular a contabilidade de acertos
function simulateScoring() {
  console.log("\n🎯 2. TESTE DE CONTABILIDADE");
  console.log("============================");

  let correct = 0;
  let incorrect = 0;
  let cancelled = 0;

  Object.entries(testData.userAnswers).forEach(([position, userAnswer]) => {
    position = parseInt(position);
    console.log(`\nAnalisando resposta ${position}: "${userAnswer}"`);

    // Mapear para posição azul
    const mappedPos = findMappedPosition(
      position,
      "AMARELA",
      testData.positions[2023].MT
    );

    if (!mappedPos) {
      console.log(`  → ANULADA: Sem mapeamento`);
      cancelled++;
      correct++; // Anuladas respondidas contam como acerto
      return;
    }

    console.log(`  → Mapeada para posição azul: ${mappedPos}`);

    // Verificar se existe no meta
    const metaData = testData.meta[2023].MT[mappedPos];
    if (!metaData) {
      console.log(`  → ANULADA: Não existe no meta.json`);
      cancelled++;
      correct++; // Anuladas respondidas contam como acerto
      return;
    }

    // Comparar com gabarito
    const correctAnswer = metaData.answer;
    console.log(`  → Gabarito: ${correctAnswer}`);

    if (userAnswer === correctAnswer) {
      console.log(`  → CORRETO ✅`);
      correct++;
    } else {
      console.log(`  → INCORRETO ❌`);
      incorrect++;
    }
  });

  console.log("\n📊 RESULTADO FINAL:");
  console.log(`  Corretas: ${correct}`);
  console.log(`  Incorretas: ${incorrect}`);
  console.log(`  Anuladas: ${cancelled}`);
  console.log(
    `  Total: ${
      correct + incorrect + (cancelled > 0 ? cancelled - cancelled : 0)
    }`
  ); // Anuladas já estão em corretas
}

// Executar testes
simulateMapping();
simulateScoring();

console.log("\n✅ RESULTADO ESPERADO:");
console.log("- Questão 145 → Correto (A = A)");
console.log("- Questão 146 → Incorreto (C ≠ B)");
console.log("- Questão 147 → Anulada (conta como acerto)");
console.log("- TOTAL: 2 corretas, 1 incorreta");
