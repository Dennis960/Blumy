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
                    name="Konfiguration abschließen"
                    @click="${this.reset}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
