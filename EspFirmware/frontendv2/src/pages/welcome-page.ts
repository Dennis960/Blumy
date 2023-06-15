import { html } from "lit";
import { css, customElement } from "lit-element";
import { networkState } from "../states/network-state";
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

    render() {
        return html`
            <title-element>Welcome</title-element>
            <description-element>
                PlantFi is currently
                <span class="${networkState.isConnected ? "green" : "red"}"
                    >${networkState.isConnected
                        ? "connected"
                        : "not connected"}</span
                >
                to the internet.
                ${networkState.isConnected && networkState.network?.ssid
                    ? html`
                          <br />
                          Connected to <b>${networkState.network.ssid}</b>.
                      `
                    : html``}
            </description-element>
            <button-nav-element>
                <button-element
                    name="Skip Setup"
                    @click="${() =>
                        this.dispatchEvent(new CustomEvent("skip"))}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Start Setup"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
