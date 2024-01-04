import { HttpCloudConfiguration } from "api";
import { InputElement } from "./input-element";
import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";

@customElement("http-form-element")
export class HttpFormElement extends LitElement {
    @query("#url") urlInput: InputElement;
    @query("#auth") authInput: InputElement;
    
    private handleChange() {
        this.dispatchEvent(new CustomEvent<HttpCloudConfiguration>('input', {
            detail: {
                type: 'http',
                url: this.urlInput.input.value,
                auth: this.authInput.input.value,
            }
        }))
    }

    render() {
        return html`
            <input-element-grid>
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
