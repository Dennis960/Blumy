import { StateController } from "@lit-app/state";
import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
    BlumyCloudConfiguration,
    CloudConfiguration,
    getCloudCredentials,
    HttpCloudConfiguration,
    MqttCloudConfiguration,
    setCloudCredentials,
    testCloudConnection,
} from "../api";
import { loadingState } from "../states";
import { BasePage } from "./base-page";
import "./page-elements/cloud-form-element";
import { CloudFormElement } from "./page-elements/cloud-form-element";
import "./page-elements/collapsible-element";
import "./page-elements/http-form-element";
import { HttpFormElement } from "./page-elements/http-form-element";
import "./page-elements/mqtt-form-element";
import { MqttFormElement } from "./page-elements/mqtt-form-element";

@customElement("cloud-page")
export class CloudPage extends BasePage {
    @state() errorText: string = "";
    @state() configurationState: {
        cloud: {
            open: boolean;
            configuration?: BlumyCloudConfiguration;
        };
        http: {
            open: boolean;
            configuration?: HttpCloudConfiguration;
        };
        mqtt: {
            open: boolean;
            configuration?: MqttCloudConfiguration;
        };
    } = {
        cloud: { open: true },
        http: { open: false },
        mqtt: { open: false },
    };
    @state() configured: boolean = false;
    @state() configurationMessages: Record<
        CloudConfiguration["type"],
        { message: string; type: "error" | "success" }
    > = {
        cloud: { message: "", type: "error" },
        http: { message: "", type: "error" },
        mqtt: { message: "", type: "error" },
    };

    @query("cloud-form-element") cloudFormElement!: CloudFormElement;
    @query("http-form-element") httpFormElement!: HttpFormElement;
    @query("mqtt-form-element") mqttFormElement!: MqttFormElement;

    loadingStateController = new StateController(this, loadingState);

    private async submit() {
        const configuredStates = Object.entries(this.configurationState).filter(
            ([, value]) => value.open && value.configuration
        );
        if (configuredStates.length === 0) {
            this.errorText =
                "Bitte konfiguriere mindestens eine Schnittstelle.";
            return;
        }
        if (!(await this.testConnections())) {
            this.errorText = "Verbindungstest fehlgeschlagen";
            return;
        }
        configuredStates.forEach(async ([key]) => {
            if (key == "cloud") {
                const apiConfig = this.cloudFormElement.getConfig();
                const res = await setCloudCredentials(apiConfig);
                if (!res.ok) {
                    this.errorText = "Fehler, Gerät antwortet nicht";
                    return;
                }
            } else if (key == "http") {
                const apiConfig = this.httpFormElement.getConfig();
                const res = await setCloudCredentials(apiConfig);
                if (!res.ok) {
                    this.errorText = "Fehler, Gerät antwortet nicht";
                    return;
                }
            } else if (key == "mqtt") {
                const apiConfig = this.mqttFormElement.getConfig();
                const res = await setCloudCredentials(apiConfig);
                if (!res.ok) {
                    this.errorText = "Fehler, Gerät antwortet nicht";
                    return;
                }
            }
        });
        this.next();
    }

    private updateConfigured() {
        this.configured = Object.values(this.configurationState).some(
            (value) =>
                value.open &&
                value.configuration &&
                Object.values(value.configuration).every((v) => !!v)
        );
        if (this.configured) {
            this.errorText = "";
        }
    }

    private handleOpen(target: CloudConfiguration["type"]) {
        this.configurationState[target].open = true;
        this.updateConfigured();
    }

    private handleClose(target: CloudConfiguration["type"]) {
        this.configurationState[target].open = false;
        this.updateConfigured();
    }

    private handleChange(event: CustomEvent<CloudConfiguration>) {
        this.configurationState[event.detail.type].configuration = event.detail;
        this.updateConfigured();
    }

    private async testConnections(): Promise<boolean> {
        let success = true;
        if (this.configurationState.cloud.open) {
            const res = await testCloudConnection(
                this.cloudFormElement.getConfig()
            );
            if (res) {
                this.configurationMessages.cloud = {
                    message: "Blumy Cloud verbunden",
                    type: "success",
                };
            } else {
                this.configurationMessages.cloud = {
                    message: "Verbindung fehlgeschlagen",
                    type: "error",
                };
                success = false;
            }
        }
        if (this.configurationState.http.open) {
            const res = await testCloudConnection(
                this.httpFormElement.getConfig()
            );
            if (res) {
                this.configurationMessages.http = {
                    message: "HTTP verbunden",
                    type: "success",
                };
            } else {
                this.configurationMessages.http = {
                    message: "Verbindung fehlgeschlagen",
                    type: "error",
                };
                success = false;
            }
        }
        if (this.configurationState.mqtt.open) {
            const res = await testCloudConnection(
                this.mqttFormElement.getConfig()
            );
            if (res) {
                this.configurationMessages.mqtt = {
                    message: "MQTT verbunden",
                    type: "success",
                };
            } else {
                this.configurationMessages.mqtt = {
                    message: "Verbindung fehlgeschlagen",
                    type: "error",
                };
                success = false;
            }
        }
        this.configurationState = { ...this.configurationState };
        return success;
    }

    async firstUpdated() {
        const cloudCredentials = await getCloudCredentials("cloud");
        if (cloudCredentials) {
            this.configurationState["cloud"].configuration = cloudCredentials;
            this.cloudFormElement.setConfig(cloudCredentials);
        }
        this.cloudFormElement.tokenInput.input.focus();
        const httpCredentials = await getCloudCredentials("http");
        if (httpCredentials) {
            this.configurationState["http"].configuration = httpCredentials;
            this.httpFormElement.setConfig(httpCredentials);
        }
        const mqttCredentials = await getCloudCredentials("mqtt");
        if (mqttCredentials) {
            this.configurationState["mqtt"].configuration = mqttCredentials;
            this.mqttFormElement.setConfig(mqttCredentials);
        }
        this.updateConfigured();
    }

    async handleExternalSetup() {
        const originHttps = location.origin.replace("http", "https");
        location.href = `https://blumy.cloud/selector?redirect=${location.origin}/?page=5&apiUrl=${originHttps}/api/cloudSetup/blumy`;
    }

    render() {
        return html`
            <title-element
                >Automatische Schnittstellen-Konfiguration</title-element
            >
            <button-element
                name="Über die Blumy Cloud einrichten"
                @click="${() => this.handleExternalSetup()}"
                ?disabled="${loadingState.state > 0}"
                ?secondary="${true}"
            ></button-element>
            <br />
            <title-element>Manuelle Schnittstellen-Konfiguration</title-element>
            <collapsible-element
                summary="Blumy Cloud"
                ?open=${this.configurationState["cloud"].open}
                @opened=${() => this.handleOpen("cloud")}
                @closed=${() => this.handleClose("cloud")}
            >
                <cloud-form-element
                    @input-config=${this.handleChange}
                ></cloud-form-element>
                <text-element
                    text="${this.configurationMessages.cloud.message}"
                    color="${this.configurationMessages.cloud.type}"
                />
            </collapsible-element>
            <collapsible-element
                summary="HTTP"
                ?open=${this.configurationState["http"].open}
                @opened=${() => this.handleOpen("http")}
                @closed=${() => this.handleClose("http")}
            >
                <http-form-element
                    @input-config=${this.handleChange}
                ></http-form-element>
                <text-element
                    text="${this.configurationMessages.http.message}"
                    color="${this.configurationMessages.http.type}"
                />
            </collapsible-element>
            <collapsible-element
                summary="MQTT"
                ?open=${this.configurationState["mqtt"].open}
                @opened=${() => this.handleOpen("mqtt")}
                @closed=${() => this.handleClose("mqtt")}
            >
                <mqtt-form-element
                    @input-config=${this.handleChange}
                ></mqtt-form-element>
                <text-element
                    text="${this.configurationMessages.mqtt.message}"
                    color="${this.configurationMessages.mqtt.type}"
                />
            </collapsible-element>
            <text-element text="${this.errorText}"></text-element>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                    ?disabled="${loadingState.state > 0}"
                ></button-element>
                <button-element
                    name="Überspringen"
                    @click="${() => this.next()}"
                    ?secondary="${true}"
                    ?disabled="${loadingState.state > 0}"
                ></button-element>
                <button-element
                    name="Speichern"
                    @click="${this.submit}"
                    ?secondary="${true}"
                    ?disabled="${!this.configured || loadingState.state > 0}"
                ></button-element>
                <button-element
                    name="Testen"
                    @click="${this.testConnections}"
                    ?secondary="${true}"
                    ?disabled="${!this.configured || loadingState.state > 0}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
