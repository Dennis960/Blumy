import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getNetworks, Network } from "../api";
import { networkState } from "../states";
import { BasePage } from "./base-page";

@customElement("wifi-scanner-page")
export class WifiScannerPage extends BasePage {
    @state() errorText: string = "";
    @state() networks: Network[] = [];

    shouldUpdateNetworks = true;

    async updateNetworks() {
        while (this.shouldUpdateNetworks) {
            const networks = await getNetworks();
            if (networks === undefined || networks === null) {
                this.errorText = "Fehler beim Scannen der Netzwerke";
                return;
            } else {
                this.errorText = "";
                this.networks = networks;
            }
            await new Promise((res) => setTimeout(res, 5000));
        }
    }

    constructor() {
        super();
        this.updateNetworks();
        this.addEventListener("page-destroy", () => {});
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        this.shouldUpdateNetworks = false;
    }

    onNetworkClick(e: CustomEvent) {
        const network: Network = e.detail;
        networkState.state = {
            isConnected: false,
            network: network,
        };
        this.next();
    }

    render() {
        return html`
            <title-element>Wähle WLAN aus</title-element>
            <description-element>Verfügbare WLANs</description-element>
            <text-element text="${this.errorText}"></text-element>
            <wifi-list-element
                .wifis="${this.networks}"
                @networkClick="${this.onNetworkClick}"
            ></wifi-list-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Manuelle Eingabe"
                    @click="${() => this.next()}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
