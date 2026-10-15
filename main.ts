/**
 * Panda BLE LED 擴充包
 * 提供 Micro:bit 透過藍芽遠端控制 5x5 LED 矩陣的功能
 */
//% color="#0066cc" weight=100 icon="\uf294"
namespace bleLED {
    let isReceiverActive = false;
    let expectedPassword = "";
    let isAuthenticated = true;
    
    let userOnConnected: () => void = () => {};
    let userOnDisconnected: () => void = () => {};
    let userOnAuthSuccess: () => void = () => {};
    let userOnAuthFailed: () => void = () => {};

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
    //% blockId=bleled_set_pwd block="設定藍芽通訊密碼為 %pwd"
    //% weight=90
    export function setBluetoothPassword(pwd: string): void {
        expectedPassword = pwd;
        isAuthenticated = (pwd == "");
    }

    /**
     * 啟動藍芽 UART 矩陣接收器。
     * 必須放置於「當啟動時」積木中，才能開始接收網頁端的燈號控制訊號。
     */
    //% blockId=bleled_start_uart block="啟動藍芽 UART 矩陣接收器"
    //% weight=80
    export function startUARTReceiver(): void {
        isReceiverActive = true;
        bluetooth.startUartService();

        bluetooth.onUartDataReceived("\n", function () {
            let data = bluetooth.uartReadUntil("\n");
            if (!isReceiverActive) return;

            // 清理結尾的 carriage return 或空白字元
            let cleanData = "";
            for (let i = 0; i < data.length; i++) {
                let code = data.charCodeAt(i);
                if (code != 13 && code != 10) {
                    cleanData += data.charAt(i);
                }
            }

            // 攔截並驗證密碼 (格式: PWD:密碼)
            if (cleanData.indexOf("PWD:") == 0) {
                let receivedPwd = cleanData.substr(4);
                if (receivedPwd == expectedPassword) {
                    isAuthenticated = true;
                    bluetooth.uartWriteString("AUTH:OK\n");
                    userOnAuthSuccess();
                } else {
                    bluetooth.uartWriteString("AUTH:FAIL\n");
                    userOnAuthFailed();
                }
                return;
            }

            // 未通過驗證前忽略所有點燈訊號
            if (!isAuthenticated) return;

            // 解析壓縮後的點燈訊號 (格式: "31,31,31,31,31")
            let parts = cleanData.split(",");
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
    //% blockId=bleled_stop_uart block="關閉藍芽 UART 矩陣接收器"
    //% weight=70
    export function stopUARTReceiver(): void {
        isReceiverActive = false;
    }

    /**
     * 當藍芽連線成功時觸發此事件。
     */
    //% blockId=bleled_on_connected block="當藍芽連線時"
    //% weight=60
    export function onConnected(handler: () => void): void {
        userOnConnected = handler;
    }

    /**
     * 當藍芽斷線時觸發此事件。
     */
    //% blockId=bleled_on_disconnected block="當藍芽斷線時"
    //% weight=50
    export function onDisconnected(handler: () => void): void {
        userOnDisconnected = handler;
    }

    /**
     * 當密碼驗證成功時觸發此事件。
     */
    //% blockId=bleled_on_auth_success block="當密碼驗證成功時"
    //% weight=40
    export function onAuthSuccess(handler: () => void): void {
        userOnAuthSuccess = handler;
    }

    /**
     * 當密碼驗證失敗時觸發此事件。
     */
    //% blockId=bleled_on_auth_failed block="當密碼驗證失敗時"
    //% weight=30
    export function onAuthFailed(handler: () => void): void {
        userOnAuthFailed = handler;
    }
}
