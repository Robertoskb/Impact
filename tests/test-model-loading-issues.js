// Diagnóstico: Por que apenas 1 área está sendo calculada?
console.log("🔍 DIAGNÓSTICO: Problemas de carregamento de modelos\n");

// Verificar disponibilidade de modelos para 2024
const modelos2024 = [
  "modelo_de_nota_2024_LC_B_0.js", // Inglês
  "modelo_de_nota_2024_LC_B_1.js", // Espanhol
  "modelo_de_nota_2024_CH_B.js", // Ciências Humanas
  "modelo_de_nota_2024_CN_B.js", // Ciências da Natureza
  "modelo_de_nota_2024_MT_B.js", // Matemática
];

console.log("📋 Modelos esperados para 2024:");
modelos2024.forEach((modelo) => {
  console.log(`- ${modelo}`);
});

// Simular o fluxo de cálculo
function simulateCalculateAllScores() {
  console.log("\n🎯 SIMULANDO calculateAllScores...\n");

  // DIA1 com LC1 (Espanhol)
  const config = { type: "dia1", language: "LC1", year: 2024 };
  console.log("Config:", config);

  // Áreas que deveriam ser calculadas
  const areas = [
    { code: "LC1", name: "Linguagens - Espanhol", language: "1" },
    { code: "CH", name: "Ciências Humanas", language: null },
  ];

  console.log("Áreas para calcular:", areas);

  const results = {
    year: 2024,
    examType: "dia1",
    language: "LC1",
    scores: {},
    totalCalculated: 0,
    errors: [],
  };

  // Simular cálculo para cada área
  areas.forEach((area) => {
    console.log(`\n🔍 Calculando área: ${area.code}`);

    // Determinar modelo necessário
    let targetArea = area.code;
    let modelLanguage = area.language;

    if (area.code === "LC1") {
      targetArea = "LC";
      modelLanguage = "1";
    }

    const modelFileName = `modelo_de_nota_${config.year}_${targetArea}_B${
      modelLanguage ? "_" + modelLanguage : ""
    }.js`;
    console.log(`📁 Modelo necessário: ${modelFileName}`);

    // Verificar se existe
    const modelExists = modelos2024.includes(modelFileName);
    console.log(`✅ Modelo existe? ${modelExists}`);

    if (modelExists) {
      console.log(`✅ ${area.name}: SUCESSO`);
      results.scores[area.code] = {
        score: Math.random() * 200 + 400, // Nota simulada
        pattern: "111000111000...",
        name: area.name,
      };
      results.totalCalculated++;
    } else {
      console.log(`❌ ${area.name}: ERRO - Modelo não encontrado`);
      results.errors.push(
        `${area.name}: Erro ao carregar modelo para ${targetArea}`
      );
    }
  });

  console.log("\n📊 RESULTADOS:");
  console.log(`Total calculado: ${results.totalCalculated}`);
  console.log(`Erros: ${results.errors.length}`);
  results.errors.forEach((error) => console.log(`- ${error}`));

  return results;
}

// DIA2 com CN e MT
function simulateDay2() {
  console.log("\n🔵 SIMULANDO DIA2...\n");

  const config = { type: "dia2", year: 2024 };
  const areas = [
    { code: "CN", name: "Ciências da Natureza", language: null },
    { code: "MT", name: "Matemática", language: null },
  ];

  areas.forEach((area) => {
    const modelFileName = `modelo_de_nota_${config.year}_${area.code}_B.js`;
    console.log(`📁 ${area.name}: ${modelFileName}`);

    const modelExists = modelos2024.includes(modelFileName);
    console.log(`✅ Existe? ${modelExists}`);

    if (!modelExists) {
      console.log(`❌ ERRO: ${area.name} falhará`);
    }
  });
}

// Executar simulações
simulateCalculateAllScores();
simulateDay2();

console.log("\n🔧 POSSÍVEIS CAUSAS:");
console.log("1. Erro no carregamento via script tag");
console.log("2. Cache está falhando");
console.log("3. Problema na cópia do modelo");
console.log("4. window.model sendo limpo muito cedo");
console.log("5. Problema de timing entre carregamentos");

console.log("\n🎯 INVESTIGAR:");
console.log("- Logs do console no navegador");
console.log("- Verificar se scripts estão sendo adicionados ao DOM");
console.log("- Confirmar se modelos estão sendo carregados corretamente");
