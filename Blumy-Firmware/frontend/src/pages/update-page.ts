import { css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import {
    checkUpdateAvailable,
    getUpdateFirmwareUrl,
    getUpdatePercentage,
    updateFirmware,
} from "../api";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

@customElement("update-page")
export class UpdatePage extends BasePage {
    static styles = [
        css`
            progress-bar-element {
                grid-column: span 2;
            }
        `,
    ];
    @property({ type: String }) onlineStatus: string;
    @state() errorText: string = "";
    @state() successText: string = "";

    @query("#url") urlElement: InputElement;

    @state() firmwareUpdateProgress: number = 0;
    @state() updateAvailable: boolean = false;

    updateProgressTimeout: number;

    async updateProgress() {
        this.firmwareUpdateProgress = await getUpdatePercentage();
        if (this.firmwareUpdateProgress < 100) {
            this.updateProgressTimeout = window.setTimeout(
                () => this.updateProgress(),
                200
            );
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();

        if (this.updateProgressTimeout) {
            window.clearTimeout(this.updateProgressTimeout);
        }
    }

    async firstUpdated() {
        const updateUrl = await getUpdateFirmwareUrl();
        if (updateUrl) {
            this.urlElement.input.value = updateUrl.url;
        }
    }

    async isUpdateAvailable(url: string) {
        return await checkUpdateAvailable(url);
    }

    async searchForUpdates() {
        this.errorText = "";
        this.successText = "";
        const url = this.urlElement.input.value;
        if (!url) {
            this.errorText = "Bitte gib eine URL ein";
            return;
        }

        this.updateAvailable = await this.isUpdateAvailable(url);
        if (this.updateAvailable) {
            this.successText = "Es ist ein Update verfügbar";
        } else {
            this.errorText =
                "Die Verbindung zum Update Server konnte nicht hergestellt werden";
        }
    }

    async updateFirmware() {
        this.errorText = "";
        const url = this.urlElement.input.value;
        if (!url) {
            this.errorText = "Bitte gib eine URL ein";
            return;
        }

        await updateFirmware(url);
        this.updateProgress();
    }

    render() {
        return html`
            <title-element>Firmware aktualisieren</title-element>
            <input-element-grid>
                <input-element
                    id="url"
                    label="Update Url"
                    type="text"
                ></input-element>
                <progress-bar-element
                    progress="${this.firmwareUpdateProgress}"
                ></progress-bar-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <success-text-element
                text="${this.successText}"
            ></success-text-element>
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
                ${this.updateAvailable
                    ? html`
                          <button-element
                              name="Firmware aktualisieren"
                              @click="${this.updateFirmware}"
                              ?secondary="${true}"
                          ></button-element>
                      `
                    : html`
                          <button-element
                              name="Nach Updates suchen"
                              @click="${this.searchForUpdates}"
                              ?secondary="${true}"
                          ></button-element>
                      `}
            </button-nav-element>
        `;
    }
}
