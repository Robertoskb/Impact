// Teste específico para verificar o problema do getAreasForExamType
console.log("🔍 Testando getAreasForExamType para DIA1 com LC1...\n");

function getAreasForExamType(examType, language) {
  console.log(`🎯 getAreasForExamType: tipo=${examType}, idioma=${language}`);

  const areaMap = {
    LC0: [{ code: "LC0", name: "Linguagens - Inglês", language: "0" }],
    LC1: [{ code: "LC1", name: "Linguagens - Espanhol", language: "1" }],
    CH: [{ code: "CH", name: "Ciências Humanas", language: null }],
    CN: [{ code: "CN", name: "Ciências da Natureza", language: null }],
    MT: [{ code: "MT", name: "Matemática", language: null }],
    dia1: [
      {
        code: language || "LC0",
        name: `Linguagens - ${language === "LC1" ? "Espanhol" : "Inglês"}`,
        language: language === "LC1" ? "1" : "0",
      },
      { code: "CH", name: "Ciências Humanas", language: null },
    ],
    dia2: [
      { code: "CN", name: "Ciências da Natureza", language: null },
      { code: "MT", name: "Matemática", language: null },
    ],
  };

  const result = areaMap[examType] || [];
  console.log(`✅ Áreas retornadas:`, result);
  return result;
}

console.log("🔴 TESTE 1: DIA1 com LC1 (Espanhol)");
const areasDia1LC1 = getAreasForExamType("dia1", "LC1");
areasDia1LC1.forEach((area, index) => {
  console.log(
    `Área ${index + 1}: code="${area.code}", language="${area.language}"`
  );
});

console.log("\n🔵 TESTE 2: DIA1 com LC0 (Inglês)");
const areasDia1LC0 = getAreasForExamType("dia1", "LC0");
areasDia1LC0.forEach((area, index) => {
  console.log(
    `Área ${index + 1}: code="${area.code}", language="${area.language}"`
  );
});

console.log("\n🟢 TESTE 3: DIA1 sem idioma (fallback)");
const areasDia1Fallback = getAreasForExamType("dia1", null);
areasDia1Fallback.forEach((area, index) => {
  console.log(
    `Área ${index + 1}: code="${area.code}", language="${area.language}"`
  );
});

// SIMULAR AS CHAMADAS QUE VÃO ACONTECER
console.log("\n🎯 SIMULANDO CHAMADAS calculateAreaScore:");

console.log("\nPara DIA1 com LC1:");
areasDia1LC1.forEach((area) => {
  console.log(`calculateAreaScore("${area.code}", "${area.language}")`);

  // Simular a lógica de mapeamento dentro do calculateAreaScore
  let targetArea = area.code;
  let questionFilterArea = area.code;
  let modelLanguage = area.language;

  if (area.code === "LC0") {
    targetArea = "LC";
    questionFilterArea = "LC0";
    modelLanguage = "0";
  } else if (area.code === "LC1") {
    targetArea = "LC";
    questionFilterArea = "LC1";
    modelLanguage = "1";
  }

  console.log(`  ⚙️ targetArea: ${targetArea}`);
  console.log(`  🔍 questionFilterArea: ${questionFilterArea}`);
  console.log(`  🌐 modelLanguage: ${modelLanguage}`);
  console.log(
    `  📁 Modelo esperado: modelo_de_nota_2024_${targetArea}_B${
      modelLanguage ? "_" + modelLanguage : ""
    }.js`
  );
  console.log("");
});

console.log("❗ PROBLEMA IDENTIFICADO:");
console.log(
  "Verificar se as questões estão sendo atribuídas corretamente às áreas LC1 e CH"
);
console.log("E se os modelos corretos estão sendo carregados para cada área.");
