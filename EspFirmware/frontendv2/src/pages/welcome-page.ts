import { html } from "lit";
import { customElement } from "lit-element";
import { BasePage } from "./base-page";

@customElement("welcome-page")
export class WelcomePage extends BasePage {
    render() {
        return html`
            <title-element title="Welcome"></title-element>
            <description-element
                description="${`PlantFi is currently offline. Start the setup
                    to connect it to a WiFi network`}"
            ></description-element>
            <button-nav-element>
                <button-element
                    name="Skip Setup"
                    @click="${() => this.dispatchEvent(new CustomEvent("skip"))}"
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
