import { html } from "lit";
import { customElement } from "lit-element";
import { property } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("wifi-setup-page")
export class WifiSetupPage extends BasePage {
    @property({ type: String }) ssid: string;

    render() {
        return html`
            <title-element title="Enter WiFi Credentials"></title-element>
            <input-element
                type="text"
                label="SSID"
                value="${this.ssid}"
            ></input-element>
            <input-element type="password" label="Password"></input-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
