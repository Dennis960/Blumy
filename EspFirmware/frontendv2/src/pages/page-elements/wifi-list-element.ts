import { Network } from "api";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wifi-list-element")
export class WifiListElement extends LitElement {
    @property({ type: Array }) wifis: Network[] = [];

    onClick(ssid: string) {
        this.dispatchEvent(new CustomEvent("networkClick", { detail: ssid }));
    }

    render() {
        return html`
            <ul>
                ${this.wifis.map(
                    (wifi) => html`
                        <li>
                            <button @click="${() => this.onClick(wifi.ssid)}">
                                <div class="wifi-icon"></div>
                                <span>${wifi.ssid}</span>
                                <span>${wifi.rssi}</span>
                            </button>
                            ${wifi.secure == 7 ? html`<span>🔒</span>` : html``}
                        </li>
                    `
                )}
            </ul>
        `;
    }
}
