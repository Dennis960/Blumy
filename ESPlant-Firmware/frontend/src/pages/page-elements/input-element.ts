import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("input-element")
export class InputElement extends LitElement {
    static styles = [
        css`
            :host {
                display: contents;
            }
            input {
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem;
                line-height: 1.15;
                font-size: 100%;
                width: 100%;
            }
            div {
                display: flex;
                flex-direction: row;
                width: 100%;
            }
        `,
    ];
    @property({ type: String }) label: string;
    @property({ type: String }) type?:
        | "button"
        | "checkbox"
        | "color"
        | "date"
        | "datetime-local"
        | "email"
        | "file"
        | "hidden"
        | "image"
        | "month"
        | "number"
        | "password"
        | "radio"
        | "range"
        | "reset"
        | "search"
        | "submit"
        | "tel"
        | "text"
        | "time"
        | "url"
        | "week" = "text";
    @property() initialValue: any;

    @query("#input")
    input: HTMLInputElement;

    firstUpdated() {
        if (this.initialValue !== undefined) {
            this.input.value = this.initialValue;
        }
    }

    render() {
        return html`
            <label for="input">${this.label}</label>
            <div>
                <input
                    id="input"
                    type="${this.type}"
                    placeholder="${this.label}"
                />
                <slot></slot>
            </div>
        `;
    }
}
