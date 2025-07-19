from typing import TypedDict, Literal
import requests
import time


class BlumyApi:
    blumy_api_url = "http://192.168.4.1/api"

    @staticmethod
    def dict_to_payload(data: dict[str, str]) -> str:
        """
        Converts a dictionary to a string with 'key=value' pairs separated by newlines.
        """
        return "\n".join(f"{k}={v}" for k, v in data.items()) + "\n"

    @staticmethod
    def post(endpoint: str, data):
        """
        Sends data as a POST request.
        If data is a dict, formats as 'key=value\n'. If string, sends as plain text.
        Returns the response body: dict if JSON, else string.
        Prints the request in a human readable format.
        """
        url = f"{BlumyApi.blumy_api_url}/{endpoint.lstrip('/')}"
        if isinstance(data, dict):
            payload = BlumyApi.dict_to_payload(data)
        else:
            payload = str(data)
        print(f"POST {url} {payload}")
        response = requests.post(url, data=payload)
        try:
            return response.json()
        except ValueError:
            return response.text

    @staticmethod
    def get(endpoint: str):
        """
        Sends a GET request to the specified endpoint.
        Returns the response body: dict if JSON, else string.
        Prints the request in a human readable format.
        """
        url = f"{BlumyApi.blumy_api_url}/{endpoint.lstrip('/')}"
        print(f"GET {url}")
        response = requests.get(url)
        try:
            return response.json()
        except ValueError:
            return response.text

    # /api/connect POST:ssid=string,password=string->OK:string
    @staticmethod
    def connect(ssid: str, password: str) -> Literal["OK"]:
        return BlumyApi.post("/connect", {"ssid": ssid, "password": password})

    # /api/reset POST:->OK:string
    @staticmethod
    def reset() -> Literal["OK"]:
        return BlumyApi.post("/reset", {})

    # /api/networks GET:->ssid:string,rssi:number,secure:number
    Networks = TypedDict("Networks", {"ssid": str, "rssi": int, "secure": int})

    @staticmethod
    def get_networks() -> list[Networks]:
        return BlumyApi.get("/networks")

    # /api/isConnected GET:->0|string OR 1|string
    @staticmethod
    def is_connected() -> Literal[0, 1]:
        return BlumyApi.get("/isConnected")

    # /api/cloudSetup/mqtt POST:sensorId=string,server=string,port=number,username=string,password=string,topic=string,clientId=string->OK:string
    @staticmethod
    def setup_mqtt(
        sensorId: str,
        server: str,
        port: int,
        username: str,
        password: str,
        topic: str,
        clientId: str,
    ) -> Literal["OK"]:
        return BlumyApi.post(
            "/cloudSetup/mqtt",
            {
                "sensorId": sensorId,
                "server": server,
                "port": str(port),
                "username": username,
                "password": password,
                "topic": topic,
                "clientId": clientId,
            },
        )

    # /api/cloudSetup/http POST:sensorId=string,url=string,auth=string->OK:string
    @staticmethod
    def setup_http(sensorId: str, url: str, auth: str) -> Literal["OK"]:
        return BlumyApi.post(
            "/cloudSetup/http", {"sensorId": sensorId, "url": url, "auth": auth}
        )

    # /api/cloudSetup/blumy POST:token=string,url=string->OK:string
    @staticmethod
    def setup_blumy(token: str, url: str) -> Literal["OK"]:
        return BlumyApi.post("/cloudSetup/blumy", {"token": token, "url": url})

    # /api/cloudSetup/mqtt GET:->sensorId:string,server:string,port:number,username:string,password:string,topic:string,clientId:string
    CloudSetupMqtt = TypedDict(
        "CloudSetupMqtt",
        {
            "sensorId": str,
            "server": str,
            "port": int,
            "username": str,
            "password": str,
            "topic": str,
            "clientId": str,
        },
    )

    @staticmethod
    def get_cloud_setup_mqtt() -> CloudSetupMqtt:
        return BlumyApi.get("/cloudSetup/mqtt")

    # /api/cloudSetup/http GET:->sensorId:string,url:string,auth:string
    CloudSetupHttp = TypedDict(
        "CloudSetupHttp", {"sensorId": str, "url": str, "auth": str}
    )

    @staticmethod
    def get_cloud_setup_http() -> CloudSetupHttp:
        return BlumyApi.get("/cloudSetup/http")

    # /api/cloudSetup/blumy GET:->token:string,url:string
    CloudSetupBlumy = TypedDict("CloudSetupBlumy", {"token": str, "url": str})

    @staticmethod
    def get_cloud_setup_blumy() -> CloudSetupBlumy:
        return BlumyApi.get("/cloudSetup/blumy")

    # /api/cloudTest/mqtt POST:sensorId=string,server=string,port=number,username=string,password=string,topic=string,clientId=string->true|string,false|string
    @staticmethod
    def test_mqtt(
        sensorId: str,
        server: str,
        port: int,
        username: str,
        password: str,
        topic: str,
        clientId: str,
    ) -> bool:
        return BlumyApi.post(
            "/cloudTest/mqtt",
            {
                "sensorId": sensorId,
                "server": server,
                "port": str(port),
                "username": username,
                "password": password,
                "topic": topic,
                "clientId": clientId,
            },
        )

    # /api/cloudTest/http POST:sensorId=string,url=string,auth=string->true|string,false|string
    @staticmethod
    def test_http(sensorId: str, url: str, auth: str) -> bool:
        return BlumyApi.post(
            "/cloudTest/http", {"sensorId": sensorId, "url": url, "auth": auth}
        )

    # /api/cloudTest/blumy POST:token=string,url=string->true|string,false|string
    @staticmethod
    def test_blumy(token: str, url: str) -> bool:
        return BlumyApi.post("/cloudTest/blumy", {"token": token, "url": url})

    # /api/cloudDisable/mqtt POST->OK:string
    @staticmethod
    def disable_mqtt() -> Literal["OK"]:
        return BlumyApi.post("/cloudDisable/mqtt", {})

    # /api/cloudDisable/http POST->OK:string
    @staticmethod
    def disable_http() -> Literal["OK"]:
        return BlumyApi.post("/cloudDisable/http", {})

    # /api/cloudDisable/blumy POST->OK:string
    @staticmethod
    def disable_blumy() -> Literal["OK"]:
        return BlumyApi.post("/cloudDisable/blumy", {})

    # /api/timeouts/sleep GET:value:uint64
    @staticmethod
    def get_sleep_timeout() -> int:
        return BlumyApi.get("/timeouts/sleep")

    # /api/timeouts/sleep POST:timoutString=string->OK:string
    @staticmethod
    def set_sleep_timeout(timeout: str) -> Literal["OK"]:
        return BlumyApi.post("/timeouts/sleep", timeout)

    # /api/timeouts/configurationMode GET:value:int32
    @staticmethod
    def get_configuration_mode_timeout() -> int:
        return BlumyApi.get("/timeouts/configurationMode")

    # /api/timeouts/configurationMode POST:timoutString=string->OK:string
    @staticmethod
    def set_configuration_mode_timeout(timeout: str) -> Literal["OK"]:
        return BlumyApi.post("/timeouts/configurationMode", timeout)

    # /api/timeouts/wdt GET:value:uint64
    @staticmethod
    def get_wdt_timeout() -> int:
        return BlumyApi.get("/timeouts/wdt")

    # /api/timeouts/wdt POST:timoutString=string->OK:string
    @staticmethod
    def set_wdt_timeout(timeout: str) -> Literal["OK"]:
        return BlumyApi.post("/timeouts/wdt", timeout)

    # /api/timeouts/mqtt/message GET:value:uint64
    @staticmethod
    def get_mqtt_message_timeout() -> int:
        return BlumyApi.get("/timeouts/mqtt/message")

    # /api/timeouts/mqtt/message POST:timoutString=string->OK:string
    @staticmethod
    def set_mqtt_message_timeout(timeout: str) -> Literal["OK"]:
        return BlumyApi.post("/timeouts/mqtt/message", timeout)

    # /api/led/brightness GET:value:uint8
    @staticmethod
    def get_led_brightness() -> int:
        return BlumyApi.get("/led/brightness")

    # /api/led/brightness POST:brightnessString=string->OK:string
    @staticmethod
    def set_led_brightness(brightness: str) -> Literal["OK"]:
        return BlumyApi.post("/led/brightness", brightness)

    # /api/update/percentage GET:value:float
    @staticmethod
    def get_update_percentage() -> float:
        return BlumyApi.get("/update/percentage")

    # /api/connectedNetwork GET:ssid:string,status:int,rssi:int
    ConnectedNetwork = TypedDict(
        "ConnectedNetwork", {"ssid": str, "status": int, "rssi": int}
    )

    @staticmethod
    def get_connected_network() -> ConnectedNetwork:
        return BlumyApi.get("/connectedNetwork")

    # /api/sensor/data GET:temperature:float,humidity:float,light:int,moisture:int,voltage:float
    SensorData = TypedDict(
        "SensorData",
        {
            "temperature": float,
            "humidity": float,
            "light": int,
            "moisture": int,
            "voltage": float,
        },
    )

    @staticmethod
    def get_sensor_data() -> SensorData:
        return BlumyApi.get("/sensor/data")

    # /api/factoryReset POST->OK:string
    @staticmethod
    def factory_reset() -> Literal["OK"]:
        return BlumyApi.post("/factoryReset", {})

    # /api/update/firmware GET:url:string
    FirmwareUpdate = TypedDict("FirmwareUpdate", {"url": str})

    @staticmethod
    def get_firmware_update_url() -> FirmwareUpdate:
        return BlumyApi.get("/update/firmware")

    # /api/update/firmware POST:url=string->OK:string
    @staticmethod
    def update_firmware(url: str) -> Literal["OK"]:
        return BlumyApi.post("/update/firmware", {"url": url})

    # /api/update/check POST:url=string->true|false:string
    @staticmethod
    def check_update(url: str) -> bool:
        return BlumyApi.post("/update/check", {"url": url})

    # /api/firmware/version GET:value:uint64
    @staticmethod
    def get_firmware_version() -> int:
        return BlumyApi.get("/firmware/version")

    # /api/plantnow/hasReceivedPeerMac GET:value:string
    @staticmethod
    def has_received_peer_mac() -> str:
        return BlumyApi.get("/plantnow/hasReceivedPeerMac")

    # /api/plantnow/sendCredentials POST->OK:string
    @staticmethod
    def send_credentials() -> Literal["OK"]:
        return BlumyApi.post("/plantnow/sendCredentials", {})

    @staticmethod
    def wait_for_connection(timeout: int = 30) -> bool:
        """
        Waits for a connection to the Blumy network.
        Returns True if connected, False if timeout occurs.
        """
        print(f"Waiting for connection with timeout {timeout} seconds")
        start_time = time.time()
        while time.time() - start_time < timeout:
            if BlumyApi.is_connected():
                return True
            time.sleep(1)
        return False
