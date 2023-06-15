import { networkState } from "../states/network-state";
import { getNetworks, Network } from "../states/api";
import { html } from "lit";
import { customElement, state } from "lit-element";
import { property } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("wifi-scanner-page")
export class WifiScannerPage extends BasePage {
    @property({ type: String }) onlineStatus: string;

    @state() errorText: string = "";
    @state() networks: Network[] = [];

    async updateNetworks() {
        const networks = await getNetworks();
        if (networks === undefined || networks === null) {
            this.errorText = "Error getting networks";
            return;
        }
        this.networks = networks;
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
        networkState.network = network;
        this.next();
    }

    render() {
        return html`
            <title-element>Select WiFi Network</title-element>
            <description-element>Available WiFi Networks</description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <wifi-list-element
                .wifis="${this.networks}"
                @networkClick="${this.onNetworkClick}"
            ></wifi-list-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Enter Manually"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
