/**
 * 自訂藍芽 LED 控制擴充
 */
//% color="#0066cc" weight=100 icon="\uf294" block="藍芽LED控制"
namespace bleLED {
    /**
     * 啟動藍芽 UART 接收模式，當收到 25 字元的 0/1 字串時自動切換燈號
     * 格式範例: "1010101010111110000010001" (由左至右，由上至下)
     */
    //% block="啟動藍芽 UART 矩陣接收器"
    export function startUARTReceiver(): void {
        bluetooth.startUartService();
        bluetooth.onUartDataReceived(bluetooth.newLine(), function () {
            let data = bluetooth.uartReadUntil(bluetooth.newLine());
            // 解析字串並顯示在 5x5 LED 上
            if (data.length == 25) {
                for (let y = 0; y < 5; y++) {
                    for (let x = 0; x < 5; x++) {
                        if (data.charAt(y * 5 + x) == '1') {
                            led.plot(x, y);
                        } else {
                            led.unplot(x, y);
                        }
                    }
                }
            } else {
                // 如果格式不對，直接顯示文字
                basic.showString(data);
            }
        });
    }

    /**
     * 當藍芽連線成功時觸發
     */
    //% block="當藍芽連線時"
    export function onConnected(handler: () => void): void {
        bluetooth.onBluetoothConnected(handler);
    }

    /**
     * 當藍芽斷線時觸發
     */
    //% block="當藍芽斷線時"
    export function onDisconnected(handler: () => void): void {
        bluetooth.onBluetoothDisconnected(handler);
    }
}
