import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("button-nav-element")
export class ButtonNavElement extends LitElement {
    static styles = [
        css`
            .button-nav {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: space-between;
                width: 100%;
                row-gap: 1rem;
            }
        `,
    ];
    render() {
        return html`
            <div class="button-nav">
                <slot></slot>
            </div>
        `;
    }
}
