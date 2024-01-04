import { networkState } from "../states";
import { getNetworks, Network } from "../api";
import { html } from "lit";
import { property, customElement, state } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("wifi-scanner-page")
export class WifiScannerPage extends BasePage {
    @property({ type: String }) onlineStatus: string;

    @state() errorText: string = "";
    @state() networks: Network[] = [];

    async updateNetworks() {
        const networks = await getNetworks();
        if (networks === undefined || networks === null) {
            this.errorText = "Fehler beim Scannen der Netzwerke";
            return;
        } else {
            this.errorText = "";
            this.networks = networks;
        }
    }

    interval = setInterval(() => {
        this.updateNetworks();
    }, 5000);

    constructor() {
        super();
        this.updateNetworks();
        this.addEventListener("page-destroy", () => {});
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        clearInterval(this.interval);
    }

    onNetworkClick(e: CustomEvent) {
        const network: Network = e.detail;
        networkState.state.network = network;
        this.next();
    }

    render() {
        return html`
            <title-element>Wähle WLAN aus</title-element>
            <description-element>Verfügbare WLANs</description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
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
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
