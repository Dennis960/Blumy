import { styleMap } from "lit/directives/style-map.js";
import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("success-text-element")
export class SuccessTextElement extends LitElement {
    @property({ type: String }) text: string;
    static styles = [
        css`
            .success-text {
                color: var(--success);
                margin-bottom: 0.75rem;
            }
        `,
    ];

    render() {
        return html`
            <div
                class="success-text"
                style="${styleMap({ display: this.text ? "" : "none" })}"
            >
                ${this.text}
            </div>
        `;
    }
}
