/**
 * Panda BLE LED 控制
 */
//% color="#0066cc" weight=100 icon="\uf294"
namespace bleLED {
    let isReceiverActive = false;
    let expectedPassword = "";
    let isAuthenticated = true;
    
    let userOnConnected: () => void = () => {};
    let userOnDisconnected: () => void = () => {};

    bluetooth.onBluetoothConnected(function () {
        userOnConnected();
    });

    bluetooth.onBluetoothDisconnected(function () {
        if (expectedPassword != "") {
            isAuthenticated = false;
        }
        userOnDisconnected();
    });

    /**
     * 設定藍芽通訊密碼
     * @param pwd 密碼字串
     */
    //% block="設定藍芽通訊密碼為 %pwd"
    export function setBluetoothPassword(pwd: string): void {
        expectedPassword = pwd;
        isAuthenticated = (pwd == "");
    }

    /**
     * 啟動接收器
     */
    //% block="啟動藍芽 UART 矩陣接收器"
    export function startUARTReceiver(): void {
        isReceiverActive = true;
        bluetooth.startUartService();
        bluetooth.onUartDataReceived("\n", function () {
            let data = bluetooth.uartReadUntil("\n");
            if (!isReceiverActive) return;

            if (!isAuthenticated) {
                if (data == "PWD:" + expectedPassword) {
                    isAuthenticated = true;
                }
                return;
            }

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
                basic.showString(data);
            }
        });
    }

    /**
     * 關閉接收器
     */
    //% block="關閉藍芽 UART 矩陣接收器"
    export function stopUARTReceiver(): void {
        isReceiverActive = false;
    }

    /**
     * 當藍芽連線時
     */
    //% block="當藍芽連線時"
    export function onConnected(handler: () => void): void {
        userOnConnected = handler;
    }

    /**
     * 當藍芽斷線時
     */
    //% block="當藍芽斷線時"
    export function onDisconnected(handler: () => void): void {
        userOnDisconnected = handler;
    }
}
