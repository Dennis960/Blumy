import { css, html, LitElement, state } from "lit-element";
import { customElement } from "lit/decorators.js";
import "./dots-stepper-element";
import "./header-element";
import "./pages/mqtt-page";
import "./pages/name-page";
import "./pages/update-page";
import "./pages/welcome-page";
import "./pages/wifi-scanner-page";
import "./pages/wifi-setup-page";

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
    onlineStatus = "offline";
    @state()
    ssid = "";

    @state()
    pageElements = [];

    next = (data: any) => {
        this.currentDot = Math.min(
            this.currentDot + 1,
            this.pageElements.length - 1
        );
        if (data.detail.ssid) {
            this.ssid = data.detail.ssid;
            this.updatePageElements();
        }
    };
    back = () => {
        this.currentDot = Math.max(this.currentDot - 1, 0);
    };

    onDotClick = (e: CustomEvent) => {
        const dotNumber = e.detail;
        this.currentDot = dotNumber;
    };

    updatePageElements() {
        this.pageElements = [
            html`<welcome-page
                @next="${this.next}"
                onlineStatus="${this.onlineStatus}"
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
                ssid="${this.ssid}"
            ></wifi-setup-page>`,
            html`<mqtt-page
                @next="${this.next}"
                @back="${this.back}"
            ></mqtt-page>`,
        ];
    }

    constructor() {
        super();
        this.updatePageElements();
    }

    render() {
        return html`
            <header-element icon="🌱" title="PlantFi"></header-element>
            <dots-stepper-element
                numberOfDots="${this.pageElements.length}"
                currentDot="${this.currentDot}"
                @dotClicked="${this.onDotClick}"
            ></dots-stepper-element>
            <div class="page">${this.pageElements[this.currentDot]}</div>
        `;
    }
}
