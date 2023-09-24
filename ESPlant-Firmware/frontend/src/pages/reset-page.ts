import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { resetEsp, ResetFlag } from "../api";
import { BasePage } from "./base-page";

@customElement("reset-page")
export class ResetPage extends BasePage {
    @state() errorText: string = "";

    async reset() {
        const res = await resetEsp(ResetFlag.SENSOR_FLAG);
        if (!res.ok) {
            this.errorText = "Error, device not responding";
            return;
        }
    }

    render() {
        return html`
            <title-element>Reset</title-element>
            <description-element>
                Pressing the reset button sends the sensor into sensor mode. It
                will connect to the specified WiFi network and send data to the
                specified MQTT broker. To configure the device again, you will
                have to reset it again by pressing the reset button.
            </description-element>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Reset"
                    @click="${this.reset}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
