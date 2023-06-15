import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("title-element")
export class TitleElement extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
        `,
    ];
    render() {
        return html` <slot></slot>`;
    }
}
