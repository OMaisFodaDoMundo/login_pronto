const form = document.getElementById('loginForm');
const nickInput = document.getElementById('nick');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const feedback = document.getElementById('feedback');
const panel = document.querySelector('.panel');
const footerNote = document.getElementById('footerNote');
const progressLayer = document.getElementById('progressLayer');
const progressFill = document.getElementById('progressFill');
const progressLabel = document.getElementById('progressLabel');
const finalLayer = document.getElementById('finalLayer');
const finalCode = document.getElementById('finalCode');
const finalTitle = document.getElementById('finalTitle');
const finalMessage = document.getElementById('finalMessage');
const retryBtn = document.getElementById('retryBtn');

const allowedSpecialChars = ['!', '@', '#', '$', '%', '&', '*', '?', '+', '-', '_'];
const stageMessages = [
  'Senha incorreta.',
  'Senha incorreta. Adicione 1 caractere especial.',
  'Senha incorreta. Coloque minha data de nascimento.',
  'Senha incorreta. Adicione meu nome.',
  'Senha incorreta. Digite o número total de caracteres da senha.',
  'Senha incorreta. Sua senha precisa conter uma letra repetida exatamente 3 vezes.',
  'Senha incorreta. Continue para a próxima regra.',
  'Senha incorreta. Sua senha precisa conter a palavra: SENHA em letras maiúsculas.',
  'Senha incorreta. Agora remova a palavra SENHA.',
  'Senha incorreta. O primeiro caractere deve ser igual ao último.',
  'Senha incorreta. Sua senha ficou longa demais. Agora ela deve possuir no máximo 25 caracteres.',
  'Senha incorreta. A senha precisa conter uma letra que não aparece em nenhuma outra parte da senha.',
  'Senha incorreta. Sua senha precisa conter exatamente 2 letras maiúsculas.',
  'Senha incorreta. Sua senha precisa conter ao menos 4 números pares.',
  'Validando senha...'
];

const humiliationPhrases = [
  '{nick} foi otário e tentou vezes demais.',
  '{nick}, aproveite esta tela para descansar os dois únicos neurônios que você tem.',
  '{nick}, você chegou até aqui apenas para descobrir que não existia prêmio algum.',
  '{nick}, seu nível de persistência é impressionante. Seu senso crítico nem tanto.',
  '{nick}, parabéns por resolver um problema que nunca precisou ser resolvido.',
  '{nick}, você gastou vários minutos perseguindo uma senha que levava para lugar nenhum.',
  '{nick}, a verdadeira senha era aceitar que estava perdendo tempo.',
  '{nick}, o sistema não foi hackeado. Você apenas caiu na armadilha.',
  '{nick}, poucas pessoas chegam tão longe. Ainda menos percebem a pegadinha.',
  '{nick}, este site foi criado especificamente para desperdiçar seu tempo. Funcionou.'
];

let stage = 1;
let progressTimer = null;
let finalStarted = false;

function shakePanel() {
  panel.classList.remove('shake');
  void panel.offsetWidth;
  panel.classList.add('shake');
}

function setFeedback(text) {
  feedback.textContent = text;
}

function getNick() {
  const raw = nickInput.value.trim();
  return raw || 'Usuário';
}

function getPassword() {
  return passwordInput.value;
}

function sumDigits(value) {
  return (value.match(/\d/g) || []).reduce((sum, char) => sum + Number(char), 0);
}

function hasRepeatedLetterExactlyThreeTimes(value) {
  const letters = value.toLowerCase().match(/[a-z]/g) || [];
  const counts = {};
  letters.forEach((letter) => {
    counts[letter] = (counts[letter] || 0) + 1;
  });
  return Object.values(counts).includes(3);
}

function hasUniqueLetter(value) {
  const letters = (value.toLowerCase().match(/[a-z]/g) || []);
  const counts = {};
  letters.forEach((letter) => {
    counts[letter] = (counts[letter] || 0) + 1;
  });
  return Object.keys(counts).some((letter) => counts[letter] === 1);
}

function hasExactlyTwoUppercaseLetters(value) {
  return (value.match(/[A-Z]/g) || []).length === 2;
}

function hasAtLeastFourEvenDigits(value) {
  return (value.match(/\d/g) || []).filter((digit) => Number(digit) % 2 === 0).length >= 4;
}

function hasSpecialChar(value) {
  return Array.from(value).some((char) => allowedSpecialChars.includes(char));
}

function ruleOne(password) { return password === '123456'; }
function ruleTwo(password) { return /^123456[!@#$%&*?+\-_]$/.test(password); }
function ruleThree(password) { return password.includes('3008'); }
function ruleFour(password) { return password.includes('Vitor'); }
function ruleFive(password) { return password.includes(String(password.length)); }
function ruleSix(password) { return hasRepeatedLetterExactlyThreeTimes(password); }
function ruleSeven(password) { return sumDigits(password) === 50; }
function ruleEight(password) { return password.includes('SENHA'); }
function ruleNine() { return true; }
function ruleTen(password) { return password.length > 0 && password[0] === password[password.length - 1]; }
function ruleEleven(password) { return password.length <= 25; }
function ruleTwelve(password) { return hasUniqueLetter(password); }
function ruleThirteen(password) { return hasExactlyTwoUppercaseLetters(password); }
function ruleFourteen(password) { return hasAtLeastFourEvenDigits(password); }

function satisfiesRules(password, targetStage) {
  const current = String(password || '');

  switch (targetStage) {
    case 1:
      return current === '123456';

    case 2:
      return current.includes('123456') && hasSpecialChar(current);

    case 3:
      return current.includes('3008');

    case 4:
      return current.includes('Vitor') && /[V]/.test(current);

    case 5:
      return current.includes(String(current.length));

    case 6:
      return hasRepeatedLetterExactlyThreeTimes(current);

    case 7:
      return true;

    case 8:
      return current.includes('SENHA');

    case 9:
      return !current.includes('SENHA');

    case 10:
      return current.length > 1 && current[0] === current[current.length - 1];

    case 11:
      return current.length <= 25;

    case 12:
      return hasUniqueLetter(current);

    case 13:
      return hasExactlyTwoUppercaseLetters(current);

    case 14:
      return hasAtLeastFourEvenDigits(current);

    default:
      return false;
  }
}

function showStageMessage(nextStage) {
  const msg = stageMessages[Math.min(nextStage - 1, stageMessages.length - 1)];
  setFeedback(msg);
}

function advanceStage() {
  if (stage === 14) {
    stage = 15;
    progressLayer.classList.remove('hidden');
    beginProgress();
    return;
  }

  if (stage === 2) {
    footerNote.textContent = '© criado por Vitor, 3008';
  }

  if (stage === 3) {
    footerNote.textContent = '© criado por Vitor, 2026';
  }

  stage += 1;
  showStageMessage(stage);
}

function beginProgress() {
  if (progressTimer) {
    clearInterval(progressTimer);
  }

  progressFill.style.width = '1%';
  progressLabel.textContent = '1%';
  setFeedback('Validando senha...');

  const steps = [1, 3, 7, 11, 18, 24, 31, 39, 46, 52, 61, 69, 74, 82, 88, 94, 99, 100];
  let i = 0;
  progressTimer = setInterval(() => {
    if (i >= steps.length) {
      clearInterval(progressTimer);
      progressTimer = null;
      triggerFalseError();
      return;
    }

    const value = steps[i];
    progressFill.style.width = `${value}%`;
    progressLabel.textContent = `${value}%`;
    i += 1;
  }, 900);
}

function triggerFalseError() {
  if (finalStarted) return;
  finalStarted = true;

  const loginPanel = document.querySelector('.panel');
  const footer = document.querySelector('footer');

  loginPanel.style.opacity = '0';
  loginPanel.style.transform = 'translateY(8px)';
  footer.style.opacity = '0';
  progressLayer.classList.add('hidden');
  document.body.style.background = '#000';

  setTimeout(() => {
    finalLayer.classList.remove('hidden');
    finalCode.textContent = '404';
    finalTitle.textContent = 'Página não encontrada';
    finalMessage.textContent = '';
    finalLayer.style.opacity = '0';
    finalLayer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1600, fill: 'forwards' });
  }, 5000);

  setTimeout(() => {
    finalMessage.textContent = 'A senha estava correta. Mas eu quis te fazer perder seu tempo. Obrigado pela dedicação.';
  }, 7000);

  setTimeout(() => {
    const nick = getNick();
    const phrase = humiliationPhrases[Math.floor(Math.random() * humiliationPhrases.length)].replace('{nick}', nick);
    finalMessage.textContent = phrase;
  }, 10000);
}

function resetExperience() {
  stage = 1;
  finalStarted = false;
  progressLayer.classList.add('hidden');
  finalLayer.classList.add('hidden');
  clearInterval(progressTimer);
  progressTimer = null;
  progressFill.style.width = '1%';
  progressLabel.textContent = '1%';
  footerNote.textContent = '© criado por Vitor, 2026';
  panel.style.opacity = '1';
  panel.style.transform = 'translateY(0)';
  document.querySelector('footer').style.opacity = '1';
  document.body.style.background = '#000';
  nickInput.value = '';
  passwordInput.value = '';
  setFeedback('');
}

togglePasswordBtn.addEventListener('click', () => {
  const shouldShow = passwordInput.type === 'password';
  passwordInput.type = shouldShow ? 'text' : 'password';
  togglePasswordBtn.textContent = shouldShow ? 'Ocultar' : 'Mostrar';
  togglePasswordBtn.setAttribute('aria-label', shouldShow ? 'Ocultar senha' : 'Mostrar senha');
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const password = getPassword();
  const nick = getNick();

  if (finalStarted) {
    return;
  }

  if (stage === 1) {
    if (password === '123456') {
      advanceStage();
      return;
    }
    shakePanel();
    setFeedback('Senha incorreta.');
    return;
  }

  if (stage === 15) {
    setFeedback('Validando senha...');
    beginProgress();
    return;
  }

  if (!satisfiesRules(password, stage)) {
    shakePanel();
    setFeedback(stageMessages[Math.min(stage - 1, stageMessages.length - 1)]);
    return;
  }

  if (stage === 8) {
    stage = 9;
    setFeedback('Senha incorreta. Agora remova a palavra SENHA.');
    return;
  }

  if (stage === 9) {
    stage = 10;
    setFeedback(stageMessages[9]);
    return;
  }

  if (stage === 14) {
    stage = 15;
    progressLayer.classList.remove('hidden');
    beginProgress();
    return;
  }

  advanceStage();
});

retryBtn.addEventListener('click', () => {
  resetExperience();
  nickInput.value = '';
  passwordInput.value = '';
  setFeedback('');
});

passwordInput.addEventListener('focus', () => {
  passwordInput.placeholder = 'Digite sua senha: 123456';
});

nickInput.addEventListener('input', () => {
  const value = nickInput.value.trim();
  if (!value) {
    nickInput.placeholder = 'Usuário';
  }
});
