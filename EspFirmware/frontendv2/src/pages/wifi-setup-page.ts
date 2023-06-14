import { html } from "lit";
import { customElement, query } from "lit";
import { property, state } from "lit/decorators.js";
import { connectToNetwork, isEspConnected, WifiStatus } from "../api";
import { BasePage } from "./base-page";

@customElement("wifi-setup-page")
export class WifiSetupPage extends BasePage {
    @property({ type: String }) ssid: string;
    @property({ type: Boolean }) autoConnect: boolean;

    @query("#ssid") ssidElement: HTMLInputElement;
    @query("#password") passwordElement: HTMLInputElement;

    @state() errorText: string = "";

    async connect() {
        this.errorText = "";
        const res = await connectToNetwork(
            this.ssidElement.value,
            this.passwordElement.value
        );
        if (!res.ok) {
            this.errorText = "Error, device not responding";
            return;
        }
        for (let i = 0; i < 10; i++) {
            const wifiStatus = await isEspConnected();

            if (wifiStatus == WifiStatus.ERROR) {
                this.errorText = "Error, device not responding";
                return;
            }
            if (wifiStatus == WifiStatus.CONNECTED) {
                this.next();
                return;
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        this.errorText = "Could not connect to WiFi";
    }

    constructor() {
        super();
        if (this.autoConnect) {
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
                    value="${this.ssid}"
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
