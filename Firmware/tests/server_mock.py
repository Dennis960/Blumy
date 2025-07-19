from http.server import BaseHTTPRequestHandler, HTTPServer
import threading
import json
from dataclasses import dataclass
from typing import Any


@dataclass
class EndpointResponse:
    response: dict[str, Any] | str | None = None
    code: int = 200


class MockHandler(BaseHTTPRequestHandler):
    endpoints: dict[str, EndpointResponse] = {}
    call_counts: dict[str, int] = {}

    def handle_request(self):
        print(f"SERVER_MOCK {self.command}: {self.client_address[0]} -> {self.path}")
        if self.path in MockHandler.endpoints:
            MockHandler.call_counts[self.path] = (
                MockHandler.call_counts.get(self.path, 0) + 1
            )
            endpoint_response = MockHandler.endpoints[self.path]
            self.send_response(endpoint_response.code)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            if endpoint_response.response is None:
                self.wfile.write(b"")
            elif isinstance(endpoint_response.response, dict):
                self.wfile.write(bytes(json.dumps(endpoint_response.response), "utf-8"))
            elif isinstance(endpoint_response.response, str):
                self.wfile.write(bytes(endpoint_response.response, "utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()


class MockServer:
    def __init__(
        self, server_class=HTTPServer, handler_class=MockHandler, port: int = 4566
    ):
        self.server_address = ("", port)
        self.httpd = server_class(self.server_address, handler_class)
        self.thread: threading.Thread = None

    def run(self):
        def serve():
            print(f"Starting server on port {self.server_address[1]}...")
            self.httpd.serve_forever()

        self.thread = threading.Thread(target=serve)
        self.thread.start()

    def stop(self):
        if self.httpd:
            self.httpd.shutdown()
        if self.thread:
            self.thread.join()
        print("Server stopped.")

    def mock(
        self,
        url: str,
        response: dict[str, Any] | str | None = None,
        code: int = 200,
    ):
        MockHandler.endpoints[url] = EndpointResponse(response=response, code=code)
        MockHandler.call_counts[url] = 0

    def was_called(self, url: str) -> int:
        return MockHandler.call_counts.get(url, 0)


if __name__ == "__main__":
    server = MockServer()
    server.mock("/api/data", {"message": "Hello from /api/data"}, code=200)
    server.mock("/api/error", {"error": "Not found"}, code=404)
    server.mock("/api/empty", None, code=204)
    server.mock("/api/string", "Just a string response", code=200)
    try:
        server.run()
    except KeyboardInterrupt:
        server.stop()
