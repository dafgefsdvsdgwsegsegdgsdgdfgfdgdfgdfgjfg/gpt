const lawLoader = new LawLoader();
const lawSearch = new LawSearch(lawLoader);

const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const welcomeScreen = document.getElementById('welcome-screen');
const chatContainer = document.getElementById('chat-container');
const newChatBtn = document.getElementById('new-chat-btn');

// Lade alle Gesetzestexte beim Start
lawLoader.loadAll().then(() => console.log('Alle Texte geladen'));

function addMessage(role, text) {
  const msg = document.createElement('div');
  msg.className = 'message ' + role;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = role === 'user' ? 'DU' : 'GPT';

  const content = document.createElement('div');
  content.className = 'message-content';
  content.innerHTML = text.replace(/\n/g, '<br>');

  msg.appendChild(avatar);
  msg.appendChild(content);
  messagesContainer.appendChild(msg);
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  welcomeScreen.style.display = 'none';
  addMessage('user', text);
  userInput.value = '';
  sendBtn.disabled = true;

  const results = lawSearch.searchLaws(text);
  let answer = 'Keine Treffer gefunden.';
  if (results.length) {
    answer = results.map(r => `<strong>${r.lawName} - ${r.title}</strong><br>${r.text.replace(/\n/g,'<br>')}`).join('<br><br>');
  }

  setTimeout(() => addMessage('assistant', answer), 500);
}

userInput.addEventListener('input', () => {
  sendBtn.disabled = !userInput.value.trim();
});

userInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

sendBtn.addEventListener('click', sendMessage);

// + Neuer Chat lädt die Seite neu
newChatBtn.addEventListener('click', () => {
  window.location.reload();
});

// Beispiel-Fragen
document.querySelectorAll('.example-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    userInput.value = btn.textContent;
    sendMessage();
  });
});
