import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("loader-bar-element")
export class LoaderBarElement extends LitElement {
    @property({ type: Boolean }) active: boolean;
    static styles = [
        css`
            .loader.active {
                animation: running-progress 2s cubic-bezier(0.4, 0, 0.2, 1)
                    infinite;
                background-color: var(--secondary-light);
            }
            .loader {
                height: 0.25rem;
            }

            @keyframes running-progress {
                0% {
                    width: 0%;
                    margin-left: 0px;
                    margin-right: 100%;
                }
                50% {
                    width: 75%;
                    margin-left: 25%;
                    margin-right: 0%;
                }
                100% {
                    width: 0%;
                    margin-left: 100%;
                    margin-right: 0;
                }
            }
        `,
    ];

    render() {
        return html`
            <div
                class="${classMap({ loader: true, active: this.active })}"
            ></div>
        `;
    }
}
