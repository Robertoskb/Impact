# 🎯 Entrada Rápida de Gabarito - Guia de Uso

## 📝 Como Usar

A entrada rápida de gabarito permite inserir respostas de forma eficiente no simulado ENEM.

### ✅ Caracteres Aceitos

| Caractere         | Função                             | Exemplo                      |
| ----------------- | ---------------------------------- | ---------------------------- |
| **A, B, C, D, E** | Marca a alternativa correspondente | `A` marca alternativa A      |
| **X**             | Deixa a questão em branco          | `X` = questão não respondida |
| **.**             | Deixa a questão em branco          | `.` = questão não respondida |
| **\***            | Deixa a questão em branco          | `*` = questão não respondida |

### 🔄 Funcionalidades

#### 1. **Entrada Direta**

```
Digite: ABCDE
Resultado: Marca questões 1-5 como A, B, C, D, E
```

#### 2. **Questões em Branco**

```
Digite: AB.DE
Resultado:
- Questão 1: A
- Questão 2: B
- Questão 3: (em branco)
- Questão 4: D
- Questão 5: E
```

#### 3. **Caracteres Especiais**

```
Digite: A*C.EX
Resultado:
- Questão 1: A
- Questão 2: (em branco)
- Questão 3: C
- Questão 4: (em branco)
- Questão 5: E
- Questão 6: (em branco)
```

#### 4. **Filtragem Automática**

```
Digite: A1B2C3
Resultado: ABC (números são removidos automaticamente)
```

### 🔄 Sincronização Bidirecional

- **Digitar no campo** → Marca as questões automaticamente
- **Marcar questões manualmente** → Atualiza o campo de gabarito
- **Colar texto** → Filtra e aplica automaticamente

### 💡 Dicas de Uso

1. **Não precisa digitar todas as 45 respostas** - pode parar a qualquer momento
2. **Use caracteres especiais** para questões que não quer responder
3. **Copie e cole** gabaritos de outras fontes - a filtragem é automática
4. **Botão limpar** remove todas as respostas de uma vez

### 📱 Responsividade

- **Desktop**: Campo horizontal ao lado dos botões
- **Mobile**: Campo empilhado acima dos botões para melhor usabilidade

---

**💻 Exemplo Prático:**

```
Gabarito: ABCDE.X*AB.CDEAB*X.ABCDE
Questões 1-5: A B C D E
Questão 6: (em branco)
Questão 7: (em branco)
Questão 8: (em branco)
Questões 9-10: A B
Questão 11: (em branco)
Questões 12-16: C D E A B
Questão 17: (em branco)
Questão 18: (em branco)
Questão 19: (em branco)
Questões 20-24: A B C D E
```
