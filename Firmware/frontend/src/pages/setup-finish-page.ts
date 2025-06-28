import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BasePage } from "./base-page";

@customElement("setup-finish-page")
export class SetupFinishPage extends BasePage {
    render() {
        return html`
            <title-element>Fertig!</title-element>
            <description-element
                >Der Sensor wurde neugestartet. Du kannst diese Seite jetzt
                schließen.</description-element
            >
        `;
    }
}
