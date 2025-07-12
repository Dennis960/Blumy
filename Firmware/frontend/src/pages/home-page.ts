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

    @state()
    loading = false;

    @state()
    showAhtValues = false;

    shouldFetchData = true;

    getMoistureHumandReadable(moisture: number): string {
        const MIN_MOISTURE = 10;
        const MAX_MOISTURE = 2500;
        const moistureTranslationMap: { [key: string]: string } = {
            "50": "Unter Wasser",
            "500": "Feucht",
            "1000": "Mittel feucht",
            "1500": "Leicht feucht",
            "2000": "Trocken",
            "2500": "Lufttrocken",
        };

        moisture = Math.min(Math.max(moisture, MIN_MOISTURE), MAX_MOISTURE);
        const invertedMoisture = MAX_MOISTURE - moisture;
        const percentage = (invertedMoisture / MAX_MOISTURE) * 100;
        let moistureTranslation = "";
        for (const key in moistureTranslationMap) {
            if (moisture <= parseInt(key)) {
                moistureTranslation = moistureTranslationMap[key];
                break;
            }
        }
        return `${Math.round(percentage)}% (${moistureTranslation})`;
    }

    async updateSensorData() {
        while (this.shouldFetchData) {
            const sensorData = await getSensorData();
            if (!sensorData) {
                return;
            }
            this.temperatureElement.input.value = this.showAhtValues
                ? sensorData.temperature.toFixed(2) + " °C"
                : "-";
            this.humidityElement.input.value = this.showAhtValues
                ? String(Math.round(sensorData.humidity)) + "%"
                : "-";
            this.lightElement.input.value =
                String(Math.round(sensorData.light * 100)) + "%";
            this.moistureElement.input.value = this.getMoistureHumandReadable(
                sensorData.moisture
            );
            this.voltageElement.input.value =
                sensorData.voltage.toFixed(2) + " V";
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
                    type="text"
                    label="Temperatur"
                    ?readonly="${true}"
                ></input-element>
                <input-element
                    id="humidity"
                    name="Luftfeuchtigkeit"
                    type="text"
                    label="Luftfeuchtigkeit"
                    ?readonly="${true}"
                ></input-element>
                ${this.showAhtValues
                    ? ""
                    : html`
                          <button-element
                              @click="${() => {
                                  this.showAhtValues = true;
                              }}"
                              style="grid-column: 1 / -1;"
                          >
                              Werte anzeigen
                          </button-element>
                      `}
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Temperatur und Luftfeuchtigkeit weichen aufrund der
                    Eigenwärme des Mikrochips während der Konfiguration von
                    tatsächlichen Werten ab.
                </span>

                <input-element
                    id="light"
                    name="Licht"
                    type="text"
                    label="Licht"
                    ?readonly="${true}"
                ></input-element>
                <input-element
                    id="moisture"
                    name="Bodenfeuchtigkeit"
                    type="text"
                    label="Bodenfeuchtigkeit"
                    ?readonly="${true}"
                ></input-element>
                <input-element
                    id="voltage"
                    name="Spannung"
                    type="text"
                    label="Spannung"
                    ?readonly="${true}"
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
