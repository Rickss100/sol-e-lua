import { BaseSideService } from '@zeppos/zml/base-side'

// ==== VERSÃO DA SIMONE (GTR 4) ====
// Simone manda → chega no Telegram do Ricardo
// Ricardo manda → chega no Telegram da Simone (lido pelo CHECK_SIGNAL)

const MY_ID       = '6466840831' // ID do Telegram da Simone
const PARTNER_ID  = '5288471435' // ID do Telegram do Ricardo

const FIREBASE_URL   = 'https://sol-e-lua-c0867-default-rtdb.firebaseio.com'
const TELEGRAM_TOKEN = '8640969857:AAF3h9dTO1WQnxYRFNfI5y8pVU-wzdxApNI'
const TELEGRAM_URL   = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`

AppSideService(
  BaseSideService({
    onInit() {
      console.log('[Simone] App-Side iniciado')
    },

    onRequest(req, res) {
      if (req.method === 'SEND_SIGNAL') {
        const messageText = req.params?.message || 'Lembrando de Você 💭'
        console.log(`[Simone] Enviando para Ricardo (${PARTNER_ID}): "${messageText}"`)

        // Envia notificação no Telegram do Ricardo
        fetch(TELEGRAM_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: PARTNER_ID, text: messageText })
        }).catch(err => console.error('Erro Telegram:', err))

        // Grava no Firebase no nó do Ricardo (para o relógio dele detectar)
        fetch(`${FIREBASE_URL}/signals/${PARTNER_ID}.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lastSignalAt: Date.now(), message: messageText })
        })
        .then(r => r.json())
        .then(() => res(null, { success: true }))
        .catch(error => {
          console.error('Erro Firebase:', error)
          res(null, { success: false, error: 'Falha na conexão' })
        })
      }

      if (req.method === 'CHECK_SIGNAL') {
        // Lê o nó da Simone — onde o Ricardo escreve quando manda mensagem
        console.log(`[Simone] Checando Firebase em signals/${MY_ID}`)
        fetch(`${FIREBASE_URL}/signals/${MY_ID}.json`)
        .then(r => r.json())
        .then(data => {
          if (data && data.lastSignalAt) {
            res(null, { success: true, lastSignalAt: data.lastSignalAt, message: data.message || 'Nova Mensagem!' })
          } else {
            res(null, { success: true, lastSignalAt: 0, message: '' })
          }
        })
        .catch(error => {
          console.error('Erro Firebase:', error)
          res(null, { success: false, error: 'Falha na leitura' })
        })
      }
    },

    onRun() { console.log('[Simone] Rodando em background') },
    onDestroy() { console.log('[Simone] Destruido') }
  })
)
