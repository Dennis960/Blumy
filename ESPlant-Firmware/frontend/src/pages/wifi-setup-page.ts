import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { connectToNetwork, isEspConnected, Network, WifiStatus } from "../api";
import { loadingState, networkState } from "../states";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

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
            this.errorText = "Fehler, Sensor antwortet nicht";
            return;
        }
        // wait 500 ms for the device to connect to the network
        await new Promise((resolve) => setTimeout(resolve, 500));
        for (let i = 0; i < 10; i++) {
            const wifiStatus = await isEspConnected();

            if (wifiStatus == WifiStatus.ERROR) {
                this.errorText = "Fehler, Sensor antwortet nicht";
            } else if (wifiStatus == WifiStatus.CONNECTED) {
                networkState.state.isConnected = true;
                if (
                    networkState.state.network?.ssid !=
                    this.ssidElement.input.value
                ) {
                    networkState.state.network = {
                        ssid: this.ssidElement.input.value,
                    } as Network;
                }
                this.next();
                return;
            } else if (wifiStatus == WifiStatus.FAIL) {
                this.errorText = "Konnte keine Verbindung zum WLAN herstellen";
            } else if (wifiStatus == WifiStatus.PASSWORD_WRONG) {
                this.errorText = "Falsches Passwort";
            } else if (wifiStatus == WifiStatus.DISCONNECTED) {
                this.errorText = "Sensor ist nicht verbunden";
            } else if (wifiStatus == WifiStatus.UNINITIALIZED) {
                this.errorText = "Sensor ist nicht initialisiert. Versuche ihn neu zu starten.";
            } else {
                loadingState.state++;;
                await new Promise((resolve) => setTimeout(resolve, 1000));
                loadingState.state--;
                continue;
            }
            return;
        }
        this.errorText = "Konnte keine Verbindung zum WLAN herstellen";
    }

    async painted() {
        if (networkState.state.network?.secure != 7) {
            this.passwordElement.input.focus();
        } else if (!networkState.state.isConnected) {
            this.connect();
        }
    }

    render() {
        return html`
            <title-element>WLAN-Zugangsdaten eingeben</title-element>
            <input-element-grid>
                <input-element
                    id="ssid"
                    type="text"
                    label="SSID"
                    initialValue="${networkState.state.network?.ssid}"
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Passwort"
                ></input-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Verbinden"
                    @click="${this.connect}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
