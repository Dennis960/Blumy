import { Network } from "api";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("wifi-list-element")
export class WifiListElement extends LitElement {
    static styles = [
        css`
            ul {
                list-style-type: none;
                padding: 0;
                margin: 0;
                margin-bottom: 0.75rem;
            }
            button-element {
                width: 100%;
            }
        `,
    ];
    @property({ type: Array }) wifis: Network[] = [];

    onClick(ssid: string) {
        this.dispatchEvent(new CustomEvent("networkClick", { detail: ssid }));
    }

    render() {
        return html`
            <ul>
                ${this.wifis.sort((a,b) => b.rssi - a.rssi).map(
                    (wifi) => html`
                        <li>
                            <button-element
                                @click="${() => this.onClick(wifi.ssid)}"
                            >
                                <wifi-logo-element rssi="${wifi.rssi}" ?isSecure="${wifi.secure == 7}"></wifi-logo-element>
                                <span>${wifi.ssid}</span>
                                <span>${wifi.rssi}</span>
                            </button-element>
                        </li>
                    `
                )}
            </ul>
        `;
    }
}
