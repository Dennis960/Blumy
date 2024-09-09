import { StateController } from "@lit-app/state";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { WifiStatus, getConnectedNetwork, isConnected, resetEsp } from "../api";
import { networkState } from "../states";
import { BasePage } from "./base-page";

@customElement("welcome-page")
export class WelcomePage extends BasePage {
    static styles = [
        css`
            .green {
                color: var(--success);
            }
            .red {
                color: var(--error);
            }
        `,
    ];
    @state() errorText: string = "";

    networkStateController = new StateController(this, networkState);

    shouldReadWifiStatus = true;

    constructor() {
        super();
        this.checkWifiStatus();
    }

    async checkWifiStatus() {
        while (this.shouldReadWifiStatus) {
            const wifiStatus = await isConnected(false);
            if (wifiStatus == WifiStatus.CONNECTED) {
                const network = await getConnectedNetwork(false);
                networkState.state = {
                    isConnected: true,
                    network: {
                        rssi: network.rssi,
                        ssid: network.ssid,
                        secure: -1,
                    },
                };
            } else {
                networkState.state = {
                    isConnected: false,
                    network: undefined,
                };
            }
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shouldReadWifiStatus = false;
    }

    async exitConfiguration() {
        const res = await resetEsp();
        if (!res.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        } else {
            this.next(5);
        }
    }

    render() {
        return html`
            <title-element>Willkommen</title-element>
            <description-element>
                ${networkState.state
                    ? html`
                          ${networkState.state.isConnected
                              ? html` Blumy ist aktuell mit dem Internet
                                    <span class="green">verbunden</span>.`
                              : html`Blumy ist aktuell vom Internet
                                    <span class="red">getrennt</span>.`}
                          ${networkState.state.isConnected &&
                          networkState.state.network?.ssid
                              ? html`
                                    <br />
                                    Verbunden mit
                                    <b>${networkState.state.network.ssid}</b>.
                                `
                              : html``}
                      `
                    : html`<span>Verbindung wird überprüft</span>`}
            </description-element>
            <text-element text="${this.errorText}"></text-element>
            <button-nav-element>
                <button-element
                    name="Konfiguration beenden"
                    @click="${this.exitConfiguration}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Setup beginnen"
                    @click="${() => {
                        if (networkState.state?.isConnected) {
                            this.next(3);
                        } else {
                            this.next();
                        }
                    }}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
