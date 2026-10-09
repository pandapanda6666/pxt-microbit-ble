/**
 * 專屬 Panda 無人機的自訂藍芽 LED 控制擴充套件
 * 支援透過藍芽 UART 控制 Micro:bit 的 5x5 LED 矩陣
 */
//% color="#0066cc" weight=100 icon="\uf294" block="藍芽LED控制"
namespace bleLED {
    let isReceiverActive = false;
    let expectedPassword = "";
    let isAuthenticated = true;
    let userOnConnected: () => void = null;
    let userOnDisconnected: () => void = null;

    // 統一註冊底層連線事件，確保安全上鎖機制必定執行
    bluetooth.onBluetoothConnected(function () {
        if (userOnConnected) userOnConnected();
    });

    bluetooth.onBluetoothDisconnected(function () {
        // 藍芽斷線時，若有設定密碼，則強制重新上鎖
        if (expectedPassword != "") {
            isAuthenticated = false;
        }
        if (userOnDisconnected) userOnDisconnected();
    });

    /**
     * 設定藍芽通訊的應用層密碼。
     * 設定後，傳送端必須先透過 UART 傳送 "PWD:你的密碼" 才能解鎖操作權限。
     * 每次藍芽斷線皆會自動重新上鎖。
     */
    //% block="設定藍芽通訊密碼為 %pwd"
    //% weight=95
    //% blockId=ble_set_password
    export function setBluetoothPassword(pwd: string): void {
        expectedPassword = pwd;
        isAuthenticated = (pwd == "");
    }

    /**
     * 啟動藍芽 UART 矩陣接收器。
     * 開啟後，當收到長度為 25 的 0/1 字串時，會自動改變 5x5 LED 的亮滅狀態。
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

            // 檢查是否需要密碼認證
            if (!isAuthenticated) {
                if (data == "PWD:" + expectedPassword) {
                    isAuthenticated = true;
                }
                return; // 尚未驗證成功前，阻擋後續所有操作
            }

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
                basic.showString(data);
            }
        });
    }

    /**
     * 關閉藍芽 UART 矩陣接收器。
     */
    //% block="關閉藍芽 UART 矩陣接收器"
    //% weight=90
    //% blockId=ble_stop_receiver
    export function stopUARTReceiver(): void {
        isReceiverActive = false;
    }

    /**
     * 當藍芽裝置連線成功時觸發此事件。
     */
    //% block="當藍芽連線時"
    //% weight=80
    //% blockId=ble_on_connected
    export function onConnected(handler: () => void): void {
        userOnConnected = handler;
    }

    /**
     * 當藍芽裝置斷線時觸發此事件。
     */
    //% block="當藍芽斷線時"
    //% weight=70
    //% blockId=ble_on_disconnected
    export function onDisconnected(handler: () => void): void {
        userOnDisconnected = handler;
    }
}
