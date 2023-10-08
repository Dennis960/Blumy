import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";

@customElement("progress-bar-element")
export class ProgressBarElement extends LitElement {
    @property({ type: Number }) progress: number = 0;

    static styles = [
        css`
            .progress-bar {
                grid-column: 1 / -1;
            }
            .progress-bar-fill {
                height: 0.25rem;
                background-color: var(--primary-base);
            }
        `,
    ];

    render() {
        return html`
            <div class="progress-bar" style=${styleMap({display: `${this.progress == 0 ? "none" : ""}`})}>
                <div
                    class="progress-bar-fill"
                    style=${styleMap({ width: `${this.progress}%`})}
                ></div>
            </div>
        `;
    }
}
