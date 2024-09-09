import { StateController } from "@lit-app/state";
import { css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
    BlumyCloudConfiguration,
    CloudConfiguration,
    CloudConfigurationType,
    cloudConfigurationTypes,
    disableCloudConnection,
    getCloudCredentials,
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

type CloudConfigurationState = {
    open: boolean;
    configuration?: CloudConfiguration;
    message: {
        content: string;
        type: "error" | "success";
    };
    testMessage: {
        success: string;
        error: string;
    };
    formElement?: CloudFormElement | HttpFormElement | MqttFormElement;
};

@customElement("cloud-page")
export class CloudPage extends BasePage {
    @query("cloud-form-element") cloudFormElement!: CloudFormElement;
    @query("http-form-element") httpFormElement!: HttpFormElement;
    @query("mqtt-form-element") mqttFormElement!: MqttFormElement;

    @state() errorText: string = "";
    @state() configurationStates: Record<
        CloudConfigurationType,
        CloudConfigurationState
    > = {
        blumy: {
            open: false,
            message: { content: "", type: "error" },
            testMessage: {
                success: "Blumy Cloud verbunden",
                error: "Verbindung fehlgeschlagen",
            },
        },
        http: {
            open: false,
            message: { content: "", type: "error" },
            testMessage: {
                success: "HTTP verbunden",
                error: "Verbindung fehlgeschlagen",
            },
        },
        mqtt: {
            open: false,
            message: { content: "", type: "error" },
            testMessage: {
                success: "MQTT verbunden",
                error: "Verbindung fehlgeschlagen",
            },
        },
    };
    @state() configured: boolean = false;

    loadingStateController = new StateController(this, loadingState);

    private async submit() {
        let numberOfCorrectConfigurations = 0;
        let numberOfFailedConfigurations = 0;
        for (const key of cloudConfigurationTypes) {
            const configurationState = this.configurationStates[key];
            if (configurationState.open) {
                const apiConfig = configurationState.formElement!.getConfig();
                const testResult = await testCloudConnection(apiConfig);
                if (testResult) {
                    configurationState.message = {
                        content: configurationState.testMessage.success,
                        type: "success",
                    };
                } else {
                    configurationState.message = {
                        content: configurationState.testMessage.error,
                        type: "error",
                    };
                    this.configurationStates = { ...this.configurationStates };
                    await new Promise((resolve) => setTimeout(resolve, 10));
                    if (
                        window.confirm(
                            `Verbindungstest für ${key} fehlgeschlagen. Trotzdem speichern?`
                        )
                    ) {
                        numberOfCorrectConfigurations++;
                    } else {
                        numberOfFailedConfigurations++;
                        continue;
                    }
                }
                const res = await setCloudCredentials(apiConfig);
                if (!res.ok) {
                    this.errorText = "Fehler, Gerät antwortet nicht";
                    continue;
                }
                numberOfCorrectConfigurations++;
            } else {
                await disableCloudConnection(key);
            }
        }
        this.configurationStates = { ...this.configurationStates };
        if (numberOfCorrectConfigurations === 0) {
            this.errorText =
                "Bitte konfiguriere mindestens eine Schnittstelle.";
            return;
        }
        if (numberOfFailedConfigurations > 0) {
            this.errorText = "Es gab Fehler bei der Konfiguration.";
            return;
        }
        this.next();
    }

    private updateConfigured() {
        this.configured = Object.values(this.configurationStates).some(
            (value) =>
                value.open &&
                value.configuration &&
                Object.values(value.configuration).every((v) => !!v)
        );
        if (this.configured) {
            this.errorText = "";
        }
        this.configurationStates = { ...this.configurationStates };
    }

    private handleOpen(target: CloudConfigurationType) {
        this.configurationStates[target].open = true;
        this.updateConfigured();
    }

    private handleClose(target: CloudConfigurationType) {
        this.configurationStates[target].open = false;
        this.updateConfigured();
    }

    private handleChange(event: CustomEvent<CloudConfiguration>) {
        this.configurationStates[event.detail.type].configuration =
            event.detail;
        this.updateConfigured();
    }

    private async testConnection(
        key: CloudConfigurationType
    ): Promise<boolean> {
        this.errorText = "";
        let success = true;
        const configurationState = this.configurationStates[key];
        if (configurationState.open) {
            const res = await testCloudConnection(
                configurationState.formElement!.getConfig()
            );
            if (res) {
                configurationState.message = {
                    content: configurationState.testMessage.success,
                    type: "success",
                };
            } else {
                configurationState.message = {
                    content: configurationState.testMessage.error,
                    type: "error",
                };
                success = false;
            }
        }
        this.configurationStates = { ...this.configurationStates };
        return success;
    }

    async loadConfigFromQuery(queryParameters: URLSearchParams) {
        const token = queryParameters.get("token")!;
        const url = queryParameters.get("blumyUrl")!;
        queryParameters.delete("token");
        queryParameters.delete("blumyUrl");
        window.history.replaceState(
            null,
            "",
            `${location.pathname}?${queryParameters.toString()}`
        );
        const blumyConfiguration: BlumyCloudConfiguration = {
            type: "blumy",
            token: token,
            url: url,
        };
        this.configurationStates.blumy.formElement!.setConfig(
            blumyConfiguration as never
        );

        const connectionSuccess = await testCloudConnection(blumyConfiguration);

        if (connectionSuccess) {
            const res = await setCloudCredentials(blumyConfiguration);
            if (!res.ok) {
                this.errorText = "Fehler, Gerät antwortet nicht";
            } else {
                this.configurationStates.blumy.configuration =
                    blumyConfiguration;
                this.configurationStates.blumy.open = true;
                this.configurationStates.blumy.message = {
                    content: this.configurationStates.blumy.testMessage.success,
                    type: "success",
                };
            }
        } else {
            this.configurationStates.blumy.message = {
                content: this.configurationStates.blumy.testMessage.error,
                type: "error",
            };
        }
    }

    async firstUpdated() {
        this.configurationStates.blumy.formElement = this.cloudFormElement;
        this.configurationStates.http.formElement = this.httpFormElement;
        this.configurationStates.mqtt.formElement = this.mqttFormElement;
        for (const key of cloudConfigurationTypes) {
            const config = await getCloudCredentials(key);
            const configurationState = this.configurationStates[key];
            if (config) {
                configurationState.configuration = config;
                configurationState.formElement!.setConfig(config as never);
                configurationState.open = true;
            }
        }
        const queryParameters = new URLSearchParams(location.search);
        if (queryParameters.has("token") && queryParameters.has("blumyUrl")) {
            await this.loadConfigFromQuery(queryParameters);
        }
        this.configurationStates = { ...this.configurationStates };
        this.updateConfigured();
    }

    async handleExternalSetup() {
        location.href = `https://blumy.cloud/selector?redirect=${location.href}`;
    }
    static styles = [
        css`
            collapsible-element button-element {
                margin-left: auto;
            }
        `,
    ];

    render() {
        return html`
            <title-element
                >Automatische Schnittstellen-Konfiguration</title-element
            >
            <div style="width: fit-content; margin-bottom: 1.5rem;">
                <button-element
                    name="Über die Blumy Cloud einrichten"
                    @click="${() => this.handleExternalSetup()}"
                    ?disabled="${loadingState.state > 0}"
                    ?secondary="${true}"
                ></button-element>
            </div>
            <title-element>Manuelle Schnittstellen-Konfiguration</title-element>
            <collapsible-element
                summary="Blumy Cloud"
                ?open=${this.configurationStates["blumy"].open}
                @opened=${() => this.handleOpen("blumy")}
                @closed=${() => this.handleClose("blumy")}
            >
                <cloud-form-element
                    @input-config=${this.handleChange}
                ></cloud-form-element>
                ${this.configurationStates["blumy"].open
                    ? html`
                          <button-element
                              slot="summary"
                              name="Testen"
                              @click="${() => this.testConnection("blumy")}"
                              ?secondary="${true}"
                              ?disabled="${!this.configured ||
                              loadingState.state > 0}"
                          ></button-element>
                      `
                    : html``}
                <text-element
                    text="${this.configurationStates.blumy.message.content}"
                    color="${this.configurationStates.blumy.message.type}"
                />
            </collapsible-element>
            <collapsible-element
                summary="HTTP"
                ?open=${this.configurationStates["http"].open}
                @opened=${() => this.handleOpen("http")}
                @closed=${() => this.handleClose("http")}
            >
                <http-form-element
                    @input-config=${this.handleChange}
                ></http-form-element>
                ${this.configurationStates["http"].open
                    ? html`
                          <button-element
                              slot="summary"
                              name="Testen"
                              @click="${() => this.testConnection("http")}"
                              ?secondary="${true}"
                              ?disabled="${!this.configured ||
                              loadingState.state > 0}"
                          ></button-element>
                      `
                    : html``}
                <text-element
                    text="${this.configurationStates.http.message.content}"
                    color="${this.configurationStates.http.message.type}"
                />
            </collapsible-element>
            <collapsible-element
                summary="MQTT"
                ?open=${this.configurationStates["mqtt"].open}
                @opened=${() => this.handleOpen("mqtt")}
                @closed=${() => this.handleClose("mqtt")}
            >
                <mqtt-form-element
                    @input-config=${this.handleChange}
                ></mqtt-form-element>
                ${this.configurationStates["mqtt"].open
                    ? html`
                          <button-element
                              slot="summary"
                              name="Testen"
                              @click="${() => this.testConnection("mqtt")}"
                              ?secondary="${true}"
                              ?disabled="${!this.configured ||
                              loadingState.state > 0}"
                          ></button-element>
                      `
                    : html``}
                <text-element
                    text="${this.configurationStates.mqtt.message.content}"
                    color="${this.configurationStates.mqtt.message.type}"
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
                    name="Speichern"
                    @click="${this.submit}"
                    ?secondary="${true}"
                    ?disabled="${!this.configured || loadingState.state > 0}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
