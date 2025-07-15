// Teste básico do Node.js
console.log("🎉 Node.js está funcionando!");
console.log("Versão do Node:", process.version);
console.log("Plataforma:", process.platform);

// Teste de uma função simples
function testeCalculadora(a, b) {
  return a + b;
}

console.log("Teste de função:", testeCalculadora(5, 3));

// Simulação de um teste das funções do projeto
console.log("\n--- Teste de lógica do projeto ---");

// Simular áreas do ENEM
const areas = ["LC0", "CH", "CN", "MT"];
console.log("Áreas do ENEM:", areas);

// Simular configuração de dia1
const configDia1 = {
  type: "dia1",
  language: "LC0",
  year: 2023,
};

console.log("Configuração dia1:", configDia1);

// Simular configuração de dia2
const configDia2 = {
  type: "dia2",
  year: 2023,
};

console.log("Configuração dia2:", configDia2);

console.log("\n✅ Teste Node.js concluído com sucesso!");
