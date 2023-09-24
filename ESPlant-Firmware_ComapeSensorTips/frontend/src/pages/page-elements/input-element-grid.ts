import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("input-element-grid")
export class InputElementGrid extends LitElement {
    static styles = [
        css`
            .grid {
                display: grid;
                grid-template-columns: min-content auto;
                row-gap: 0.75rem;
                column-gap: 1rem;
                align-items: center;
                margin-bottom: 0.75rem;
            }
        `,
    ];

    render() {
        return html`
            <div class="grid">
                <slot></slot>
            </div>
        `;
    }
}
