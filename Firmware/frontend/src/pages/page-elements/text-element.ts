import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("text-element")
export class ColoredTextElement extends LitElement {
    @property({ type: String }) text!: string;
    @property({ type: String }) color: "success" | "error" | "warning" =
        "error";

    static styles = [
        css`
            .success-text {
                margin-bottom: 0.75rem;
            }
        `,
    ];

    render() {
        return html`
            <div
                class="success-text"
                style="${styleMap({
                    display: this.text ? "" : "none",
                    color: `var(--${this.color})`,
                })}"
            >
                ${this.text}
            </div>
        `;
    }
}
