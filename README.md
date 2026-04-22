# 🌞 Sol e Lua - Zepp OS Mini Program 🌛

Um aplicativo romântico desenvolvido para smartwatches Amazfit (Zepp OS), criado para manter casais conectados. Com apenas um toque no relógio, uma notificação nativa de "Saudades ❤️" é enviada em tempo real para o pulso do seu parceiro.

## ✨ Funcionalidades
* **Comunicação Bidirecional:** Aplicativo instalado em dois relógios diferentes (Amazfit T-Rex Ultra e GTR 4).
* **Push Notifications Nativas:** Integração com a API do Telegram Bot para enviar alertas que acendem a tela e vibram o relógio do parceiro de forma instantânea.
* **Feedback Visual e Tátil:** O botão reage ao toque com cores diferentes, mudança de texto e vibração tátil (ZML).
* **Sincronização em Nuvem:** Uso do Firebase Realtime Database para atualizar o estado interno do app ("💖 Recebeu!") caso o usuário abra o aplicativo manualmente.

## 🛠️ Tecnologias Utilizadas
* **Zepp OS 2.0 / 3.0**
* **Zepp OS Message Library (ZML)** para comunicação eficiente via Bluetooth (Device <-> App Side).
* **JavaScript / Fetch API**
* **Telegram Bot API** (Notificações Push)
* **Firebase Realtime Database** (Estado da aplicação)

## 🚀 Arquitetura do Fluxo
1. O usuário toca no botão de coração na interface do relógio.
2. A interface (ZML BasePage) registra o evento e envia um pacote BLE para o celular hospedeiro.
3. O `App-Side Service` no celular recebe o pacote, aciona a API do Firebase (via REST) e a API do Telegram em background.
4. O robô do Telegram dispara a notificação para o celular destino, que é automaticamente refletida no relógio do parceiro pelo Zepp App nativo.

---
*Criado com ❤️ para conectar pulseiras à distância.*
