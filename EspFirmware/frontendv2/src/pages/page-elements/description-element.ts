import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("description-element")
export class DescriptionElement extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
                margin-bottom: 0.75rem;
            }
        `,
    ];
    render() {
        return html` <slot></slot> `;
    }
}
