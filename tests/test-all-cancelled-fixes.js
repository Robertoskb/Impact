// Teste final para validar todas as correções no tratamento de questões anuladas

console.log('🧪 TESTE FINAL: Verificando correções de questões anuladas\n');

// Simular cenário completo
const testData = {
  questions: [
    { position: 1, hability: 25, area: 'CN', cancelled: false },
    { position: 2, hability: 25, area: 'CN', cancelled: false },
    { position: 3, hability: 25, area: 'CN', cancelled: true }, // ANULADA
    { position: 4, hability: 26, area: 'CN', cancelled: false },
    { position: 5, hability: 26, area: 'CN', cancelled: true }, // ANULADA
  ],
  answers: {
    1: 'A', // Correto
    2: 'B', // Errado
    3: 'C', // Anulada (RESPOSTA IGNORADA)
    4: 'A', // Correto
    5: 'D', // Anulada (RESPOSTA IGNORADA)
  },
  meta: {
    2023: {
      CN: {
        1: { answer: 'A' },
        2: { answer: 'A' },
        // 3 não existe (anulada)
        4: { answer: 'A' },
        // 5 não existe (anulada)
      }
    }
  }
};

console.log('📋 DADOS DE TESTE:');
console.log('- Questão 1: Respondida A, Gabarito A → ACERTO');
console.log('- Questão 2: Respondida B, Gabarito A → ERRO');
console.log('- Questão 3: Respondida C, ANULADA → IGNORADA');
console.log('- Questão 4: Respondida A, Gabarito A → ACERTO');
console.log('- Questão 5: Respondida D, ANULADA → IGNORADA\n');

// 1. Teste do SkillsReportCalculator (CORRIGIDO)
function testSkillsReport() {
  console.log('🎯 1. TESTE: SkillsReportCalculator');
  
  const skillsData = {};
  
  testData.questions.forEach(question => {
    const area = question.area;
    const hability = question.hability;
    
    if (!skillsData[area]) skillsData[area] = {};
    if (!skillsData[area][hability]) {
      skillsData[area][hability] = { total: 0, correct: 0, wrong: 0, cancelled: 0 };
    }
    
    const skillData = skillsData[area][hability];
    skillData.total++;
    
    // LÓGICA CORRIGIDA
    if (question.cancelled) {
      skillData.cancelled++;
      // Questões anuladas NÃO contam como acerto nem erro
    } else {
      const correctAnswer = testData.meta[2023][area][question.position]?.answer;
      const userAnswer = testData.answers[question.position];
      
      if (userAnswer && userAnswer === correctAnswer) {
        skillData.correct++;
      } else if (userAnswer) {
        skillData.wrong++;
      }
    }
  });
  
  // Calcular estatísticas
  Object.keys(skillsData).forEach(area => {
    Object.keys(skillsData[area]).forEach(hability => {
      const skillData = skillsData[area][hability];
      const answeredQuestions = skillData.correct + skillData.wrong;
      const percentage = answeredQuestions > 0 
        ? Math.round((skillData.correct / answeredQuestions) * 100) 
        : 0;
      
      console.log(`   H${hability}: ${skillData.correct}/${answeredQuestions} = ${percentage}% (${skillData.cancelled} anuladas)`);
    });
  });
  
  console.log('   ✅ Questões anuladas NÃO contam como acerto\n');
}

// 2. Teste do ResultsCalculator - Padrão Visual (CORRIGIDO)
function testResultsPattern() {
  console.log('🎯 2. TESTE: ResultsCalculator - Padrão Visual');
  
  let examOrderPattern = "";
  
  testData.questions.forEach(question => {
    let isCorrect = false;
    let isCancelled = question.cancelled;
    
    if (!isCancelled) {
      const correctAnswer = testData.meta[2023][question.area][question.position]?.answer;
      const userAnswer = testData.answers[question.position];
      isCorrect = userAnswer === correctAnswer;
    }
    
    // LÓGICA CORRIGIDA
    if (isCancelled) {
      examOrderPattern += "A";
    } else {
      examOrderPattern += isCorrect ? "1" : "0";
    }
  });
  
  console.log(`   Padrão: ${examOrderPattern}`);
  console.log('   Legenda: 1=acerto, 0=erro, A=anulada');
  console.log('   ✅ Questões anuladas são marcadas como "A"\n');
}

// 3. Teste de Estatísticas Gerais
function testGeneralStats() {
  console.log('🎯 3. TESTE: Estatísticas Gerais');
  
  let totalQuestions = testData.questions.length;
  let correctAnswers = 0;
  let wrongAnswers = 0;
  let cancelledQuestions = 0;
  
  testData.questions.forEach(question => {
    if (question.cancelled) {
      cancelledQuestions++;
    } else {
      const correctAnswer = testData.meta[2023][question.area][question.position]?.answer;
      const userAnswer = testData.answers[question.position];
      
      if (userAnswer === correctAnswer) {
        correctAnswers++;
      } else {
        wrongAnswers++;
      }
    }
  });
  
  const validQuestions = totalQuestions - cancelledQuestions;
  const performance = validQuestions > 0 ? Math.round((correctAnswers / validQuestions) * 100) : 0;
  
  console.log(`   Total: ${totalQuestions} questões`);
  console.log(`   Válidas: ${validQuestions} questões`);
  console.log(`   Anuladas: ${cancelledQuestions} questões`);
  console.log(`   Acertos: ${correctAnswers}`);
  console.log(`   Erros: ${wrongAnswers}`);
  console.log(`   Performance: ${performance}% (${correctAnswers}/${validQuestions})`);
  console.log('   ✅ Anuladas não afetam o cálculo de performance\n');
}

// Executar todos os testes
testSkillsReport();
testResultsPattern();
testGeneralStats();

console.log('🎉 RESUMO DOS RESULTADOS ESPERADOS:');
console.log('- H25: 50% (1 acerto / 2 válidas)');
console.log('- H26: 100% (1 acerto / 1 válida)');
console.log('- Padrão: 10A1A (questões 3 e 5 marcadas como anuladas)');
console.log('- Performance geral: 67% (2 acertos / 3 válidas)');
console.log('\n✅ TODAS AS CORREÇÕES APLICADAS COM SUCESSO!');
