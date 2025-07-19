import subprocess
import time
import re


class Wifi:
    @staticmethod
    def enable_wifi() -> None:
        print("Calling enable_wifi()")
        subprocess.run(["nmcli", "radio", "wifi", "on"], check=True)

    @staticmethod
    def disable_wifi() -> None:
        print("Calling disable_wifi()")
        subprocess.run(["nmcli", "radio", "wifi", "off"], check=True)

    @staticmethod
    def get_eth_interface() -> str:
        """Detect and return the name of the Ethernet interface."""
        try:
            output = subprocess.check_output(
                ["nmcli", "-t", "-f", "DEVICE,TYPE", "device"], text=True
            )
            for line in output.splitlines():
                device, dev_type = line.split(":")
                if dev_type == "ethernet":
                    return device
        except Exception:
            pass
        return "eth0"

    @staticmethod
    def is_eth_enabled() -> bool:
        """Check if the Ethernet interface is enabled."""
        interface = Wifi.get_eth_interface()
        print(f"Calling is_eth_enabled(interface={interface})")
        try:
            output = subprocess.check_output(
                ["nmcli", "-t", "-f", "DEVICE,STATE", "device", "status"],
                text=True,
            )
            for line in output.splitlines():
                device, state = line.split(":")
                if device == interface and state == "connected":
                    return True
        except subprocess.CalledProcessError:
            return False
        return False

    @staticmethod
    def enable_ethernet() -> None:
        if Wifi.is_eth_enabled():
            print("Ethernet is already enabled.")
            return
        interface = Wifi.get_eth_interface()
        print(f"Calling enable_ethernet(interface={interface})")
        subprocess.run(["nmcli", "device", "connect", interface], check=True)

    @staticmethod
    def disable_ethernet() -> None:
        if not Wifi.is_eth_enabled():
            print("Ethernet is already disabled.")
            return
        interface = Wifi.get_eth_interface()
        print(f"Calling disable_ethernet(interface={interface})")
        subprocess.run(["nmcli", "device", "disconnect", interface], check=True)

    @staticmethod
    def connect(ssid: str, password: str | None = None) -> None:
        print(f"Calling connect(ssid={ssid}, password={'***' if password else None})")
        cmd = ["nmcli", "device", "wifi", "connect", ssid]
        if password:
            cmd += ["password", password]
        subprocess.run(cmd, check=True)

    @staticmethod
    def waitUntilSSID(ssid: str, timeout: int = 30) -> bool:
        print(f"Calling waitUntilSSID(ssid={ssid}, timeout={timeout})")
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                output = subprocess.check_output(
                    ["nmcli", "-t", "-f", "ssid", "device", "wifi"],
                    text=True,
                )
                if ssid in output.splitlines():
                    return True
            except subprocess.CalledProcessError:
                pass
            time.sleep(1)
        return False

    @staticmethod
    def is_connected(ssid: str) -> bool:
        print(f"Calling is_connected(ssid={ssid})")
        try:
            output = subprocess.check_output(
                ["nmcli", "-t", "-f", "active,ssid", "device", "wifi"], text=True
            )
            return any(
                line.startswith("yes:") and line.split(":")[1] == ssid
                for line in output.splitlines()
            )
        except subprocess.CalledProcessError:
            return False

    @staticmethod
    def wait_for_connection(ssid: str, timeout: int = 30) -> bool:
        print(f"Calling wait_for_connection(ssid={ssid}, timeout={timeout})")
        start_time = time.time()
        while time.time() - start_time < timeout:
            if Wifi.is_connected(ssid):
                return True
            time.sleep(1)
        return False

    @staticmethod
    def get_wifi_interface() -> str:
        """Detect and return the name of the Wi-Fi interface."""
        try:
            output = subprocess.check_output(
                ["nmcli", "-t", "-f", "DEVICE,TYPE", "device"], text=True
            )
            for line in output.splitlines():
                device, dev_type = line.split(":")
                if dev_type == "wifi":
                    return device
        except Exception:
            pass
        return "wlan0"

    @staticmethod
    def create_hotspot(ssid: str, password: str) -> None:
        interface = Wifi.get_wifi_interface()
        print(
            f"Calling create_hotspot(ssid={ssid}, password=***, interface={interface})"
        )
        subprocess.run(
            [
                "nmcli",
                "device",
                "wifi",
                "hotspot",
                "ifname",
                interface,
                "ssid",
                ssid,
                "password",
                password,
            ],
            check=True,
        )

    @staticmethod
    def get_hotspot_ip():
        try:
            result = subprocess.run(
                ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE", "device"],
                capture_output=True,
                text=True,
                check=True,
            )

            interfaces = result.stdout.strip().split("\n")

            hotspot_iface = None

            for line in interfaces:
                device, dev_type, state = line.strip().split(":")
                if dev_type == "wifi" and state == "connected":
                    hotspot_iface = device
                    break

            if not hotspot_iface:
                return None

            # Get IP address of the interface
            ip_result = subprocess.run(
                ["nmcli", "-g", "IP4.ADDRESS", "device", "show", hotspot_iface],
                capture_output=True,
                text=True,
                check=True,
            )

            # Extract just the IP address part
            ip_line = ip_result.stdout.strip()
            match = re.match(r"(\d+\.\d+\.\d+\.\d+)", ip_line)
            return match.group(1) if match else None

        except subprocess.CalledProcessError as e:
            print("Error running nmcli:", e)
            return None

    @staticmethod
    def is_hotspot_enabled() -> bool:
        interface = Wifi.get_wifi_interface()
        print(f"Calling is_hotspot_enabled(interface={interface})")
        try:
            output = subprocess.check_output(
                ["nmcli", "-t", "-f", "DEVICE,TYPE,STATE", "device"],
                text=True,
            )
            for line in output.splitlines():
                device, dev_type, state = line.split(":")
                if device == interface and dev_type == "wifi" and state == "connected":
                    return True
        except subprocess.CalledProcessError:
            return False
        return False

    @staticmethod
    def disable_hotspot() -> None:
        if not Wifi.is_hotspot_enabled():
            print("Hotspot is already disabled.")
            return
        interface = Wifi.get_wifi_interface()
        print(f"Calling disable_hotspot(interface={interface})")
        subprocess.run(
            ["nmcli", "device", "disconnect", interface],
            check=True,
        )

    @staticmethod
    def waitForHotspotClientConnected(timeout: int = 30) -> str:
        print(f"Calling waitForHotspotClientConnected(timeout={timeout})")

        start_time = time.time()
        hotspot_iface = Wifi.get_wifi_interface()

        while time.time() - start_time < timeout:
            try:
                # Get list of connected clients using arp table
                arp_output = subprocess.check_output(["arp", "-n"], text=True)
                for line in arp_output.splitlines():
                    if hotspot_iface in line:
                        parts = line.split()
                        if len(parts) >= 2:
                            ip_addr = parts[0]
                            # Return the first IP found for the hotspot interface
                            return ip_addr
            except Exception:
                pass
            time.sleep(1)
        return ""

    @staticmethod
    def connect_to_blumy(timeout: int) -> bool:
        print("Calling connect_to_blumy()")
        """Connect to the Blumy network. Returns True if successful, False otherwise."""
        Wifi.disable_ethernet()
        Wifi.disable_hotspot()
        Wifi.enable_wifi()
        Wifi.waitUntilSSID("Blumy")
        Wifi.connect(ssid="Blumy")
        return Wifi.wait_for_connection(ssid="Blumy", timeout=timeout)

    @staticmethod
    def disconnect_from_blumy() -> None:
        interface = Wifi.get_wifi_interface()
        print("Calling disconnect_from_blumy()")
        """Disconnect from the Blumy network."""
        if Wifi.is_connected(ssid="Blumy"):
            subprocess.run(["nmcli", "device", "disconnect", interface], check=True)
        Wifi.disable_wifi()
        Wifi.enable_ethernet()


if __name__ == "__main__":
    # Example usage
    Wifi.disable_ethernet()
    Wifi.enable_wifi()
    Wifi.create_hotspot(ssid="TestHotspot", password="test1234")
    print(Wifi.get_hotspot_ip())
    # time.sleep(10)  # Keep the hotspot active for a while
    # Wifi.disable_hotspot()
