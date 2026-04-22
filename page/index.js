import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, align, prop, text_style } from '@zos/ui'
import { Vibrator } from '@zos/sensor'
import { localStorage } from '@zos/storage'

Page(
  BasePage({
    build() {
      console.log('Page build invoked')
      
      // Fundo da Tela Preto
      createWidget(widget.FILL_RECT, {
        x: 0, 
        y: 0,
        w: 480,
        h: 480,
        color: 0x000000 
      })

      // Botão Principal (Coração)
      this.btn = createWidget(widget.BUTTON, {
        x: 90, 
        y: 110,
        w: 300,
        h: 240,
        radius: 120,
        normal_color: 0x1a0000,
        press_color: 0xff0033,
        text: '❤️\nSaudades',
        color: 0xffffff,
        text_size: 42,
        click_func: () => {
          this.sendLoveSignal()
        }
      })

      // Checa se há mensagens ao abrir o App
      this.checkIncomingSignals()
    },

    checkIncomingSignals() {
      console.log('Checando sinais do parceiro...')
      try {
        this.request({ method: 'CHECK_SIGNAL' })
          .then((result) => {
            if (result && result.success && result.lastSignalAt) {
              const lastSeen = localStorage.getItem('lastSeenSignalAt') || 0
              if (result.lastSignalAt > lastSeen) {
                console.log('NOVO SINAL RECEBIDO!')
                localStorage.setItem('lastSeenSignalAt', result.lastSignalAt)
                
                // Muda o botão para avisar que recebeu!
                this.btn.setProperty(prop.TEXT, '💖\nRecebeu!')
                
                try {
                  const vibrator = new Vibrator()
                  vibrator.start()
                } catch(e) {}

                setTimeout(() => {
                  this.btn.setProperty(prop.TEXT, '❤️\nSaudades')
                }, 4000)
              }
            }
          })
          .catch(err => console.error('Erro no check:', err))
      } catch(e) {
        console.error('Falha na requisicao BLE', e)
      }
    },

    sendLoveSignal() {
      // Feedback Imediato!
      this.btn.setProperty(prop.TEXT, '⏳\nEnviando...')
      
      try {
        const vibrator = new Vibrator()
        vibrator.start()
        setTimeout(() => { vibrator.stop() }, 1000) // Para a vibração após 1s
      } catch (e) {
        console.log('Erro vibrador', e)
      }
      
      try {
        this.request({
          method: 'SEND_SIGNAL'
        }).then((result) => {
          this.btn.setProperty(prop.TEXT, '✅\nEnviado!')
          setTimeout(() => {
            this.btn.setProperty(prop.TEXT, '❤️\nSaudades')
          }, 2000)
        }).catch((error) => {
          this.btn.setProperty(prop.TEXT, '❌\nFalhou')
          setTimeout(() => {
            this.btn.setProperty(prop.TEXT, '❤️\nSaudades')
          }, 3000)
        })
      } catch (e) {
        this.btn.setProperty(prop.TEXT, '⚠️\nErro AppSide')
        setTimeout(() => {
          this.btn.setProperty(prop.TEXT, '❤️\nSaudades')
        }, 3000)
      }
    }
  })
)

