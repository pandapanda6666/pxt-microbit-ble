bleLED.onConnected(function () {
    basic.showIcon(IconNames.Happy)
})
bleLED.onDisconnected(function () {
    basic.showIcon(IconNames.Sad)
})
bleLED.startUARTReceiver()
