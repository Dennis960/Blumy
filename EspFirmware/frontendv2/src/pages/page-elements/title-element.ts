import { css, html } from "lit";
import { LitElement, customElement } from "lit-element";
import { property } from "lit/decorators.js";

@customElement("title-element")
export class TitleElement extends LitElement {
    @property({ type: String }) title: string;
    static styles = [
        css`
            .title {
                font-size: 1.25rem;
                margin-bottom: 0.75rem;
            }
        `,
    ];
    render() {
        return html`<div class="title">${this.title}</div>`;
    }
}
