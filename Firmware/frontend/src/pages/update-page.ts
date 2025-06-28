import { css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import {
    checkUpdateAvailable,
    getUpdateFirmwareUrl,
    getUpdatePercentage,
    updateFirmware,
} from "../api";
import { enableDotNavigation } from "../states";
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
    @state() errorText: string = "";
    @state() successText: string = "";
    @state() infoText: string = "";

    @query("#url") urlElement!: InputElement;

    @state() firmwareUpdateProgress: number | null = null;
    @state() updateAvailable: boolean = false;

    async updateProgress() {
        this.firmwareUpdateProgress = 0;
        while (this.firmwareUpdateProgress !== null) {
            this.firmwareUpdateProgress = await getUpdatePercentage();
            if (this.firmwareUpdateProgress === -1) {
                this.infoText = "Es wurde noch kein Update gestartet";
            } else if (this.firmwareUpdateProgress === 100) {
                this.infoText = "Der Sensor wurde erfolgreich aktualisiert";
                this.firmwareUpdateProgress = null;
                return;
            } else if (this.firmwareUpdateProgress < 100) {
                await new Promise((resolve) => setTimeout(resolve, 200));
                if (this.firmwareUpdateProgress > 80) {
                    this.infoText = "Der Sensor wird jetzt neu gestartet";
                }
            }
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.firmwareUpdateProgress = null;
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
        this.successText = "";
        const url = this.urlElement.input.value;
        if (!url) {
            this.errorText = "Bitte gib eine URL ein";
            return;
        }

        enableDotNavigation.state = false;
        await updateFirmware(url);
        await this.updateProgress();
        enableDotNavigation.state = true;
    }

    onUrlChange() {
        this.updateAvailable = false;
        this.errorText = "";
        this.successText = "";
    }

    render() {
        return html`
            <title-element>Firmware aktualisieren</title-element>
            <input-element-grid>
                <input-element
                    id="url"
                    label="Update Url"
                    type="text"
                    @input="${this.onUrlChange}"
                ></input-element>
                <progress-bar-element
                    progress="${this.firmwareUpdateProgress ?? 0}"
                ></progress-bar-element>
            </input-element-grid>
            <text-element
                .styleCustom="${{ marginBottom: "1rem" }}"
                text="${this.errorText || this.successText || this.infoText}"
                color="${this.errorText
                    ? "error"
                    : this.successText
                    ? "success"
                    : "warning"}"
            ></text-element>
            <button-nav-element>
                <div>
                    <!-- Empty div to put submit button on the right side -->
                </div>
                ${this.updateAvailable
                    ? html`
                          <button-element
                              name="Firmware aktualisieren"
                              @click="${this.updateFirmware}"
                              ?secondary="${true}"
                              ?disabled="${this.firmwareUpdateProgress !==
                              null}"
                          ></button-element>
                      `
                    : html`
                          <button-element
                              name="Nach Updates suchen"
                              @click="${this.searchForUpdates}"
                              ?secondary="${true}"
                              ?disabled="${this.firmwareUpdateProgress !==
                              null}"
                          ></button-element>
                      `}
            </button-nav-element>
        `;
    }
}
