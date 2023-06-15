import { css, html, LitElement, state } from "lit-element";
import { customElement } from "lit/decorators.js";
import "./elements/dots-stepper-element";
import "./elements/header-element";
import "./elements/loader-bar-element";
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
    loading = false;

    render() {
        return html`
            <header-element icon="🌱" title="PlantFi"></header-element>
            <loader-bar-element ?active="${this.loading}"></loader-bar-element>
            <div class="page">
                This is the home screen. It is currently under construction.
            </div>
        `;
    }
}
