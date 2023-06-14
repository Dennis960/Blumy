import { html } from "lit";
import { customElement } from "lit-element";
import { property } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("welcome-page")
export class WelcomePage extends BasePage {
    @property({ type: String }) onlineStatus: string;

    render() {
        return html`
            <title-element title="Welcome"></title-element>
            <description-element
                description="${`PlantFi is currently ${this.onlineStatus}. Start the setup
                    to connect it to a WiFi network`}"
            ></description-element>
            <button-nav-element>
                <button-element
                    name="Start Setup"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
