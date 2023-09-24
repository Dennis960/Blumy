import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("loader-spinner-element")
export class LoaderSpinnerElement extends LitElement {
    static styles = [
        css`
            .lds-ring {
                display: inline-block;
                position: relative;
                width: 3rem;
                height: 3rem;
            }
            .lds-ring div {
                box-sizing: border-box;
                display: block;
                position: absolute;
                width: 80%;
                height: 80%;
                border: 0.25rem solid #fff;
                border-radius: 50%;
                animation: lds-ring 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                border-color: var(--secondary-light) transparent transparent transparent;
            }
            .lds-ring div:nth-child(1) {
                animation-delay: -0.45s;
            }
            .lds-ring div:nth-child(2) {
                animation-delay: -0.3s;
            }
            .lds-ring div:nth-child(3) {
                animation-delay: -0.15s;
            }
            @keyframes lds-ring {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
        `,
    ];

    render() {
        return html`
            <div class="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        `;
    }
}
