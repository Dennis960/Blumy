import { css, html } from "lit";
import { customElement, LitElement } from "lit-element";

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
