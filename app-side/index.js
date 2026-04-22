import { BaseSideService } from '@zeppos/zml/base-side'

AppSideService(
  BaseSideService({
    onInit() {
      console.log('Side Service Iniciado via ZML')
    },
    
    onRequest(req, res) {
      // ==== VERSÃO DO RICARDO ====
      // Quando o Ricardo apertar o botão, manda pra Simone!
      let partnerId = '6466840831' // Destino: Telegram da Simone
      let myId = '5288471435'      // Dono do Relógio: Ricardo
      
      try {
        if (typeof settings !== 'undefined' && settings.settingsStorage) {
          partnerId = settings.settingsStorage.getItem('partnerId') || partnerId
          myId = settings.settingsStorage.getItem('myId') || myId
        }
      } catch(e) {}

      const FIREBASE_URL = 'https://sol-e-lua-c0867-default-rtdb.firebaseio.com'

      if (req.method === 'SEND_SIGNAL') {
        console.log('Mandando sinal HTTP para o Firebase e Telegram: ', partnerId)
        
        const TELEGRAM_TOKEN = '8640969857:AAF3h9dTO1WQnxYRFNfI5y8pVU-wzdxApNI'
        const TELEGRAM_URL = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`

        // 1. Disparo para o Telegram (Gera a Notificação Nativa no Celular)
        fetch(TELEGRAM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: partnerId,
            text: 'Lembrando de Você ❤️'
          })
        }).catch(err => console.error('Erro Telegram:', err))

        // 2. Disparo para o Firebase (Mantém o estado no relógio)
        fetch(`${FIREBASE_URL}/signals/${partnerId}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lastSignalAt: Date.now(),
            message: 'saudades'
          })
        })
        .then(response => response.json())
        .then(data => {
          console.log('Sucesso Firebase:', data)
          res(null, { success: true, message: 'Sinal enviado com sucesso!' })
        })
        .catch(error => {
          console.error('Erro no Firebase:', error)
          res(null, { success: false, error: 'Falha na conexão com a Internet' })
        })
      }
      
      if (req.method === 'CHECK_SIGNAL') {
        console.log('Checando sinais para: ', myId)
        
        fetch(`${FIREBASE_URL}/signals/${myId}.json`, {
          method: 'GET'
        })
        .then(response => response.json())
        .then(data => {
          if (data && data.lastSignalAt) {
            res(null, { success: true, lastSignalAt: data.lastSignalAt })
          } else {
            res(null, { success: true, lastSignalAt: 0 })
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
