import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { MqttCloudConfiguration } from "../../api";
import { InputElement } from "./input-element";

@customElement("mqtt-form-element")
export class MqttFormElement extends LitElement {
    @query("#sensorId") sensorInput!: InputElement;
    @query("#server") serverInput!: InputElement;
    @query("#port") portInput!: InputElement;
    @query("#user") userInput!: InputElement;
    @query("#password") passwordInput!: InputElement;
    @query("#topic") topicInput!: InputElement;
    @query("#client-id") clientIdInput!: InputElement;

    public getConfig(): MqttCloudConfiguration {
        return {
            type: "mqtt",
            sensorId: this.sensorInput.input.value,
            server: this.serverInput.input.value,
            port: this.portInput.input.value,
            username: this.userInput.input.value,
            password: this.passwordInput.input.value,
            topic: this.topicInput.input.value,
            clientId: this.clientIdInput.input.value,
        };
    }

    public setConfig(config: MqttCloudConfiguration) {
        this.sensorInput.input.value = config.sensorId;
        this.serverInput.input.value = config.server;
        this.portInput.input.value = config.port;
        this.userInput.input.value = config.username;
        this.passwordInput.input.value = config.password;
        this.topicInput.input.value = config.topic;
        this.clientIdInput.input.value = config.clientId;
    }

    private handleChange() {
        this.dispatchEvent(
            new CustomEvent<MqttCloudConfiguration>("input-config", {
                detail: {
                    type: "mqtt",
                    sensorId: this.sensorInput.input.value,
                    server: this.serverInput.input.value,
                    port: this.portInput.input.value,
                    username: this.userInput.input.value,
                    password: this.passwordInput.input.value,
                    topic: this.topicInput.input.value,
                    clientId: this.clientIdInput.input.value,
                },
            })
        );
    }

    render() {
        return html`
            <input-element-grid>
                <input-element
                    id="sensorId"
                    type="text"
                    label="Sensor Id"
                    placeholder="z.B. sensor1234"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="server"
                    type="text"
                    label="Server URL"
                    placeholder="z.B. mqtt://192.168.2.1"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="port"
                    type="number"
                    label="Port"
                    placeholder="z.B. 1883"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="user"
                    type="text"
                    label="Nutzername"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="password"
                    type="password"
                    label="Passwort"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="topic"
                    type="text"
                    label="Topic"
                    placeholder="z.B. blumy_%s_state"
                    @input=${this.handleChange}
                ></input-element>
                <div
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.9em; margin-bottom: 4px;"
                >
                    Hinweis: Verwende <code>%s</code> als Platzhalter für die
                    Sensor Id.
                </div>
                <input-element
                    id="client-id"
                    type="text"
                    label="Client-ID"
                    @input=${this.handleChange}
                ></input-element>
            </input-element-grid>
        `;
    }
}
