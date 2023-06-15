import { loadingState } from "./states";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./elements/dots-stepper-element";
import "./elements/header-element";
import "./elements/loader-bar-element";
import "./pages/mqtt-page";
import "./pages/name-page";
import "./pages/update-page";
import "./pages/welcome-page";
import "./pages/wifi-scanner-page";
import "./pages/wifi-setup-page";
import { StateController } from "@lit-app/state";

@customElement("first-setup-screen")
export class FirstSetupScreen extends LitElement {
    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            align-items: center;
            row-gap: 1rem;
            width: 100%;
        }
        header {
            width: 100%;
        }
        .page {
            padding: 0 1rem;
            max-width: 24rem;
            width: 100%;
            box-sizing: border-box;
        }
    `;

    @state()
    currentDot = 0;

    @state()
    pageElements = [];

    next() {
        this.currentDot++;
        if (this.currentDot >= this.pageElements.length) {
            this.nextScreen();
        }
    }
    back() {
        this.currentDot = Math.max(this.currentDot - 1, 0);
    }

    nextScreen() {
        // redirect to /home
        window.location.href = "/home";
    }

    onDotClick = (e: CustomEvent) => {
        const dotNumber = e.detail;
        this.currentDot = dotNumber;
    };

    updatePageElements() {
        this.pageElements = [
            html`<welcome-page
                @next="${this.next}"
                @skip="${this.nextScreen}"
            ></welcome-page>`,
            html`<update-page
                @next="${this.next}"
                @back="${this.back}"
            ></update-page>`,
            html`<name-page
                @next="${this.next}"
                @back="${this.back}"
            ></name-page>`,
            html`<wifi-scanner-page
                @next="${this.next}"
                @back="${this.back}"
            ></wifi-scanner-page>`,
            html`<wifi-setup-page
                @next="${this.next}"
                @back="${this.back}"
            ></wifi-setup-page>`,
            html`<mqtt-page
                @next="${this.next}"
                @back="${this.back}"
            ></mqtt-page>`,
        ];
    }

    loadingStateController = new StateController(this, loadingState);

    updated() {
        // set url param page
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set("page", this.currentDot.toString());
        window.history.replaceState(
            {},
            "",
            `${window.location.pathname}?${urlParams}`
        );
    }

    constructor() {
        super();
        // get url param page
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get("page");
        if (page) {
            this.currentDot = parseInt(page);
        }
        this.updatePageElements();
    }

    render() {
        return html`
            <header>
                <header-element icon="🌱" title="PlantFi"></header-element>
                <loader-bar-element
                    ?active="${loadingState.state}"
                ></loader-bar-element>
            </header>
            <dots-stepper-element
                numberOfDots="${this.pageElements.length}"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">${this.pageElements[this.currentDot]}</div>
        `;
    }
}
