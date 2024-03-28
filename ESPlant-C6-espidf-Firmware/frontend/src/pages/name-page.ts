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
        const sleepTimeout = await getSleepTimeout();
        if (sleepTimeout != null) {
            this.sleepTimeoutElement.input.value = `${sleepTimeout} ms`;
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
