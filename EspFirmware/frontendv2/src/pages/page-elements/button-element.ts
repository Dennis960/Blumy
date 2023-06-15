import { css, html } from "lit";
import { LitElement, customElement } from "lit-element";
import { property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("button-element")
export class ButtonElement extends LitElement {
    @property({ type: Boolean }) secondary: boolean;
    @property({ type: String }) name: string;
    @property({ type: Boolean }) disabled: boolean;

    static styles = [
        css`
            button {
                width: 100%;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                font-size: 100%;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            button.secondary {
                background-color: var(--secondary-base);
                color: var(--text-light);
            }
            button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `,
    ];
    render() {
        const classes = {
            secondary: this.secondary,
            disabled: this.disabled,
        };
        return html`
            <button class=${classMap(classes)}>
                <slot></slot>${this.name}
            </button>
        `;
    }
}
