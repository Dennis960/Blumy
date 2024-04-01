import { getSleepTimeout, setSleepTimeout } from "../api";
import { html } from "lit";
import { property, query, customElement, state } from "lit/decorators.js";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";
import timestring from "timestring";

@customElement("name-page")
export class NamePage extends BasePage {
    @property({ type: String }) onlineStatus: string;
    @query("#sleepTimeout") sleepTimeoutElement: InputElement;
    @state() errorText: string = "";

    humanizeDuration(durationMs: number): string {
        let durationString = "";
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        if (durationDays > 0) {
            durationString += durationDays + " d ";
        }
        const durationHours = Math.floor((durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        if (durationHours > 0) {
            durationString += durationHours + " h ";
        }
        const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
        if (durationMinutes > 0) {
            durationString += durationMinutes + " min ";
        }
        const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        if (durationSeconds > 0) {
            durationString += durationSeconds + " s ";
        }
        const durationMilliseconds = Math.floor(durationMs % 1000);
        if (durationMilliseconds > 0) {
            durationString += durationMilliseconds + " ms ";
        }
        return durationString.trim();
    }

    async submit() {
        let sleepTimeoutString = this.sleepTimeoutElement.input.value;
        if (sleepTimeoutString.length == 0) {
            // Default to 1 hour
            sleepTimeoutString = "1h";
            this.sleepTimeoutElement.input.value = sleepTimeoutString;
        }
        const sleepTimeout = timestring(sleepTimeoutString, "ms");
        const sleepTimeoutResponse = await setSleepTimeout(sleepTimeout);

        if (!sleepTimeoutResponse.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        }
        this.next();
    }

    async firstUpdated() {
        const sleepTimeout: number = await getSleepTimeout();
        if (sleepTimeout != null) {
            this.sleepTimeoutElement.input.value = this.humanizeDuration(sleepTimeout);
        }
    }

    render() {
        return html`
            <title-element>Sensor-Konfiguration</title-element>
            <input-element-grid>
                <input-element
                    id="sleepTimeout"
                    label="Messinterval"
                    initialValue="30 min"
                >
                </input-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Überspringen"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
                <button-element
                    name="Speichern"
                    @click="${this.submit}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
