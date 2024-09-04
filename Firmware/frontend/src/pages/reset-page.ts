import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { resetEsp } from "../api";
import { BasePage } from "./base-page";

@customElement("reset-page")
export class ResetPage extends BasePage {
    @state() errorText: string = "";

    async reset() {
        const res = await resetEsp();
        if (!res.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        }
    }

    render() {
        return html`
            <title-element>Reset</title-element>
            <description-element>
                Das Drücken des Neustart-Buttons versetzt das Gerät in den
                Sensor-Modus. Es wird sich zu dem konfigurierten WLAN verbinden
                und Daten entsprechend der Einstellungen versenden. Um das Gerät
                später erneut zu konfigurieren, drücke den Reset-Knopf auf dem
                Gerät.
            </description-element>
            <text-element text="${this.errorText}"></text-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Sensor-Modus"
                    @click="${() => this.next()}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Neustart"
                    @click="${this.reset}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
