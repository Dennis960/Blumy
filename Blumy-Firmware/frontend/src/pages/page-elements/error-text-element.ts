import { styleMap } from "lit/directives/style-map.js";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("error-text-element")
export class ErrorTextElement extends LitElement {
    @property({ type: String }) text: string;
    static styles = [
        css`
            .error-text {
                color: var(--error);
                margin-bottom: 0.75rem;
            }
        `,
    ];

    render() {
        return html`
            <div
                class="error-text"
                style="${styleMap({ display: this.text ? "" : "none" })}"
            >
                ${this.text}
            </div>
        `;
    }
}
