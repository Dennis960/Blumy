import { setPlantName } from "../api";
import { html } from "lit";
import { property, query, customElement, state } from "lit/decorators.js";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

@customElement("name-page")
export class NamePage extends BasePage {
    @property({ type: String }) onlineStatus: string;
    @query("#name") nameElement: InputElement;
    @state() errorText: string = "";

    async submit() {
        const name = this.nameElement.input.value ?? "";
        if (name.length < 1 || name.length > 32) {
            this.errorText = "Name must be between 1 and 32 characters";
            return;
        } else {
            this.errorText = "";
        }
        const response = await setPlantName(name);
        if (!response.ok) {
            this.errorText = "Error, device not responding";
            return;
        } else {
            this.next();
        }
    }

    render() {
        return html`
            <title-element>Choose a name for your plant</title-element>
            <input-element-grid>
                <input-element id="name" label="Plant Name"></input-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <button-nav-element>
                <button-element
                    name="Back"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Skip"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
                <button-element
                    name="Submit"
                    @click="${this.submit}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
