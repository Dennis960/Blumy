import { html } from "lit";
import { customElement } from "lit-element";
import { BasePage } from "./base-page";

@customElement("mqtt-page")
export class MqttPage extends BasePage {
    render() {
        return html`
            <title-element
                title="MQTT Configuration (optional)"
            ></title-element>
            <input-element-grid>
                <input-element type="text" label="Server"></input-element>
                <input-element type="number" label="Port"></input-element>
                <input-element type="text" label="User"></input-element>
                <input-element type="password" label="Password"></input-element>
                <input-element type="text" label="Topic"></input-element>
                <input-element type="text" label="Client-ID"></input-element>
            </input-element-grid>
            <error-text-element text=""></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Connect"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
