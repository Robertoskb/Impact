# Pasta de Testes - Simulado ENEM

Esta pasta contém todos os arquivos de teste e demonstração do sistema de simulado ENEM.

## 📁 Estrutura dos Testes

### 🧪 Testes JavaScript (.js)

#### Testes de Funcionalidade Principal

- **`test-logic.js`** - Teste geral da lógica do simulado
- **`test-node.js`** - Teste de compatibilidade Node.js

#### Testes de Mapeamento e Posições

- **`test-areas-mapping.js`** - Teste do mapeamento de áreas para diferentes tipos de exame
- **`test-habilidades-mapping.js`** - Teste do mapeamento de posições para habilidades
- **`test-complete-mapping-fix.js`** - Teste completo das correções de mapeamento

#### Testes de Questões Anuladas

- **`test-cancelled-questions-fix.js`** - Teste da correção do tratamento de questões anuladas
- **`test-all-cancelled-fixes.js`** - Teste final de todas as correções de questões anuladas

#### Testes de Cálculo de Porcentagem

- **`test-percentage-calculation.js`** - Teste comparativo de métodos de cálculo de porcentagem
- **`test-real-percentage-scenario.js`** - Teste com cenário real do sistema
- **`test-percentage-correction.js`** - Teste da correção aplicada no cálculo
- **`test-complete-percentage-fix.js`** - Teste completo da correção de porcentagem

#### Testes de Modelos TRI

- **`test-model-cache-problem.js`** - Teste de problemas de cache de modelos
- **`test-model-loading-fix.js`** - Teste de correção de carregamento de modelos
- **`test-model-loading-issues.js`** - Teste de problemas de carregamento de modelos
- **`test-tri-independence.js`** - Teste de independência dos cálculos TRI

#### Testes de Debug

- **`test-debug-problem.js`** - Teste de problemas no sistema de debug

### 🌐 Páginas de Teste HTML (.html)

#### Demonstrações Principais

- **`test-debug-mode.html`** - Página de demonstração do modo debug
- **`test-results.html`** - Página de teste da tela de resultados
- **`test-modal.html`** - Página de teste dos modais

#### Testes de Carregamento

- **`test-model-loading.html`** - Página de teste de carregamento de modelos TRI
- **`test-direct-loading.html`** - Página de teste de carregamento direto
- **`test-final-tri.html`** - Página de teste final dos cálculos TRI

## 🚀 Como Executar os Testes

### Testes JavaScript

```bash
# Navegar para a pasta de testes
cd tests

# Executar um teste específico
node test-logic.js
node test-habilidades-mapping.js
node test-cancelled-questions-fix.js
```

### Páginas HTML

Abra os arquivos HTML diretamente no navegador ou através do Simple Browser do VS Code.

## 📋 Histórico de Testes

### Problemas Identificados e Corrigidos

1. **Mapeamento de Posições** - Questões de cores diferentes da azul tinham habilidades e gabaritos incorretos
2. **Questões Anuladas** - Estavam sendo contabilizadas incorretamente como acertos nas estatísticas
3. **Carregamento de Modelos** - Problemas de cache e carregamento assíncrono
4. **Sistema de Debug** - Painel de debug para facilitar testes

### Melhorias Implementadas

- ✅ Mapeamento correto de posições entre cores de prova
- ✅ Tratamento adequado de questões anuladas
- ✅ Sistema robusto de carregamento de modelos TRI
- ✅ Painel de debug interativo e draggable
- ✅ Simplificação da interface (uma área por vez)

## 🎯 Objetivo dos Testes

Estes testes garantem que o sistema funcione corretamente em todos os cenários:

- ✅ Qualquer cor de prova (azul, amarela, branca, rosa, verde, cinza)
- ✅ Qualquer área de conhecimento (LC, CH, CN, MT)
- ✅ Qualquer ano disponível
- ✅ Questões anuladas tratadas corretamente
- ✅ Cálculos TRI precisos
- ✅ Interface responsiva e intuitiva
