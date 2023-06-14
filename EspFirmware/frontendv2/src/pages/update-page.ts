import { html } from "lit";
import { customElement } from "lit-element";
import { property, query, state } from "lit/decorators.js";
import { getUpdatePercentage, updateFirmware, updateFs } from "../api";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

@customElement("update-page")
export class UpdatePage extends BasePage {
    @property({ type: String }) onlineStatus: string;
    @state() errorText: string = "";

    @query("#littlefs") littlefsElement: InputElement;
    @query("#firmware") firmwareElement: InputElement;

    @state() littlefsProgress: number = 0;
    @state() firmwareProgress: number = 0;

    async upload() {
        if (!this.littlefsElement.value && !this.firmwareElement.value) {
            this.errorText = "Please select a file to upload";
            return;
        }
        console.log(this.littlefsElement.value);

        if (this.littlefsElement.value) {
            (async () => {
                while (!this.errorText && this.littlefsProgress < 100) {
                    await getUpdatePercentage().then((percentage) => {
                        this.littlefsProgress = percentage;
                    });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            })();
            const res = await updateFs(this.littlefsElement.value);
            if (!res.ok) {
                this.errorText = "Error, device not responding";
            }
            if (!this.errorText) {
                this.littlefsProgress = 100;
            }
        }
        if (this.firmwareElement.value) {
            (async () => {
                while (!this.errorText && this.firmwareProgress < 100) {
                    await getUpdatePercentage().then((percentage) => {
                        this.firmwareProgress = percentage;
                    });
                    await new Promise((resolve) => setTimeout(resolve, 300));
                }
            })();
            const res = await updateFirmware(this.firmwareElement.value);
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
            <title-element title="Update Firmware"></title-element>
            <input-element-grid>
                <input-element
                    id="littlefs"
                    label="littlefs.bin"
                    type="file"
                ></input-element>
                <progress-bar-element
                    progress="${this.littlefsProgress}"
                ></progress-bar-element>
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
