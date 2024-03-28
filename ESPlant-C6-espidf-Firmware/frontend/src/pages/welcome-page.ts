import { StateController } from "@lit-app/state";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getConnectedNetwork, isEspConnected, WifiStatus } from "../api";
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

    networkStateController = new StateController(this, networkState);

    shouldReadWifiStatus = true;

    constructor() {
        super();
        (async () => {
            while (this.shouldReadWifiStatus) {
                const wifiStatus = await isEspConnected();
                if (wifiStatus == WifiStatus.CONNECTED) {
                    const network = await getConnectedNetwork();
                    networkState.state = {
                        isConnected: true,
                        network: network,
                    };
                }
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        })();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shouldReadWifiStatus = false;
    }

    render() {
        return html`
            <title-element>Willkommen</title-element>
            <description-element>
                Blumy ist aktuell
                ${networkState.state.isConnected
                        ?  "mit dem Internet"
                        : "vom Internet"}
                <span
                    class="${networkState.state.isConnected ? "green" : "red"}"
                    >${networkState.state.isConnected
                        ? "verbunden"
                        : "getrennt"}</span
                >.
                ${networkState.state.isConnected &&
                networkState.state.network?.ssid
                    ? html`
                          <br />
                          Verbunden mit
                          <b>${networkState.state.network?.ssid}</b>.
                      `
                    : html``}
            </description-element>
            <button-nav-element>
                <button-element
                    name="Setup überspringen"
                    @click="${() =>
                        this.dispatchEvent(new CustomEvent("skip"))}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Setup beginnen"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
