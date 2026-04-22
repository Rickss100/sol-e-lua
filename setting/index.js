AppSettingsPage({
  state: {
    partnerId: ''
  },
  build() {
    return [
      {
        type: 'text',
        color: '#ffffff',
        value: 'Configurar Pulseira:'
      },
      {
        type: 'textInput',
        label: 'ID do Parceiro:',
        settingsKey: 'partnerId'
      }
    ]
  }
})