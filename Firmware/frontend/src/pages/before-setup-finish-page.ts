import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { resetEsp } from "../api";
import { BasePage } from "./base-page";

@customElement("before-setup-finish-page")
export class BeforeSetupFinishPage extends BasePage {
    @state() errorText: string = "";

    async reset() {
        const res = await resetEsp();
        if (!res.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        } else {
            this.next();
        }
    }

    render() {
        return html`
            <title-element>Ende vom Setup</title-element>
            <description-element>
                Nach Abschluss der Konfiguration sendet der Sensor in
                regelmäßigen Abständen Daten an die konfigurierten Endpunkte.
                Deine Verbindung zum Sensor wird automatisch getrennt.
            </description-element>
            <text-element text="${this.errorText}"></text-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Konfiguration abschließen"
                    @click="${this.reset}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
