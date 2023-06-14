import { LitElement, css, html } from "lit-element";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";

@customElement("dot-element")
export class DotElement extends LitElement {
    static styles = css`
        button {
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
            background-color: var(--grey);
            border: none;
            cursor: pointer;
        }
        button.active {
            background-color: var(--primary-base);
            cursor: default;
        }
        button.done {
            background-color: var(--primary-light);
        }
    `;

    @property({ type: Boolean })
    active: boolean;
    @property({ type: Boolean })
    done: boolean;

    click() {
        this.dispatchEvent(new CustomEvent("dotClicked"));
    }
    render() {
        const classes = { active: this.active, done: this.done };

        return html`<li class="dot">
            <button class=${classMap(classes)} @click="${this.click}"></button>
        </li>`;
    }
}

@customElement("dots-stepper-element")
export class DotsStepperElement extends LitElement {
    static styles = css`
        :host {
            margin: 1.5rem;
        }
        span {
            text-shadow: 0 0 1px black;
        }
        ol {
            display: flex;
            flex-direction: row;
            column-gap: 0.25rem;
            align-items: center;
            justify-content: center;
            list-style: none;
            padding: 0;
            margin: 0;
        }
    `;

    @property({ type: Number })
    numberOfDots: number;
    @property({ type: Number })
    currentDot: number;

    render() {
        return html`
            <ol>
                ${Array.from({ length: this.numberOfDots }, (_, i) => {
                    return html`<dot-element
                        ?active=${i === this.currentDot}
                        ?done=${i < this.currentDot}
                        @dotClicked="${() => {
                            this.dispatchEvent(
                                new CustomEvent("dotClicked", {
                                    detail: i,
                                })
                            );
                        }}"
                    ></dot-element>`;
                })}
            </ol>
        `;
    }
}
