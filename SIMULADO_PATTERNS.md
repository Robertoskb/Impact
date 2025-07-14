# Sistema de Padrões de Acerto do Simulado ENEM

## Visão Geral

O sistema de simulado agora implementa um sistema robusto de padrões de acerto internos que permite análises futuras sem expor essas informações diretamente ao usuário durante o simulado.

## Validação de Respostas

### 1. Usando meta.json

- O sistema primeiro verifica se há dados no `meta.json` para a questão
- Procura por campos `answer`, `correct_answer` ou `gabarito` no meta.json
- Se encontrado, usa essa informação como gabarito oficial

### 2. Fallback Simulado

- Se não há gabarito real disponível, usa um sistema simulado baseado na posição original da questão
- Fórmula: `answers[posicaoOriginal % 5]` onde answers = ['A', 'B', 'C', 'D', 'E']

## Tratamento de Questões Anuladas

### Detecção de Anulação

Uma questão é considerada anulada se:

1. **Não tem mapeamento no positions.json** para a cor da prova selecionada, OU
2. **Não tem dados no meta.json** (quando meta.json está disponível para aquele ano/área)

### Comportamento das Anuladas

- **Para o usuário**: Questões anuladas contam como acerto se o usuário responder qualquer alternativa
- **Internamente**: Questões anuladas sempre geram valor "0" nos padrões de acerto
- **Interface**: Questões anuladas são claramente marcadas como "ANULADA"

## Padrões de Acerto Gerados

O sistema gera 4 padrões diferentes de strings de acerto (0/1):

### 1. `examOrderPattern`

- Ordem das questões como aparecem na prova
- Exemplo: "110010..." (questão 1: acerto, questão 2: acerto, questão 3: erro, etc.)

### 2. `originalOrderPattern`

- Ordem das questões conforme numeração original do ENEM
- Mantém posições das questões anuladas onde elas aparecem originalmente
- Exemplo: "011010..." (questão original 1: erro, questão original 2: acerto, etc.)

### 3. `difficultyOrderPattern`

- Questões ordenadas por dificuldade (do meta.json)
- Questões anuladas aparecem sempre no **final** como "0"
- Questões sem dados de dificuldade são ordenadas por posição original
- Exemplo: "111000..." (questões fáceis primeiro, anuladas no final)

### 4. `discriminationOrderPattern`

- Questões ordenadas por discriminação (do meta.json)
- Questões anuladas aparecem sempre no **final** como "0"
- Questões sem dados de discriminação são ordenadas por posição original
- Exemplo: "101100..." (questões com maior discriminação primeiro, anuladas no final)

### 5. `areaPatterns`

- Padrões separados por área (LC0, LC1, CH, CN, MT)
- Cada área tem seu próprio padrão na ordem original
- Exemplo: `{ "LC0": "11010", "CH": "10110", "CN": "11100", "MT": "01011" }`

## Mapeamento de Posições Anuladas

### `cancelledPositions`

Objeto que mapeia onde estão as questões anuladas em cada ordenação:

```javascript
{
  examOrder: [2, 5, 8],           // Posições das anuladas na ordem da prova
  originalOrder: [1, 4, 7],       // Posições das anuladas na ordem original
  difficultyOrder: [43, 44, 45],  // Sempre no final para dificuldade
  discriminationOrder: [43, 44, 45] // Sempre no final para discriminação
}
```

## Cálculo de Performance

### Estatísticas para o Usuário

- **Total de questões**: Inclui todas as questões da prova
- **Acertos**: Inclui questões anuladas respondidas pelo usuário
- **Erros**: Apenas questões válidas respondidas incorretamente
- **Performance**: `(acertos - anuladas) / (total - anuladas) * 100`

### Exemplo

- 45 questões totais
- 3 questões anuladas (usuário respondeu 2 delas)
- 30 questões válidas corretas
- Performance = (30 / 42) \* 100 = 71.4%
- Acertos mostrados = 32 (30 + 2 anuladas)

## Logs de Debug

O sistema gera logs detalhados no console do navegador:

```
=== PADRÕES DE ACERTO (INTERNOS) ===
Ordem da prova: 11001011010...
Ordem original: 10110100110...
Ordem por dificuldade: 11100010000...
Ordem por discriminação: 11010100000...
Padrões por área: {LC0: "11001", CH: "10110", ...}
Posições das anuladas: {examOrder: [2,5], originalOrder: [1,4], ...}

=== ESTATÍSTICAS PARA O USUÁRIO ===
Total de questões: 45
Acertos (incluindo anuladas): 32
Erros: 10
Anuladas: 3
Performance: 76%
```

## Uso Futuro

Estes padrões podem ser usados para:

- **Análise de performance por dificuldade**
- **Identificação de padrões de erro**
- **Comparação com outros simulados**
- **Geração de relatórios detalhados**
- **Sistemas de recomendação de estudo**
- **Analytics avançados**

Os padrões não são expostos na interface do usuário durante o simulado, mantendo a experiência focada na resolução das questões.
