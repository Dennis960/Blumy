import { css, html } from "lit";
import { LitElement, customElement } from "lit-element";
import { property } from "lit/decorators.js";

@customElement("input-element")
export class InputElement extends LitElement {
    static styles = [
        css`
            :host {
                display: flex;
                flex-direction: row;
                align-items: center;
                column-gap: 1rem;
                width: 100%;
                margin-bottom: 0.75rem;
            }
            input {
                flex-grow: 1;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem;
                line-height: 1.15;
                font-size: 100%;
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
    @property() value: any;

    onChange = (e: Event) => {
        const input = e.target as HTMLInputElement;
        this.value = input.value;
        this.dispatchEvent(new CustomEvent("change", { detail: this.value }));
    };

    render() {
        return html`
            <label for="input">${this.label}</label>
            <input id="input" type="${this.type}" placeholder="${this.label}" value="${this.value}" @change="${this.onChange}" />
        `;
    }
}
