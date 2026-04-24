import { BasePage } from '@zeppos/zml/base-page'
import { createWidget, widget, prop, align } from '@zos/ui'
import { Vibrator } from '@zos/sensor'
import { back } from '@zos/router'

const MESSAGES = [
  'Lembrando de Você 💭',
  'Saudades de Você ❤️',
  'Te Amo 🥰',
  'Beijos 💋'
]

Page(
  BasePage({
    build() {
      // Fundo preto
      createWidget(widget.FILL_RECT, {
        x: 0, y: 0, w: 480, h: 480,
        color: 0x000000
      })

      // Título
      createWidget(widget.TEXT, {
        x: 40, y: 20, w: 400, h: 50,
        color: 0xaaaaaa,
        text_size: 26,
        align_h: align.CENTER_H,
        align_v: align.CENTER_V,
        text: 'O que enviar?'
      })

      // Botões de mensagem
      MESSAGES.forEach((msg, i) => {
        createWidget(widget.BUTTON, {
          x: 60,
          y: 70 + i * 80,
          w: 360,
          h: 68,
          radius: 34,
          normal_color: 0x3d0010,
          press_color: 0xff0033,
          text: msg,
          color: 0xffffff,
          text_size: 24,
          click_func: () => {
            this.enviar(msg)
          }
        })
      })

      // Botão Cancelar
      createWidget(widget.BUTTON, {
        x: 100,
        y: 400,
        w: 280,
        h: 58,
        radius: 29,
        normal_color: 0x222222,
        press_color: 0x555555,
        text: '← Voltar',
        color: 0xffffff,
        text_size: 24,
        click_func: () => {
          back()
        }
      })
    },

    enviar(messageText) {
      // Feedback de carregamento
      try {
        const vibrator = new Vibrator()
        vibrator.start()
        setTimeout(() => { vibrator.stop() }, 500)
      } catch(e) {}

      this.request({
        method: 'SEND_SIGNAL',
        params: { message: messageText }
      }).then(() => {
        // Volta para a tela principal após enviar
        back()
      }).catch((error) => {
        console.log('Erro ao enviar:', error)
        back()
      })
    }
  })
)
