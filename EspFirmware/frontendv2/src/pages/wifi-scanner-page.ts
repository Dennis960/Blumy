import { getNetworks, Network } from "../api";
import { html } from "lit";
import { customElement, state } from "lit-element";
import { property } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("wifi-scanner-page")
export class WifiScannerPage extends BasePage {
    @property({ type: String }) onlineStatus: string;

    @state() errorText: string = "";
    @state() networks: Network[] = [];

    constructor() {
        super();
        (async () => {
            const networks = await getNetworks();
            if (networks === undefined || networks === null) {
                this.errorText = "Error getting networks";
                return;
            }
            this.networks = networks;
        })();
    }

    onNetworkClick(e: CustomEvent) {
        const ssid = e.detail;
        this.next({ssid: ssid});
    }

    render() {
        return html`
            <title-element title="Select WiFi Network"></title-element>
            <description-element
                description="Available WiFi Networks:"
            ></description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <wifi-list-element .wifis="${this.networks}" @networkClick="${this.onNetworkClick}"></wifi-list-element>
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
