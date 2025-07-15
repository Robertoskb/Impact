// Teste específico para verificar cálculo independente de notas TRI
console.log(
  "🎯 Testando cálculo independente de notas TRI para DIA1 e DIA2...\n"
);

// Simular a estrutura de modelos disponíveis
const modelosDisponiveis = {
  "2023_LC_B_0": { predict: (pattern) => 650 + Math.random() * 100 }, // Inglês
  "2023_CH_B": { predict: (pattern) => 580 + Math.random() * 120 }, // Ciências Humanas
  "2023_CN_B": { predict: (pattern) => 520 + Math.random() * 80 }, // Ciências da Natureza
  "2023_MT_B": { predict: (pattern) => 700 + Math.random() * 150 }, // Matemática
};

// Simular respostas diferentes para cada área
const respostasSimuladas = {
  // DIA1 - Respostas para LC (inglês) e CH
  dia1: {
    // LC0 (posições 1-45) - 30 acertos de 45
    LC0: Array(30).fill(1).concat(Array(15).fill(0)),
    // CH (posições 46-90) - 25 acertos de 45
    CH: Array(25).fill(1).concat(Array(20).fill(0)),
  },
  // DIA2 - Respostas para CN e MT
  dia2: {
    // CN (posições 91-135) - 20 acertos de 45
    CN: Array(20).fill(1).concat(Array(25).fill(0)),
    // MT (posições 136-180) - 35 acertos de 45
    MT: Array(35).fill(1).concat(Array(10).fill(0)),
  },
};

// Função para simular carregamento de modelo
function loadModel(year, area, language = null) {
  const modelKey = `${year}_${area}_B${language ? "_" + language : ""}`;
  console.log(`📥 Carregando modelo: ${modelKey}`);

  if (modelosDisponiveis[modelKey]) {
    console.log(`✅ Modelo ${modelKey} carregado com sucesso`);
    return {
      name: modelKey,
      predict: modelosDisponiveis[modelKey].predict,
    };
  } else {
    console.log(`❌ Modelo ${modelKey} não encontrado`);
    return null;
  }
}

// Função para simular cálculo de nota de uma área
function calculateAreaScore(area, language, pattern) {
  console.log(
    `\n🔍 Calculando nota para área: ${area}${
      language ? ` (idioma: ${language})` : ""
    }`
  );
  console.log(
    `📊 Padrão de respostas: ${pattern.join("")} (${
      pattern.filter((x) => x === 1).length
    }/45 acertos)`
  );

  // Determinar área do modelo
  let targetArea = area;
  if (area === "LC0") {
    targetArea = "LC";
    language = "0";
  }

  // Carregar modelo específico
  const model = loadModel(2023, targetArea, language);

  if (!model) {
    return { success: false, error: `Modelo não encontrado para ${area}` };
  }

  // Calcular nota usando o modelo
  const score = model.predict(pattern);
  const roundedScore = Math.round(score * 10) / 10;

  console.log(`🎯 Nota calculada para ${area}: ${roundedScore} pontos`);

  return {
    success: true,
    area: area,
    score: roundedScore,
    pattern: pattern.join(""),
    modelUsed: model.name,
  };
}

// Função para simular cálculo completo de um dia
function calculateDayScores(day) {
  console.log(`\n🟦 ===== CALCULANDO NOTAS PARA ${day.toUpperCase()} =====`);

  const results = {
    day: day,
    scores: {},
    totalCalculated: 0,
    errors: [],
    modelsUsed: [],
  };

  let areas = [];
  if (day === "dia1") {
    areas = [
      { code: "LC0", language: "0" },
      { code: "CH", language: null },
    ];
  } else if (day === "dia2") {
    areas = [
      { code: "CN", language: null },
      { code: "MT", language: null },
    ];
  }

  // Calcular cada área independentemente
  for (const areaConfig of areas) {
    const pattern = respostasSimuladas[day][areaConfig.code];
    const result = calculateAreaScore(
      areaConfig.code,
      areaConfig.language,
      pattern
    );

    if (result.success) {
      results.scores[areaConfig.code] = {
        score: result.score,
        pattern: result.pattern,
        acertos: pattern.filter((x) => x === 1).length,
        total: pattern.length,
      };
      results.modelsUsed.push(result.modelUsed);
      results.totalCalculated++;
    } else {
      results.errors.push(`${areaConfig.code}: ${result.error}`);
    }
  }

  return results;
}

// EXECUTAR TESTES

console.log("📋 Modelos disponíveis:", Object.keys(modelosDisponiveis));

// TESTE 1: DIA1
const resultadosDia1 = calculateDayScores("dia1");
console.log("\n📊 RESULTADOS DIA1:");
console.log(`Áreas calculadas: ${resultadosDia1.totalCalculated}`);
console.log(`Modelos usados: [${resultadosDia1.modelsUsed.join(", ")}]`);
console.log("Notas calculadas:");
Object.entries(resultadosDia1.scores).forEach(([area, data]) => {
  console.log(
    `  ${area}: ${data.score} pontos (${data.acertos}/${data.total} acertos)`
  );
});

// TESTE 2: DIA2
const resultadosDia2 = calculateDayScores("dia2");
console.log("\n📊 RESULTADOS DIA2:");
console.log(`Áreas calculadas: ${resultadosDia2.totalCalculated}`);
console.log(`Modelos usados: [${resultadosDia2.modelsUsed.join(", ")}]`);
console.log("Notas calculadas:");
Object.entries(resultadosDia2.scores).forEach(([area, data]) => {
  console.log(
    `  ${area}: ${data.score} pontos (${data.acertos}/${data.total} acertos)`
  );
});

// VERIFICAR INDEPENDÊNCIA
console.log("\n🔍 VERIFICAÇÃO DE INDEPENDÊNCIA:");
console.log(
  "✅ Cada dia usa modelos diferentes?",
  !resultadosDia1.modelsUsed.some((m) => resultadosDia2.modelsUsed.includes(m))
);

console.log("✅ Cada área tem nota diferente?");
const todasNotas = [
  ...Object.values(resultadosDia1.scores).map((s) => s.score),
  ...Object.values(resultadosDia2.scores).map((s) => s.score),
];
console.log("Notas:", todasNotas);
console.log(
  "Todas diferentes?",
  new Set(todasNotas).size === todasNotas.length
);

console.log("\n🎯 CONCLUSÃO:");
console.log(
  `- DIA1: ${resultadosDia1.totalCalculated} áreas calculadas independentemente`
);
console.log(
  `- DIA2: ${resultadosDia2.totalCalculated} áreas calculadas independentemente`
);
console.log(
  `- Total de modelos únicos usados: ${
    new Set([...resultadosDia1.modelsUsed, ...resultadosDia2.modelsUsed]).size
  }`
);

console.log("\n✅ Teste de independência concluído!");
