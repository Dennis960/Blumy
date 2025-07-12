import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
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

    @state() serverInputError = "";
    @state() serverInputTouched = false;
    @state() portInputError = "";
    @state() portInputTouched = false;

    private getPort() {
        let port = parseInt(this.portInput.input.value, 10);
        if (this.portInputTouched && (port < 0 || port > 65535)) {
            this.portInputError = "Port muss zwischen 1 und 65535 liegen.";
        } else {
            this.portInputError = "";
        }
        if (isNaN(port) || port === 0 || !port) {
            port = 1883;
        }
        return port.toString();
    }

    private getSensorId() {
        let sensorId = this.sensorInput.input.value.trim();
        if (!sensorId) {
            sensorId = "1";
        }
        return sensorId;
    }

    public getServerUrl() {
        let server = this.serverInput.input.value.trim();
        if (this.serverInputTouched && !server) {
            this.serverInputError = "Server URL darf nicht leer sein.";
        } else {
            this.serverInputError = "";
            if (
                !server.startsWith("mqtt://") &&
                !server.startsWith("mqtts://")
            ) {
                server = "mqtt://" + server;
            }
        }
        return server;
    }

    public getTopic() {
        let topic = this.topicInput.input.value.trim();
        if (!topic) {
            topic = `blumy_$_state`;
        }
        if (!topic.includes("$")) {
            topic = topic + "_$";
        }
        return topic;
    }

    public getConfig(): MqttCloudConfiguration {
        return {
            type: "mqtt",
            sensorId: this.getSensorId(),
            server: this.getServerUrl(),
            port: this.getPort(),
            username: this.userInput.input.value,
            password: this.passwordInput.input.value,
            topic: this.getTopic(),
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
                detail: this.getConfig(),
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
                    placeholder="1"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="server"
                    type="text"
                    label="Server URL"
                    placeholder="z.B. 192.168.2.1"
                    @input=${this.handleChange}
                    @blur=${() => (this.serverInputTouched = true)}
                ></input-element>
                <div
                    style="${styleMap({
                        gridColumn: "1 / -1",
                        display: this.serverInputError ? "block" : "none",
                        color: "var(--error)",
                        fontSize: "0.9em",
                        marginBottom: "4px",
                    })}"
                >
                    ${this.serverInputError}
                </div>
                <input-element
                    id="port"
                    type="number"
                    label="Port"
                    placeholder="1883"
                    @input=${this.handleChange}
                    @blur=${() => (this.portInputTouched = true)}
                ></input-element>
                <div
                    style="${styleMap({
                        gridColumn: "1 / -1",
                        display: this.portInputError ? "block" : "none",
                        color: "var(--error)",
                        fontSize: "0.9em",
                        marginBottom: "4px",
                    })}"
                >
                    ${this.portInputError}
                </div>
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
                    placeholder="blumy_$_state"
                    @input=${this.handleChange}
                ></input-element>
                <div
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.9em; margin-bottom: 4px;"
                >
                    Hinweis: Verwende <code>$</code> als Platzhalter für die
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
