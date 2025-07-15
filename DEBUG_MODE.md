# Debug Mode - Simulado ENEM

## Como Ativar o Modo Debug

O modo debug permite gerar respostas aleatórias automaticamente para testar o simulado rapidamente.

### Opção 1: URL Parameter

Adicione `?debug=true` na URL:

```
http://localhost/simulado.html?debug=true
```

### Opção 2: Console do Navegador

Abra o console (F12) e execute:

```javascript
localStorage.setItem("debugMode", "true");
// Depois recarregue a página
location.reload();
```

### Opção 3: Ativar temporariamente

No console do navegador:

```javascript
// Ativar debug apenas nesta sessão
simuladoApp.uiController.debugMode = true;
simuladoApp.uiController.createDebugPanel();
```

## Funcionalidades do Debug Panel

Uma vez ativado, você verá um painel flutuante no canto superior direito com:

### 🔧 Painel Movível

- O painel pode ser arrastado pela barra do título para qualquer posição na tela
- Clique e arraste a área do título "🔧 Debug Panel" para mover
- O painel pode ser minimizado/expandido clicando no botão "−" / "+"

### 🎲 Gerar Respostas Aleatórias

- Preenche automaticamente todas as questões com respostas aleatórias (A, B, C, D ou E)
- Útil para testar rapidamente o cálculo de notas TRI

### 🗑️ Limpar Respostas

- Remove todas as respostas marcadas
- Limpa tanto visualmente quanto nos dados internos

### ✅ Preencher Corretas (Teste)

- Tenta preencher com as respostas corretas baseadas no meta.json
- Só funciona se o gabarito estiver disponível para o ano/área selecionados
- Útil para testar cenários de pontuação máxima

### Informações em Tempo Real

- Total de questões carregadas
- Número de questões respondidas
- Atualiza automaticamente conforme você interage

## Desativar Debug Mode

Para desativar:

```javascript
localStorage.removeItem("debugMode");
location.reload();
```

## Notas Importantes

- O modo debug só deve ser usado para desenvolvimento e testes
- As respostas geradas são completamente aleatórias
- O painel é móvel e pode ser minimizado clicando no "−"
- Todas as ações de debug são registradas no console do navegador
