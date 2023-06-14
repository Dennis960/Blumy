import { css, html } from "lit";
import { customElement, LitElement } from "lit-element";
import { property } from "lit/decorators.js";

@customElement("description-element")
export class DescriptionElement extends LitElement {
    static styles = [
        css`
            .description {
                margin-bottom: 0.75rem;
            }
        `,
    ];
    @property({ type: String }) description: string;
    render() {
        return html`<div class="description">${this.description}</div>`;
    }
}
