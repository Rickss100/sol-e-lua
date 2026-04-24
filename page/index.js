import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { Vibrator } from '@zos/sensor'
import { localStorage } from '@zos/storage'
import { push } from '@zos/router'

Page(
  BasePage({
    build() {
      // Fundo da Tela Preto
      createWidget(widget.FILL_RECT, {
        x: 0, y: 0, w: 480, h: 480,
        color: 0x000000
      })

      // Título / status de última mensagem recebida
      this.titleText = createWidget(widget.TEXT, {
        x: 40, y: 40, w: 400, h: 100,
        color: 0xaaaaaa,
        text_size: 28,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: 'Sol e Lua'
      })

      // Botão principal (coração)
      this.mainBtn = createWidget(widget.BUTTON, {
        x: 90, y: 155, w: 300, h: 180,
        radius: 90,
        normal_color: 0x1a0000,
        press_color: 0xff0033,
        text: '❤️\nNova\nMensagem',
        color: 0xffffff,
        text_size: 36,
        click_func: () => {
          // Navega para a página de escolha de mensagem
          push({ url: 'page/options' })
        }
      })

      // Checa se há mensagens ao abrir o App
      this.checkIncomingSignals()
    },

    onResume() {
      // Ao voltar da página de opções, atualiza o botão principal
      this.mainBtn.setProperty(prop.TEXT, '❤️\nNova\nMensagem')
    },

    checkIncomingSignals() {
      try {
        this.request({ method: 'CHECK_SIGNAL' })
          .then((result) => {
            if (result && result.success && result.lastSignalAt) {
              const lastSeen = localStorage.getItem('lastSeenSignalAt') || 0

              if (result.lastSignalAt > lastSeen) {
                // Nova mensagem!
                localStorage.setItem('lastSeenSignalAt', result.lastSignalAt)

                const msgRecebida = result.message || 'Nova Mensagem!'
                this.titleText.setProperty(prop.TEXT, `Recebeu:\n${msgRecebida}`)
                this.titleText.setProperty(prop.COLOR, 0xffffff)
                this.mainBtn.setProperty(prop.TEXT, '💬\nResponder')

                try {
                  const vibrator = new Vibrator()
                  vibrator.start()
                  setTimeout(() => { vibrator.stop() }, 1000)
                } catch(e) {}

              } else {
                // Mostra última mensagem recebida
                const msgRecebida = result.message || ''
                if (msgRecebida) {
                  this.titleText.setProperty(prop.TEXT, `Última:\n${msgRecebida}`)
                }
              }
            }
          })
          .catch(err => console.log('Erro no check:', err))
      } catch(e) {}
    }
  })
)
