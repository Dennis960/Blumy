import { HttpCloudConfiguration } from "api";
import { InputElement } from "./input-element";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("http-form-element")
export class HttpFormElement extends LitElement {
    @query("#sensorId") sensorInput: InputElement;
    @query("#url") urlInput: InputElement;
    @query("#auth") authInput: InputElement;

    public getConfig(): HttpCloudConfiguration {
        return {
            type: "http",
            sensorId: this.sensorInput.input.value,
            url: this.urlInput.input.value,
            auth: this.authInput.input.value,
        };
    }

    public setConfig(config: HttpCloudConfiguration) {
        this.sensorInput.input.value = config.sensorId;
        this.urlInput.input.value = config.url;
        this.authInput.input.value = config.auth;
    }

    private handleChange() {
        this.dispatchEvent(
            new CustomEvent<HttpCloudConfiguration>("input-config", {
                detail: {
                    type: "http",
                    sensorId: this.sensorInput.input.value,
                    url: this.urlInput.input.value,
                    auth: this.authInput.input.value,
                },
            })
        );
    }

    render() {
        return html`
            <input-element-grid>
                <input-element
                    id="sensorId"
                    type="sensorId"
                    label="Sensor Id"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="url"
                    type="url"
                    label="Webhook-URL"
                    @input=${this.handleChange}
                ></input-element>
                <input-element
                    id="auth"
                    type="text"
                    label="Auth Header"
                    @input=${this.handleChange}
                ></input-element>
            </input-element-grid>
        `;
    }
}
