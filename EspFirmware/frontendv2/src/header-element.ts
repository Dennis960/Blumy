import { LitElement, css, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";

@customElement("header-element")
export class HeaderElement extends LitElement {
    static styles = css`
        :host {
            width: 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            font-size: 1.5rem;
            padding: 1.5rem 2rem;
            box-sizing: border-box;
            column-gap: 0.75rem;
            background-color: var(--primary-base);
            color: var(--text-light);
        }
        span {
            text-shadow: 0 0 1px black;
        }
        .title {
            font-weight: 600;
        }
    `;

    @property()
    title: string;
    @property()
    icon: string;

    render() {
        return html`
            <span>${this.icon}</span>
            <div class="title">${this.title}</div>
        `;
    }
}
