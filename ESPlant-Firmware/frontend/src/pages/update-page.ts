import { html } from "lit";
import { css } from "lit";
import { property, query, state, customElement } from "lit/decorators.js";
import { getUpdatePercentage, resetEsp, ResetFlag, updateFirmware, updateFs } from "../api";
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

    @query("#littlefs") littlefsElement: InputElement;
    @query("#firmware") firmwareElement: InputElement;

    @state() littlefsProgress: number = 0;
    @state() firmwareProgress: number = 0;

    async upload() {
        if (
            !this.littlefsElement.input.files[0] &&
            !this.firmwareElement.input.files[0]
        ) {
            this.errorText = "Bitte Datei für den Upload auswählen";
            return;
        }
        console.log(this.littlefsElement.input.files[0]);
        
        if (this.littlefsElement.input.files[0]) {
            let finished = false;
            (async () => {
                while (!finished) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    await getUpdatePercentage().then((percentage) => {
                        this.littlefsProgress = percentage;
                    });
                }
            })();
            const res = await updateFs(this.littlefsElement.input.files[0]);
            finished = true;
            if (!res.ok) {
                this.errorText = "Fehler, Gerät antwortet nicht";
                return;
            }
            if (!this.errorText) {
                this.littlefsProgress = 100;
            }
        }
        if (this.firmwareElement.input.files[0]) {
            let finished = false;
            (async () => {
                while (!finished) {
                    await new Promise((resolve) => setTimeout(resolve, 300));
                    await getUpdatePercentage().then((percentage) => {
                        this.firmwareProgress = percentage;
                    });
                }
            })();
            const res = await updateFirmware(
                this.firmwareElement.input.files[0]
            );
            finished = true;
            if (!res.ok) {
                this.errorText = "Fehler, Gerät antwortet nicht";
                return;
            }
            if (!this.errorText) {
                this.firmwareProgress = 100;
            }
        }
        resetEsp(ResetFlag.CONFIGURATION_FLAG);
        // TODO: open "Waiting for esp to restart" screen
    }

    render() {
        return html`
            <title-element>Firmware aktualisieren</title-element>
            <input-element-grid>
                <input-element
                    id="littlefs"
                    label="littlefs.bin"
                    type="file"
                ></input-element>
                <progress-bar-element
                    progress="${this.littlefsProgress}"
                ></progress-bar-element>
                <input-element
                    id="firmware"
                    label="firmware.bin"
                    type="file"
                ></input-element>
                <progress-bar-element
                    progress="${this.firmwareProgress}"
                ></progress-bar-element>
            </input-element-grid>
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
                    name="Hochladen"
                    @click="${this.upload}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
