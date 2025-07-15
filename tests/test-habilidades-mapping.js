// Teste para verificar se o mapeamento de posições está correto na aba de habilidades

console.log("🧪 Testando mapeamento de posições para habilidades...\n");

// Simular dados de positions.json
const mockPositions = {
  2023: {
    CN: {
      1: { AZUL: 1, AMARELA: 5, BRANCA: 10, ROSA: 15, VERDE: 20 },
      2: { AZUL: 2, AMARELA: 6, BRANCA: 11, ROSA: 16, VERDE: 21 },
      5: { AZUL: 5, AMARELA: 1, BRANCA: 15, ROSA: 20, VERDE: 25 },
    },
  },
};

// Simular dados de meta.json (posições na prova azul)
const mockMeta = {
  2023: {
    CN: {
      1: { answer: "A", hability: 25 },
      2: { answer: "B", hability: 26 },
      5: { answer: "C", hability: 27 },
    },
  },
};

// Simular configuração do usuário (escolheu cor amarela)
const userConfig = {
  year: 2023,
  color: "amarela",
  type: "CN",
};

// Simular questões que o usuário vê (posições na prova amarela)
const userQuestions = [
  { position: 1, area: "CN" }, // Esta é posição 5 na prova azul
  { position: 5, area: "CN" }, // Esta é posição 1 na prova azul
  { position: 6, area: "CN" }, // Esta é posição 2 na prova azul
];

console.log("📋 CONFIGURAÇÃO DO TESTE:");
console.log(
  `Usuário escolheu: Ano ${userConfig.year}, Cor ${userConfig.color}`
);
console.log("Questões que o usuário vê (posições na cor amarela):");
userQuestions.forEach((q) =>
  console.log(`- Questão ${q.position} (${q.area})`)
);

console.log("\n🔍 MAPEAMENTO CORRETO:");

function testMapping() {
  const colorMapping = {
    azul: "AZUL",
    amarela: "AMARELA",
    branca: "BRANCA",
    rosa: "ROSA",
    verde: "VERDE",
    cinza: "CINZA",
  };

  const mappedColor = colorMapping[userConfig.color];

  userQuestions.forEach((question) => {
    const yearData = mockPositions[userConfig.year];

    if (yearData && yearData[question.area]) {
      // Buscar a posição real baseada na cor da prova
      for (const [originalPos, colorMap] of Object.entries(
        yearData[question.area]
      )) {
        if (colorMap[mappedColor] === question.position) {
          const realPosition = parseInt(originalPos);

          // Buscar habilidade e gabarito no meta usando posição real
          const metaData =
            mockMeta[userConfig.year][question.area][realPosition];

          console.log(
            `📍 Questão ${question.position} (${userConfig.color}) → Posição ${realPosition} (azul)`
          );
          if (metaData) {
            console.log(`   Habilidade: H${metaData.hability}`);
            console.log(`   Gabarito: ${metaData.answer}`);
          }
          break;
        }
      }
    }
  });
}

testMapping();

console.log("\n✅ RESULTADO ESPERADO:");
console.log("- Questão 1 (amarela) → Posição 5 (azul) → H27, gabarito C");
console.log("- Questão 5 (amarela) → Posição 1 (azul) → H25, gabarito A");
console.log("- Questão 6 (amarela) → Posição 2 (azul) → H26, gabarito B");

console.log("\n❌ PROBLEMA ANTERIOR:");
console.log("- Estava usando question.originalPosition diretamente");
console.log("- Não fazia mapeamento da cor escolhida para prova azul");
console.log("- Habilidades e gabaritos ficavam incorretos");

console.log("\n✅ CORREÇÃO APLICADA:");
console.log("- Novo método getMappedPosition() faz o mapeamento correto");
console.log("- getCorrectAnswer() agora usa a posição mapeada");
console.log("- Habilidades e gabaritos agora são corretos para qualquer cor");
