import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("wifi-logo-element")
export class WifiLogoElement extends LitElement {
    @property({ type: Number }) rssi: number;
    @property({ type: Boolean }) isSecure: boolean;

    get strength() {
        const rssiClamped = Math.max(-100, Math.min(this.rssi, -30));
        const rssiFraction = (rssiClamped + 100) / 70;
        return Math.floor(rssiFraction * 4);
    }

    static styles = [
        css`
            :host {
                position: relative;
                transform: translateY(25%);
            }
            div {
                border: 2px solid transparent;
                border-top-color: var(--grey);
                border-radius: 50%;
                margin: 1px;
            }
            div.active {
                border-top-color: var(--text);
            }
            .lock {
                position: absolute;
                right: 0;
                bottom: 0.5rem;
                font-size: 0.5rem;
            }
            .hidden {
                display: none;
            }
        `,
    ];

    render() {
        return html`
            <div class="${classMap({ active: this.strength >= 3 })}">
                <div class="${classMap({ active: this.strength >= 2 })}">
                    <div class="${classMap({ active: this.strength >= 1 })}">
                        <div
                            class="${classMap({ active: this.strength >= 0 })}"
                        ></div>
                    </div>
                </div>
            </div>
            <span class="${classMap({ hidden: !this.isSecure, lock: true })}">
                🔒
            </span>
        `;
    }
}
