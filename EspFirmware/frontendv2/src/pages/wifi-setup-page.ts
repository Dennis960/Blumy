import { InputElement } from './page-elements/input-element';
import { html } from "lit";
import { customElement, query } from "lit-element";
import { state } from "lit/decorators.js";
import { connectToNetwork, isEspConnected, WifiStatus } from "../states/api";
import { networkState } from "../states/network-state";
import { BasePage } from "./base-page";

@customElement("wifi-setup-page")
export class WifiSetupPage extends BasePage {
    @query("#ssid") ssidElement: InputElement;
    @query("#password") passwordElement: InputElement;

    @state() errorText: string = "";

    async connect() {
        this.errorText = "";
        const res = await connectToNetwork(
            this.ssidElement.input.value,
            this.passwordElement.input.value
        );
        if (!res.ok) {
            this.errorText = "Error, device not responding";
            return;
        }
        for (let i = 0; i < 10; i++) {
            const wifiStatus = await isEspConnected();

            if (wifiStatus == WifiStatus.ERROR) {
                this.errorText = "Error, device not responding";
            } else if (wifiStatus == WifiStatus.CONNECTED) {
                this.next();
            } else if (wifiStatus == WifiStatus.CONNECT_FAILED) {
                this.errorText = "Could not connect to WiFi";
            } else if (wifiStatus == WifiStatus.CONNECT_WRONG_PASSWORD) {
                this.errorText = "Wrong password";
            } else if (wifiStatus == WifiStatus.DISCONNECTED) {
                this.errorText = "The WiFi module is not connected, try resetting the device";
            } else if (wifiStatus == WifiStatus.NO_SSID_AVAIL) {
                this.errorText = "The specified SSID cannot be reached";
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
                continue;
            }
            return;
        }
    }

    firstUpdated() {
        if (networkState.network?.secure == 7) {
            this.connect();
        }
    }

    render() {
        return html`
            <title-element title="Enter WiFi Credentials"></title-element>
            <input-element-grid>
                <input-element
                    id="ssid"
                    type="text"
                    label="SSID"
                    initialValue="${networkState.network?.ssid}"
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Password"
                ></input-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.connect}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
