import { getSensorValue } from "./api";
import { css, html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import "./elements/dots-stepper-element";
import "./elements/header-element";
import "./elements/loader-bar-element";
import "./pages/page-elements/mqtt-form-element";
import "./pages/name-page";
import "./pages/update-page";
import "./pages/welcome-page";
import "./pages/wifi-scanner-page";
import "./pages/wifi-setup-page";

@customElement("home-screen")
export class HomeScreen extends LitElement {
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
    loading = false;
    @state()
    sensorValue = 0;

    shouldGetSensorValue = true;

    constructor() {
        super();
        (async () => {
            while (this.shouldGetSensorValue) {
                this.sensorValue = await getSensorValue();
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
        })();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shouldGetSensorValue = false;
    }

    render() {
        return html`
            <header-element icon="🌱" title="Blumy"></header-element>
            <loader-bar-element ?active="${this.loading}"></loader-bar-element>
            <p style="font-size: 1.5rem; font-weight: bold;">
                Zuletzt gelesener Feuchtigkeitswert:
            </p>
            <div style="font-size: 3rem; font-weight: bold;">
                ${this.sensorValue}
            </div>
        `;
    }
}
