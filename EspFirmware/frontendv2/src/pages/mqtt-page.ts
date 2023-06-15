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

    async connect() {
        const res = await setMqttCredentials(
            this.serverInput.input.value,
            this.portInput.input.value,
            this.userInput.input.value,
            this.passwordInput.input.value
        );
        if (!res.ok) {
            this.errorText = "Error, device not responding";
            return;
        }
    }

    render() {
        return html`
            <title-element>MQTT Configuration (optional)</title-element>
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
                    label="User"
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Password"
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
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Skip"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.connect}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
