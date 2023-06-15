import { css, html } from "lit";
import { customElement, LitElement } from "lit-element";

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
