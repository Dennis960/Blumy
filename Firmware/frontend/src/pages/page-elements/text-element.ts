import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("text-element")
export class ColoredTextElement extends LitElement {
    @property({ type: String }) text!: string;
    @property({ type: String }) color:
        | "success"
        | "error"
        | "helper" = "error";
    @property({ type: Object }) styleCustom: Record<string, string> = {};

    render() {
        return html`
            <div
                style="${styleMap({
                    display: this.text ? "block" : "none",
                    color: `var(--${this.color})`,
                    ...this.styleCustom,
                })}"
            >
                ${this.text}
            </div>
        `;
    }
}
