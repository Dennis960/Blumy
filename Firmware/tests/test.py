from blumy_api import BlumyApi
from wifi import Wifi
from server_mock import MockServer
from blumy_usb import resetBlumy
import unittest
import time


class TestBlumy(unittest.TestCase):
    def test_blumy(self):
        """Test Blumy."""
        resetBlumy()
        # Factory reset Blumy
        connected = Wifi.connect_to_blumy(timeout=10)
        self.assertTrue(connected)
        BlumyApi.factory_reset()
        Wifi.disconnect_from_blumy()
        self.assertFalse(Wifi.is_connected(ssid="Blumy"))
        time.sleep(3)
        connected = Wifi.connect_to_blumy(timeout=10)
        self.assertTrue(connected)

        BlumyApi.connect(ssid="TestHotspot", password="test1234")
        Wifi.create_hotspot(ssid="TestHotspot", password="test1234")
        blumy_ip = Wifi.waitForHotspotClientConnected()
        original_blumy_api_url = BlumyApi.blumy_api_url
        BlumyApi.blumy_api_url = f"http://{blumy_ip}/api"
        time.sleep(2)  # Sleep to give urlib some time
        connected = BlumyApi.is_connected()
        self.assertEqual(connected, 0)  # 0 = CONNECTED

        # Test sending data from Blumy to the server
        server = MockServer()
        server.run()
        server.mock("/api/data")
        hotspot_ip = Wifi.get_hotspot_ip()
        self.assertRegex(hotspot_ip, r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}")

        url = f"http://{hotspot_ip}:4566/api/data"
        token = "test_token"
        result = BlumyApi.test_blumy(token, url)
        self.assertTrue(result)
        BlumyApi.setup_blumy(token, url)
        BlumyApi.set_sleep_timeout("1")
        BlumyApi.reset()
        for _ in range(10):
            if server.was_called("/api/data") > 2:
                break
            time.sleep(1)
        self.assertGreaterEqual(server.was_called("/api/data"), 2)
        Wifi.disable_hotspot()
        resetBlumy()
        connected = Wifi.connect_to_blumy(timeout=10)
        self.assertTrue(connected)
        BlumyApi.blumy_api_url = original_blumy_api_url
        BlumyApi.factory_reset()

        server.stop()
        Wifi.disable_hotspot()
        Wifi.disable_wifi()
        Wifi.enable_ethernet()


if __name__ == "__main__":
    unittest.main()
