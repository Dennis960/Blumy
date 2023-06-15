import { html } from "lit";
import { css } from "lit";
import { property, query, state, customElement } from "lit/decorators.js";
import { getUpdatePercentage, updateFirmware, updateFs } from "../api";
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
            this.errorText = "Please select a file to upload";
            return;
        }
        console.log(this.littlefsElement.input.files[0]);

        if (this.littlefsElement.input.files[0]) {
            (async () => {
                while (!this.errorText && this.littlefsProgress < 100) {
                    await getUpdatePercentage().then((percentage) => {
                        this.littlefsProgress = percentage;
                    });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            })();
            const res = await updateFs(this.littlefsElement.input.files[0]);
            if (!res.ok) {
                this.errorText = "Error, device not responding";
            }
            if (!this.errorText) {
                this.littlefsProgress = 100;
            }
        }
        if (this.firmwareElement.input.files[0]) {
            (async () => {
                while (!this.errorText && this.firmwareProgress < 100) {
                    await getUpdatePercentage().then((percentage) => {
                        this.firmwareProgress = percentage;
                    });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            })();
            const res = await updateFirmware(
                this.firmwareElement.input.files[0]
            );
            if (!res.ok) {
                this.errorText = "Error, device not responding";
            }
            if (!this.errorText) {
                this.firmwareProgress = 100;
            }
        }
    }

    render() {
        return html`
            <title-element>Update Firmware</title-element>
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
                    name="Upload"
                    @click="${this.upload}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
