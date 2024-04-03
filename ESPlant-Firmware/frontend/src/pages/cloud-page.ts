import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
    CloudConfiguration,
    getCloudCredentials,
    setCloudCredentials,
} from "../api";
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
    @state() configurationState: Record<
        CloudConfiguration["type"],
        { open: boolean; configuration?: CloudConfiguration }
    > = {
        cloud: { open: true },
        http: { open: false },
        mqtt: { open: false },
    };
    @state() configured: boolean = false;

    @query("cloud-form-element") cloudFormElement: CloudFormElement;
    @query("http-form-element") httpFormElement: HttpFormElement;
    @query("mqtt-form-element") mqttFormElement: MqttFormElement;

    private async submit() {
        const configuredStates = Object.entries(this.configurationState).filter(
            ([, value]) => value.open && value.configuration
        );
        if (configuredStates.length === 0) {
            this.errorText =
                "Bitte konfiguriere mindestens eine Schnittstelle.";
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

    render() {
        return html`
            <title-element>Schnittstellen-Konfiguration</title-element>
            <collapsible-element
                summary="Blumy Cloud"
                ?open=${this.configurationState["cloud"].open}
                @opened=${() => this.handleOpen("cloud")}
                @closed=${() => this.handleClose("cloud")}
                @handleChange=${() => this.handleChange}
            >
                <cloud-form-element></cloud-form-element>
            </collapsible-element>
            <collapsible-element
                summary="HTTP"
                ?open=${this.configurationState["http"].open}
                @opened=${() => this.handleOpen("http")}
                @closed=${() => this.handleClose("http")}
                @handleChange=${() => this.handleChange}
            >
                <http-form-element></http-form-element>
            </collapsible-element>
            <collapsible-element
                summary="MQTT"
                ?open=${this.configurationState["mqtt"].open}
                @opened=${() => this.handleOpen("mqtt")}
                @closed=${() => this.handleClose("mqtt")}
                @handleChange=${() => this.handleChange}
            >
                <mqtt-form-element></mqtt-form-element>
            </collapsible-element>
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
                    ?disabled="${!this.configured}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
