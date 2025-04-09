import { respuestas } from './responses.js';

class SupportChat extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.state = {
            isOpen: false,
            messages: []
        };
        console.log('[Chat] Constructor ejecutado');
    }

    connectedCallback() {
        console.log('[Chat] Componente montado en el DOM');
        this.render();
        this.initEventListeners();
    }

    render() {
        console.log('[Chat] Renderizando componente...');
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    z-index: 1000;
                }

                .chat-toggle {
                    background: #1E90FF;
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 25px;
                    cursor: pointer;
                    transition: transform 0.3s ease-in-out;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }

                .chat-toggle--expanded {
                    transform: scale(5);
                    opacity: 0;
                }

                .chat-window {
                    display: none;
                    width: 300px;
                    background: white;
                    border-radius: 10px;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                }

                .chat-header {
                    padding: 15px;
                    background: #3CB371;
                    color: white;
                    border-radius: 10px 10px 0 0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .close-btn {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                }

                .chat-messages {
                    height: 300px;
                    padding: 10px;
                    overflow-y: auto;
                }

                .bot-message, .user-message {
                    margin: 8px 0;
                    padding: 10px;
                    border-radius: 15px;
                    max-width: 80%;
                }

                .bot-message {
                    background: #f1f1f1;
                    color: #333;
                }

                .user-message {
                    background: #1E90FF;
                    color: white;
                    margin-left: auto;
                }

                .chat-input {
                    display: flex;
                    padding: 10px;
                    border-top: 1px solid #ddd;
                }

                input {
                    flex: 1;
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    margin-right: 8px;
                }

                .send-btn {
                    background: #3CB371;
                    color: white;
                    border: none;
                    padding: 8px 15px;
                    border-radius: 4px;
                    cursor: pointer;
                }
            </style>

            <button class="chat-toggle">💬 Soporte</button>
            
            <div class="chat-window">
                <div class="chat-header">
                    <h3>BK Soporte</h3>
                    <button class="close-btn">×</button>
                </div>
                <div class="chat-messages"></div>
                <div class="chat-input">
                    <input type="text" placeholder="Escribe tu mensaje...">
                    <button class="send-btn">Enviar</button>
                </div>
            </div>
        `;
    }

    initEventListeners() {
        console.log('[Chat] Inicializando event listeners...');
        const toggleBtn = this.shadowRoot.querySelector('.chat-toggle');
        const closeBtn = this.shadowRoot.querySelector('.close-btn');
        const sendBtn = this.shadowRoot.querySelector('.send-btn');
        const input = this.shadowRoot.querySelector('input');

        // Toggle chat
        toggleBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.toggleChat());

        // Enviar mensaje
        sendBtn.addEventListener('click', () => {
            const text = input.value.trim();
            if (text) {
                this.handleMessage(text);
                input.value = '';
            }
        });

        // Enter para enviar
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendBtn.click();
            }
        });
    }

    toggleChat() {
        console.log('[Chat] Toggle state:', !this.state.isOpen);
        const toggleBtn = this.shadowRoot.querySelector('.chat-toggle');
        const chatWindow = this.shadowRoot.querySelector('.chat-window');
        
        this.state.isOpen = !this.state.isOpen;
        toggleBtn.classList.toggle('chat-toggle--expanded', this.state.isOpen);
        chatWindow.style.display = this.state.isOpen ? 'block' : 'none';
    }

    handleMessage(text) {
        console.log('[Chat] Mensaje enviado:', text);
        this.addMessage(text, 'user');
        
        setTimeout(() => {
            const response = this.getResponse(text);
            this.addMessage(response, 'bot');
        }, 800);
    }

    getResponse(text) {
        const cleanText = text.toLowerCase();
        for (const [key, value] of Object.entries(respuestas)) {
            if (cleanText.includes(key)) return value;
        }
        return respuestas.default;
    }

    addMessage(text, sender) {
        const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

customElements.define('support-chat', SupportChat);