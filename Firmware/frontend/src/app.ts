import { StateController } from "@lit-app/state";
import { css, html, LitElement, TemplateResult } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./elements/dots-stepper-element";
import "./elements/header-element";
import "./elements/loader-bar-element";
import "./pages/cloud-page";
import "./pages/home-page";
import "./pages/before-setup-finish-page";
import "./pages/setup-finish-page";
import "./pages/reset-page";
import "./pages/settings-page";
import "./pages/update-page";
import "./pages/welcome-page";
import "./pages/wifi-scanner-page";
import "./pages/wifi-setup-page";
import { enableDotNavigation, loadingState } from "./states";

@customElement("app-element")
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
    currentDot = "0";

    pageElements: Record<string, TemplateResult> = {
        "0": html`<welcome-page @next="${this.next}" />`,
        "1": html`<wifi-scanner-page
            @next="${this.next}"
            @back="${this.back}"
        />`,
        "2": html`<wifi-setup-page
            @next="${this.next}"
            @back="${this.back}"
        />`,
        "3": html`<cloud-page @next="${this.next}" @back="${this.back}" />`,
        "4": html`<before-setup-finish-page
            @next="${this.next}"
            @back="${this.back}"
        />`,
        "5": html`<setup-finish-page
            @next="${this.next}"
            @back="${this.back}"
        />`,
        update: html`<update-page @next="${this.next}" @back="${this.back}" />`,
        settings: html`<settings-page
            @next="${this.next}"
            @back="${this.back}"
        />`,
        sensor: html`<home-page @back="${this.back}"></home-page>`,
        reset: html`<reset-page @next="${this.next}" @back="${this.back}" />`,
    };

    next(event: CustomEvent<number>) {
        this.currentDot = (parseInt(this.currentDot) + event.detail).toString();
    }
    back() {
        this.currentDot = (parseInt(this.currentDot) - 1).toString();
    }

    onDotClick = (e: CustomEvent) => {
        if (enableDotNavigation.state) {
            const dotNumber = e.detail;
            this.currentDot = dotNumber;
        }
    };

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
            this.currentDot = page;
        }
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
                numberOfDots="5"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">
                ${this.pageElements[this.currentDot.toString()]}
            </div>
        `;
    }
}
