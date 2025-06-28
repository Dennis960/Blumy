import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { BasePage } from "./base-page";
import { factoryResetEsp } from "../api";

@customElement("reset-page")
export class ResetPage extends BasePage {
    async factoryReset() {
        if (
            window.confirm(
                "Bist du sicher, dass du den Sensor auf Werkseinstellungen zurücksetzen möchtest?"
            )
        ) {
            await factoryResetEsp();
        }
    }

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            row-gap: 1rem;
        }
    `;

    render() {
        return html`
            <button-element
                name="Sensor neustarten"
                @click="${this.factoryReset}"
                ?secondary="${false}"
            ></button-element>
            <span>
                Dadurch wird der Sensor neu gestartet. Die aktuelle Verbindung
                wird getrennt. Du kannst die Seite danach schließen.
            </span>
            <div></div>
            <button-element
                name="Alle Einstellungen zurücksetzen"
                @click="${this.factoryReset}"
                ?secondary="${false}"
            ></button-element>
            <text-element
                text="Nach dem Zurücksetzen werden alle Einstellungen auf die Werkseinstellungen zurückgesetzt. Das Gerät wird neu gestartet. Und muss neu konfiguriert werden."
            ></text-element>
        `;
    }
}
