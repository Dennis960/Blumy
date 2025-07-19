import serial
import serial.tools.list_ports
import time


def find_esp32_port():
    ports = serial.tools.list_ports.comports()
    for port in ports:
        # Espressif vendor ID is usually 0x10C4 (Silicon Labs) or 0x303A (Espressif)
        if port.vid in (0x303A, 0x10C4):
            return port.device
    raise Exception("ESP32 serial port not found (by vendor ID).")


def resetBlumy():
    try:
        port = find_esp32_port()
    except:
        port = find_esp32_port()
    ser = serial.Serial(port, 115200)
    ser.setDTR(False)
    ser.setRTS(True)
    time.sleep(0.1)
    ser.setDTR(True)
    ser.setRTS(False)
    ser.close()
    print(f"ESP32 reset triggered via serial port: {port}")


if __name__ == "__main__":
    resetBlumy()
