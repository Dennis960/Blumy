import { StateController } from "@lit-app/state";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./elements/dots-stepper-element";
import "./elements/header-element";
import "./elements/loader-bar-element";
import "./pages/cloud-page";
import "./pages/home-page";
import "./pages/reset-page";
import "./pages/timeout-page";
import "./pages/update-page";
import "./pages/welcome-page";
import "./pages/wifi-scanner-page";
import "./pages/wifi-setup-page";
import { loadingState } from "./states";

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
            padding: 0 1rem 1rem 1rem;
            max-width: 30rem;
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
            />`,
            html`<wifi-scanner-page
                @next="${this.next}"
                @back="${this.back}"
            />`,
            html`<wifi-setup-page @next="${this.next}" @back="${this.back}" />`,
            html`<update-page @next="${this.next}" @back="${this.back}" />`,
            html`<timeout-page @next="${this.next}" @back="${this.back}" />`,
            html`<cloud-page @next="${this.next}" @back="${this.back}" />`,
            html`<reset-page @next="${this.next}" @back="${this.back}" />`,
            html`<home-page @back="${this.back}"></home-page>`,
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
                <header-element icon="🌱" title="Blumy"></header-element>
                <loader-bar-element
                    ?active="${loadingState.state > 0}"
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
