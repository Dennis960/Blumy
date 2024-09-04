import { css, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { getSensorData } from "../api";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

@customElement("home-page")
export class HomePage extends BasePage {
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

    @query("#temperature") temperatureElement!: InputElement;
    @query("#humidity") humidityElement!: InputElement;
    @query("#light") lightElement!: InputElement;
    @query("#moisture") moistureElement!: InputElement;
    @query("#voltage") voltageElement!: InputElement;
    @query("#usb") usbElement!: InputElement;

    @state()
    loading = false;

    shouldFetchData = true;

    async updateSensorData() {
        while (this.shouldFetchData) {
            const sensorData = await getSensorData();
            if (!sensorData) {
                return;
            }
            this.temperatureElement.input.value = String(
                sensorData.temperature
            );
            this.humidityElement.input.value = String(sensorData.humidity);
            this.lightElement.input.value = String(sensorData.light);
            this.moistureElement.input.value = String(sensorData.moisture);
            this.voltageElement.input.value = String(sensorData.voltage);
            this.usbElement.input.value = sensorData.usb
                ? "angeschlossen"
                : "nicht angeschlossen";
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    }

    constructor() {
        super();
        this.updateSensorData();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.shouldFetchData = false;
    }

    render() {
        return html`
            <p style="font-size: 1.5rem; font-weight: bold;">
                Live Anzeige der Sensordaten
            </p>
            <input-element-grid>
                <input-element
                    id="temperature"
                    name="Temperatur"
                    type="number"
                    label="Temperatur"
                    readonly="true"
                ></input-element>
                <input-element
                    id="humidity"
                    name="Luftfeuchtigkeit"
                    type="number"
                    label="Luftfeuchtigkeit"
                    readonly="true"
                ></input-element>
                <input-element
                    id="light"
                    name="Licht"
                    type="number"
                    label="Licht"
                    readonly="true"
                ></input-element>
                <input-element
                    id="moisture"
                    name="Feuchtigkeit"
                    type="number"
                    label="Feuchtigkeit"
                    readonly="true"
                ></input-element>
                <input-element
                    id="voltage"
                    name="Spannung"
                    type="number"
                    label="Spannung"
                    readonly="true"
                ></input-element>
                <input-element
                    id="usb"
                    name="USB"
                    type="text"
                    label="USB"
                    readonly="true"
                ></input-element>
            </input-element-grid>
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
