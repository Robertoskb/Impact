// Investigação: Por que apenas UM modelo está sendo usado?
console.log("🚨 INVESTIGANDO: Um modelo para duas áreas diferentes\n");

// Simular o problema real - cache de modelos
const modelCache = new Map();

function simulateLoadModel(year, area, language = null) {
  const modelKey = `${year}_${area}${language ? "_" + language : ""}`;
  console.log(`🔍 Tentando carregar modelo: ${modelKey}`);

  // PROBLEMA POTENCIAL: Cache pode estar retornando o mesmo modelo
  if (modelCache.has(modelKey)) {
    console.log(`📦 Modelo ${modelKey} encontrado no CACHE`);
    return modelCache.get(modelKey);
  }

  // Simular carregamento de modelo único
  const fakeModel = {
    name: modelKey,
    predict: () => 279.8, // Sempre retorna a mesma nota!
    loadedAt: new Date().toISOString(),
  };

  modelCache.set(modelKey, fakeModel);
  console.log(`✅ Modelo ${modelKey} carregado e armazenado no cache`);
  return fakeModel;
}

// TESTE 1: DIA1 - LC1 e CH
console.log("🔴 TESTE DIA1:");
const modelLC1 = simulateLoadModel(2023, "LC", "1");
const modelCH = simulateLoadModel(2023, "CH", null);

console.log("Modelo LC1:", modelLC1.name);
console.log("Modelo CH:", modelCH.name);
console.log("São o mesmo objeto?", modelLC1 === modelCH);

// TESTE 2: DIA2 - CN e MT
console.log("\n🔵 TESTE DIA2:");
const modelCN = simulateLoadModel(2024, "CN", null);
const modelMT = simulateLoadModel(2024, "MT", null);

console.log("Modelo CN:", modelCN.name);
console.log("Modelo MT:", modelMT.name);
console.log("São o mesmo objeto?", modelCN === modelMT);

// VERIFICAR CACHE
console.log("\n📦 CACHE ATUAL:");
modelCache.forEach((model, key) => {
  console.log(`${key}: ${model.name}`);
});

// PROBLEMA: Mesmo padrão sendo usado
console.log("\n🎯 POSSÍVEIS PROBLEMAS:");
console.log("1. ❓ Cache de modelos está compartilhando o mesmo modelo?");
console.log("2. ❓ window.model está sendo sobrescrito no carregamento?");
console.log("3. ❓ Mesmo padrão de respostas sendo usado para ambas as áreas?");
console.log("4. ❓ Filtragem de questões não está funcionando?");

// Simular padrões diferentes
console.log("\n📊 TESTE DE PADRÕES:");

const questoesDia1 = [
  { position: 1, area: "LC1" },
  { position: 2, area: "LC1" },
  { position: 45, area: "LC1" },
  { position: 46, area: "CH" },
  { position: 47, area: "CH" },
  { position: 90, area: "CH" },
];

const respostas = { 1: "A", 2: "B", 46: "C", 47: "D" };

// Filtrar LC1
const questoesLC1 = questoesDia1.filter((q) => q.area === "LC1");
const padraoLC1 = questoesLC1.map((q) => (respostas[q.position] ? 1 : 0));

// Filtrar CH
const questoesCH = questoesDia1.filter((q) => q.area === "CH");
const padraoCH = questoesCH.map((q) => (respostas[q.position] ? 1 : 0));

console.log(`Padrão LC1: ${padraoLC1.join("")} (${padraoLC1.length} questões)`);
console.log(`Padrão CH: ${padraoCH.join("")} (${padraoCH.length} questões)`);
console.log(
  `Padrões são iguais? ${
    JSON.stringify(padraoLC1) === JSON.stringify(padraoCH)
  }`
);

console.log("\n🔧 HIPÓTESES:");
console.log("A. loadModelViaScript está sobrescrevendo window.model");
console.log("B. Cache está retornando a mesma instância");
console.log("C. Filtragem de questões está falhando");
console.log("D. Mesmo padrão está sendo gerado para ambas as áreas");
