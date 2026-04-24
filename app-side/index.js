import { BaseSideService } from '@zeppos/zml/base-side'

// ============================================================
// CONFIGURAÇÃO DOS DOIS USUÁRIOS
// Ricardo usa T-Rex Ultra (deviceSource 6553856 ou 6553857)
// Simone usa GTR 4 (deviceSource 7930112 ou 7930113)
// ============================================================
const USUARIOS = {
  RICARDO: {
    myId:      '5288471435', // ID do Telegram do Ricardo
    partnerId: '6466840831'  // ID do Telegram da Simone
  },
  SIMONE: {
    myId:      '6466840831', // ID do Telegram da Simone
    partnerId: '5288471435'  // ID do Telegram do Ricardo
  }
}

// deviceSource dos relógios (vem do app.json)
const DEVICE_TREX_ULTRA = [6553856, 6553857]  // Ricardo
const DEVICE_GTR4       = [7930112, 7930113]  // Simone

const FIREBASE_URL   = 'https://sol-e-lua-c0867-default-rtdb.firebaseio.com'
const TELEGRAM_TOKEN = '8640969857:AAF3h9dTO1WQnxYRFNfI5y8pVU-wzdxApNI'
const TELEGRAM_URL   = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`

AppSideService(
  BaseSideService({
    onInit() {
      console.log('Side Service Iniciado via ZML')
    },
    
    onRequest(req, res) {
      // Detecta automaticamente o usuário pelo deviceSource do relógio
      const deviceSource = req.deviceSource || 0
      let usuario

      if (DEVICE_TREX_ULTRA.includes(deviceSource)) {
        usuario = USUARIOS.RICARDO
        console.log('Dispositivo identificado: T-Rex Ultra (Ricardo)')
      } else if (DEVICE_GTR4.includes(deviceSource)) {
        usuario = USUARIOS.SIMONE
        console.log('Dispositivo identificado: GTR 4 (Simone)')
      } else {
        // Fallback: assume que é o Ricardo se não reconhecer o dispositivo
        usuario = USUARIOS.RICARDO
        console.log('Dispositivo não reconhecido (deviceSource:', deviceSource, '), usando padrão Ricardo')
      }

      const { myId, partnerId } = usuario

      if (req.method === 'SEND_SIGNAL') {
        const messageText = req.params?.message || 'Lembrando de Você 💭'
        console.log(`Enviando de ${myId} para ${partnerId}: "${messageText}"`)

        // 1. Disparo para o Telegram do parceiro
        fetch(TELEGRAM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: partnerId,
            text: messageText
          })
        }).catch(err => console.error('Erro Telegram:', err))

        // 2. Grava no Firebase no nó do parceiro (para o relógio dele detectar)
        fetch(`${FIREBASE_URL}/signals/${partnerId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastSignalAt: Date.now(),
            message: messageText
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Sucesso Firebase:', data)
          res(null, { success: true })
        })
        .catch(error => {
          console.error('Erro no Firebase:', error)
          res(null, { success: false, error: 'Falha na conexão' })
        })
      }
      
      if (req.method === 'CHECK_SIGNAL') {
        // Lê o nó do próprio usuário (onde o parceiro escreve)
        console.log('Checando sinais no nó do Firebase:', myId)
        
        fetch(`${FIREBASE_URL}/signals/${myId}.json`, {
          method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
          if (data && data.lastSignalAt) {
            res(null, { success: true, lastSignalAt: data.lastSignalAt, message: data.message || 'Nova Mensagem!' })
          } else {
            res(null, { success: true, lastSignalAt: 0, message: '' })
          }
        })
        .catch(error => {
          console.error('Erro ao ler Firebase:', error)
          res(null, { success: false, error: 'Falha na leitura' })
        })
      }
    },

    onRun() {
      console.log('Rodando em background')
    },

    onDestroy() {
      console.log('Destruido')
    }
  })
)
