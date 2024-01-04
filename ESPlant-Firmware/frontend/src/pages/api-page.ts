import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BasePage } from "./base-page";
import "./page-elements/collapsible-element";
import "./page-elements/http-form-element";
import "./page-elements/mqtt-form-element";
import "./page-elements/cloud-form-element";
import { ApiConfiguration, setApiCredentials } from "../api";

@customElement("api-page")
export class ApiPage extends BasePage {
    @state() errorText: string = "";
    @state() apiConfig: ApiConfiguration;
    @state() openState: Record<ApiConfiguration['type'], boolean> = {
        'cloud': true,
        'http': false,
        'mqtt': false,
    }

    private async submit() {
        if (this.apiConfig == undefined) {
            this.errorText = 'Bitte konfiguriere mindestens eine Schnittstelle.';
            return;
        }

        const res = await setApiCredentials(this.apiConfig);
        if (!res.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        } else {
            this.next();
        }
    }

    private handleOpen(target: ApiConfiguration['type']) {
        this.openState = {
            'cloud': false,
            'http': false,
            'mqtt': false,
            [target]: true
        }
    }

    private handleConfigChange(event: CustomEvent<ApiConfiguration>) {
        this.apiConfig = event.detail;
    }

    render() {
        return html`
            <title-element>Schnittstellen-Konfiguration</title-element>
            <collapsible-element
                summary="Blumy Cloud"
                ?open=${this.openState['cloud']}
                @opened=${() => this.handleOpen('cloud')}
            >
                <cloud-form-element @input-config="${this.handleConfigChange}"></cloud-form-element>
            </collapsible-element>
            <collapsible-element
                summary="HTTP"
                ?open=${this.openState['http']}
                @opened=${() => this.handleOpen('http')}
            >
                <http-form-element @input-config="${this.handleConfigChange}"></http-form-element>
            </collapsible-element>
            <collapsible-element
                summary="MQTT"
                ?open=${this.openState['mqtt']}
                @opened=${() => this.handleOpen('mqtt')}
            >
                <mqtt-form-element @input-config="${this.handleConfigChange}"></mqtt-form-element>
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
                    ?disabled="${this.apiConfig == undefined}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
