/**
 * Panda BLE LED 擴充包
 * 提供無人機或一般 Micro:bit 透過藍芽遠端控制 5x5 LED 矩陣的功能
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
     * 設定藍芽通訊密碼。
     * 若有設定密碼，控制端必須送出正確密碼才能控制燈號。
     * @param pwd 密碼字串，留空代表不需密碼
     */
    //% block="設定藍芽通訊密碼為 %pwd"
    //% weight=90
    export function setBluetoothPassword(pwd: string): void {
        expectedPassword = pwd;
        isAuthenticated = (pwd == "");
    }

    /**
     * 啟動藍芽 UART 矩陣接收器。
     * 必須放置於「當啟動時」積木中，才能開始接收網頁端的燈號控制訊號。
     */
    //% block="啟動藍芽 UART 矩陣接收器"
    //% weight=80
    export function startUARTReceiver(): void {
        isReceiverActive = true;
        bluetooth.startUartService();
        bluetooth.onUartDataReceived("\n", function () {
            let data = bluetooth.uartReadUntil("\n");
            if (!isReceiverActive) return;

            // 攔截並驗證密碼
            if (data.indexOf("PWD:") == 0) {
                if (data == "PWD:" + expectedPassword) {
                    isAuthenticated = true;
                    basic.showIcon(IconNames.Yes);
                    basic.pause(500);
                    basic.clearScreen();
                } else {
                    basic.showIcon(IconNames.No);
                    basic.pause(500);
                    basic.clearScreen();
                }
                return;
            }

            // 未驗證前忽略其他點燈訊號
            if (!isAuthenticated) return;

            // 解析壓縮後的點燈訊號 (格式: "31,31,31,31,31")
            let parts = data.split(",");
            if (parts.length == 5) {
                for (let y = 0; y < 5; y++) {
                    let val = parseInt(parts[y]);
                    for (let x = 0; x < 5; x++) {
                        if ((val & (1 << x)) != 0) {
                            led.plot(x, y);
                        } else {
                            led.unplot(x, y);
                        }
                    }
                }
            }
        });
    }

    /**
     * 關閉藍芽 UART 矩陣接收器。
     * 暫停接收網頁端的控制訊號。
     */
    //% block="關閉藍芽 UART 矩陣接收器"
    //% weight=70
    export function stopUARTReceiver(): void {
        isReceiverActive = false;
    }

    /**
     * 當藍芽連線成功時觸發此事件。
     */
    //% block="當藍芽連線時"
    //% weight=60
    export function onConnected(handler: () => void): void {
        userOnConnected = handler;
    }

    /**
     * 當藍芽斷線時觸發此事件。
     */
    //% block="當藍芽斷線時"
    //% weight=50
    export function onDisconnected(handler: () => void): void {
        userOnDisconnected = handler;
    }
}
