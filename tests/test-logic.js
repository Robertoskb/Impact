// Teste das funções JavaScript do projeto ENEM
console.log("🎯 Testando lógica do ScoreCalculator...\n");

// Simular a lógica de determinação de áreas
function getAreasForExamType(examType, language) {
  console.log(`🔍 getAreasForExamType: tipo=${examType}, idioma=${language}`);

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

  return areaMap[examType] || [];
}

// Simular a lógica de determinação de área por posição
function determineQuestionArea(pos, areas, config) {
  console.log(
    `🔍 determineQuestionArea: pos=${pos}, areas=[${areas.join(", ")}], tipo=${
      config?.type
    }`
  );

  if (pos >= 1 && pos <= 45) {
    let area = null;
    if (config && config.language) {
      if (areas.includes(config.language)) {
        area = config.language;
        console.log(
          `✅ Posição ${pos} (1-45, idioma configurado) -> área: ${area}`
        );
        return area;
      }
    }
    if (areas.includes("LC0")) {
      area = "LC0";
    } else if (areas.includes("LC1")) {
      area = "LC1";
    }
    console.log(`✅ Posição ${pos} (1-45, fallback) -> área: ${area}`);
    return area;
  } else if (pos >= 46 && pos <= 90) {
    if (areas.includes("CH")) {
      console.log(`✅ Posição ${pos} (46-90) -> área: CH`);
      return "CH";
    }
  } else if (pos >= 91 && pos <= 135) {
    if (areas.includes("CN")) {
      console.log(`✅ Posição ${pos} (91-135) -> área: CN`);
      return "CN";
    }
  } else if (pos >= 136 && pos <= 180) {
    if (areas.includes("MT")) {
      console.log(`✅ Posição ${pos} (136-180) -> área: MT`);
      return "MT";
    }
  }
  console.log(`❌ Posição ${pos} não mapeada`);
  return null;
}

// TESTE 1: Simulado DIA1 com inglês
console.log("\n🔴 TESTE 1: Simulado DIA1 (Inglês)");
const configDia1 = { type: "dia1", language: "LC0" };
const areasDia1 = getAreasForExamType("dia1", "LC0");
console.log("Áreas calculadas:", areasDia1);

// Testar algumas posições
const positionsDia1 = [1, 10, 45, 46, 70, 90];
positionsDia1.forEach((pos) => {
  const area = determineQuestionArea(pos, ["LC0", "CH"], configDia1);
  console.log(`Posição ${pos} -> ${area}`);
});

// TESTE 2: Simulado DIA2
console.log("\n🔵 TESTE 2: Simulado DIA2");
const configDia2 = { type: "dia2" };
const areasDia2 = getAreasForExamType("dia2", null);
console.log("Áreas calculadas:", areasDia2);

// Testar algumas posições
const positionsDia2 = [91, 100, 135, 136, 150, 180];
positionsDia2.forEach((pos) => {
  const area = determineQuestionArea(pos, ["CN", "MT"], configDia2);
  console.log(`Posição ${pos} -> ${area}`);
});

console.log("\n✅ Testes concluídos!");
