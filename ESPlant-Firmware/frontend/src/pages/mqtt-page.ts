import { InputElement } from "./page-elements/input-element";
import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { setMqttCredentials } from "../api";
import { BasePage } from "./base-page";

@customElement("mqtt-page")
export class MqttPage extends BasePage {
    @query("#server") serverInput: InputElement;
    @query("#port") portInput: InputElement;
    @query("#user") userInput: InputElement;
    @query("#password") passwordInput: InputElement;
    @query("#topic") topicInput: InputElement;
    @query("#client-id") clientIdInput: InputElement;
    @state() errorText: string = "";

    async submit() {
        const res = await setMqttCredentials(
            this.serverInput.input.value,
            this.portInput.input.value,
            this.userInput.input.value,
            this.passwordInput.input.value,
            this.topicInput.input.value,
            this.clientIdInput.input.value
        );
        if (!res.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        } else {
            this.next();
        }
    }

    render() {
        return html`
            <title-element>MQTT-Konfiguration (optional)</title-element>
            <input-element-grid>
                <input-element
                    id="server"
                    type="text"
                    label="Server"
                ></input-element>
                <input-element
                    id="port"
                    type="number"
                    label="Port"
                ></input-element>
                <input-element
                    id="user"
                    type="text"
                    label="Nutzername"
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Passwort"
                ></input-element>
                <input-element
                    id="topic"
                    type="text"
                    label="Topic"
                ></input-element>
                <input-element
                    id="client-id"
                    type="text"
                    label="Client-ID"
                ></input-element>
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
