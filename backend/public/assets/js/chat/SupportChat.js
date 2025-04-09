class SupportChat extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
          }
          button {
            background: #1E90FF;
            color: white;
            border: none;
            padding: 15px 25px;
            border-radius: 25px;
            cursor: pointer;
          }
        </style>
        <button>💬 Soporte</button>
      `;
    }
  }
  
  customElements.define('support-chat', SupportChat);