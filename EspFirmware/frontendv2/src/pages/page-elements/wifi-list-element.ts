import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Network } from "states/api";
import "./button-element";
import "./wifi-logo-element";
import "./loader-spinner-element";

@customElement("wifi-list-element")
export class WifiListElement extends LitElement {
    static styles = [
        css`
            :host {
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            ul {
                width: 100%;
                list-style-type: none;
                padding: 0;
                margin: 0;
                margin-bottom: 0.75rem;
            }
            li:not(:last-child) {
                margin-bottom: 0.5rem;
            }
        `,
    ];
    @property({ type: Array }) wifis: Network[] = [];

    onClick(network: Network) {
        this.dispatchEvent(
            new CustomEvent("networkClick", { detail: network })
        );
    }

    render() {
        return html`
            <ul>
                ${this.wifis
                    .sort((a, b) => b.rssi - a.rssi)
                    .map(
                        (wifi) => html`
                            <li>
                                <button-element
                                    @click="${() => this.onClick(wifi)}"
                                >
                                    <wifi-logo-element
                                        rssi="${wifi.rssi}"
                                        ?isSecure="${wifi.secure != 7}"
                                    ></wifi-logo-element>
                                    <span>${wifi.ssid}</span>
                                </button-element>
                            </li>
                        `
                    )}
            </ul>
            ${this.wifis.length === 0
                ? html` <loader-spinner-element></loader-spinner-element> `
                : html``}
        `;
    }
}
