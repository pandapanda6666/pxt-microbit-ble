/**
 * 專屬 Panda 無人機的自訂藍芽 LED 控制擴充套件
 * 支援透過藍芽 UART 控制 Micro:bit 的 5x5 LED 矩陣
 */
//% color="#0066cc" weight=100 icon="\uf294" block="藍芽LED控制"
namespace bleLED {
    let isReceiverActive = false;

    /**
     * 啟動藍芽 UART 矩陣接收器。
     * 開啟後，當收到長度為 25 的 0/1 字串時，會自動改變 5x5 LED 的亮滅狀態。
     * (字串格式：由左至右、由上至下排列)
     */
    //% block="啟動藍芽 UART 矩陣接收器"
    //% weight=100
    //% blockId=ble_start_receiver
    export function startUARTReceiver(): void {
        isReceiverActive = true;
        bluetooth.startUartService();
        bluetooth.onUartDataReceived(bluetooth.newLine(), function () {
            let data = bluetooth.uartReadUntil(bluetooth.newLine());
            if (!isReceiverActive) return; // 若已關閉則忽略資料

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
     * 關閉藍芽 UART 矩陣接收器。
     * 關閉後，Micro:bit 將停止解析藍芽傳來的 LED 字串。
     */
    //% block="關閉藍芽 UART 矩陣接收器"
    //% weight=90
    //% blockId=ble_stop_receiver
    export function stopUARTReceiver(): void {
        isReceiverActive = false;
    }

    /**
     * 當藍芽裝置連線成功時觸發此事件。
     * 可以在這裡加入連線成功時的動畫或燈號提示。
     */
    //% block="當藍芽連線時"
    //% weight=80
    //% blockId=ble_on_connected
    export function onConnected(handler: () => void): void {
        bluetooth.onBluetoothConnected(handler);
    }

    /**
     * 當藍芽裝置斷線時觸發此事件。
     * 可以在這裡加入斷線時的動畫或燈號提示，方便除錯。
     */
    //% block="當藍芽斷線時"
    //% weight=70
    //% blockId=ble_on_disconnected
    export function onDisconnected(handler: () => void): void {
        bluetooth.onBluetoothDisconnected(handler);
    }
}
