const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const summaryInput = document.getElementById('summaryInput');
const sentimentInput = document.getElementById('sentimentInput');
const textToSpeechInput = document.getElementById('textToSpeechInput');
const summaryOutput = document.getElementById('summaryOutput');
const sentimentOutput = document.getElementById('sentimentOutput');
const textToSpeechOutput = document.getElementById('textToSpeechOutput');
const sendChat = document.getElementById('sendChat');
const summarizeBtn = document.getElementById('summarizeBtn');
const sentimentBtn = document.getElementById('sentimentBtn');
const textToSpeechBtn = document.getElementById('textToSpeechBtn');
const clearChat = document.getElementById('clearChat');
const clearSummary = document.getElementById('clearSummary');
const clearSentiment = document.getElementById('clearSentiment');
const clearTextToSpeech = document.getElementById('clearTextToSpeech');

const chatHistory = [
  { role: 'assistant', message: 'Hello! I am your GenAI chat assistant. Ask me anything or use the other tabs for summaries and sentiment.' }
];

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function formatMarkdown(text) {
  const lines = String(text ?? '').split(/\r?\n/);
  const htmlLines = [];
  let listItems = [];
  let listType = null;

  const flushList = () => {
    if (!listItems.length) {
      return;
    }

    const tag = listType === 'ordered' ? 'ol' : 'ul';
    htmlLines.push(`<${tag}>${listItems.map(item => `<li>${formatInlineMarkdown(item)}</li>`).join('')}</${tag}>`);
    listItems = [];
    listType = null;
  };

  lines.forEach(rawLine => {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      return;
    }

    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    if (bulletMatch) {
      if (listType !== null && listType !== 'unordered') {
        flushList();
      }
      listType = 'unordered';
      listItems.push(bulletMatch[1]);
      return;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (numberedMatch) {
      if (listType !== null && listType !== 'ordered') {
        flushList();
      }
      listType = 'ordered';
      listItems.push(numberedMatch[2]);
      return;
    }

    flushList();
    htmlLines.push(`<p>${formatInlineMarkdown(line)}</p>`);
  });

  flushList();
  return htmlLines.join('');
}

function setMarkdownContent(element, value) {
  element.innerHTML = formatMarkdown(value);
}

function switchPanel(panelId) {
  panels.forEach(panel => panel.id === panelId ? panel.classList.add('active') : panel.classList.remove('active'));
  tabs.forEach(tab => tab.dataset.panel === panelId ? tab.classList.add('active') : tab.classList.remove('active'));
}

tabs.forEach(tab => tab.addEventListener('click', () => switchPanel(tab.dataset.panel)));

function renderChat() {
  chatWindow.innerHTML = '';
  chatHistory.forEach(entry => {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble markdown-content ${entry.role === 'assistant' ? 'assistant' : 'user'}`;
    setMarkdownContent(bubble, entry.message);
    chatWindow.appendChild(bubble);
  });
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addChatMessage(role, message) {
  chatHistory.push({ role, message });
  renderChat();
}

const apiBase = location.protocol === 'file:' ? 'http://127.0.0.1:5000' : `${location.protocol}//${location.host}`;

async function postJson(path, payload) {
  const response = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

sendChat.addEventListener('click', async () => {
  const message = chatInput.value.trim();
  if (!message) return;
  addChatMessage('user', message);
  chatInput.value = '';
  addChatMessage('assistant', 'Processing your message...');

  try {
    const result = await postJson('/api/chat', { message });
    chatHistory.pop();
    addChatMessage('assistant', result.result);
  } catch (error) {
    chatHistory.pop();
    addChatMessage('assistant', 'Unable to reach the AI service. Please ensure the backend is running.');
    console.error(error);
  }
});

summarizeBtn.addEventListener('click', async () => {
  const text = summaryInput.value.trim();
  if (!text) {
    summaryOutput.textContent = 'Enter text to summarize.';
    return;
  }
  setMarkdownContent(summaryOutput, 'Generating summary...');
  try {
    const result = await postJson('/api/summarize', { text });
    setMarkdownContent(summaryOutput, result.result);
  } catch (error) {
    setMarkdownContent(summaryOutput, 'Failed to summarize. Make sure the backend is running.');
    console.error(error);
  }
});

sentimentBtn.addEventListener('click', async () => {
  const text = sentimentInput.value.trim();
  if (!text) {
    sentimentOutput.textContent = 'Enter text to analyze sentiment.';
    return;
  }
  setMarkdownContent(sentimentOutput, 'Analyzing sentiment...');
  try {
    const result = await postJson('/api/sentiment', { text });
    setMarkdownContent(sentimentOutput, result.result);
  } catch (error) {
    setMarkdownContent(sentimentOutput, 'Sentiment analysis failed. Check backend connectivity.');
    console.error(error);
  }
});

textToSpeechBtn.addEventListener('click', async () => {
  const text = textToSpeechInput.value.trim();
  if (!text) {
    textToSpeechOutput.textContent = 'Enter text to convert to speech.';
    return;
  }

  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => {
      textToSpeechOutput.textContent = 'Speaking now...';
    };
    utterance.onend = () => {
      textToSpeechOutput.textContent = 'Speech finished.';
    };
    utterance.onerror = () => {
      textToSpeechOutput.textContent = 'Browser speech failed. Please try a different browser.';
    };
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  } else {
    textToSpeechOutput.textContent = 'Text-to-speech is not supported in this browser.';
  }
});

clearChat.addEventListener('click', () => {
  chatHistory.length = 0;
  addChatMessage('assistant', 'Chat cleared. Start a new conversation anytime.');
});

clearSummary.addEventListener('click', () => {
  summaryInput.value = '';
  summaryOutput.textContent = '';
});

clearSentiment.addEventListener('click', () => {
  sentimentInput.value = '';
  sentimentOutput.textContent = '';
});

clearTextToSpeech.addEventListener('click', () => {
  textToSpeechInput.value = '';
  textToSpeechOutput.textContent = '';
});

renderChat();
