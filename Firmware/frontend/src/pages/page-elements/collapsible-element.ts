import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("collapsible-element")
export class CollapsibleElement extends LitElement {
    @property({ type: String }) summary!: string;
    @property({ type: Boolean }) open!: boolean;

    static styles = [
        css`
            details {
                width: 100%;
                border: 1px solid var(--grey);
                border-radius: 0.25rem;
                margin-bottom: 1rem;
            }

            summary {
                padding: 0.5rem 0.75rem;
                cursor: pointer;
                font-size: 100%;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            details[open] summary {
                background-color: var(--secondary-base);
                color: var(--text-light);
            }

            details[open] summary::-webkit-details-marker {
                color: var(--text-light);
            }

            details[open] summary::marker {
                color: var(--text-light);
            }

            summary:before {
                line-height: 1;
            }

            details[open] summary:before {
                content: "☑";
                margin-right: 0.5rem;
            }

            details:not([open]) summary:before {
                content: "☐";
                margin-right: 0.5rem;
            }

            .content {
                padding: 0.5rem 1rem;
            }
        `,
    ];

    private handleToggle(event: ToggleEvent) {
        if (event.newState == "open") {
            this.dispatchEvent(new CustomEvent("opened"));
        } else {
            this.dispatchEvent(new CustomEvent("closed"));
        }
    }

    render() {
        return html`
            <details ?open=${this.open} @toggle=${this.handleToggle}>
                <summary>${this.summary}</summary>
                <div class="content">
                    <slot></slot>
                </div>
            </details>
        `;
    }
}
