import { html } from "lit";
import { customElement, query, state } from "lit-element";
import { setMqttCredentials } from "../states/api";
import { BasePage } from "./base-page";

@customElement("mqtt-page")
export class MqttPage extends BasePage {
    @query("#server") serverInput: HTMLInputElement;
    @query("#port") portInput: HTMLInputElement;
    @query("#user") userInput: HTMLInputElement;
    @query("#password") passwordInput: HTMLInputElement;
    @query("#topic") topicInput: HTMLInputElement;
    @query("#client-id") clientIdInput: HTMLInputElement;
    @state() errorText: string = "";

    async connect() {
        const res = await setMqttCredentials(
            this.serverInput.value,
            this.portInput.value,
            this.userInput.value,
            this.passwordInput.value
        );
        if (!res.ok) {
            this.errorText = "Error, device not responding";
            return;
        }
    }

    render() {
        return html`
            <title-element
                title="MQTT Configuration (optional)"
            ></title-element>
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
