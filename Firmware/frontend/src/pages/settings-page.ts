import { StateController } from "@lit-app/state";
import { html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import timestring from "timestring";
import {
    getConfigurationModeTimeout,
    getMqttMessageTimeout,
    getSleepTimeout,
    setConfigurationModeTimeout,
    setMqttMessageTimeout,
    setSleepTimeout,
    getWatchDogTimeout,
    setWatchDogTimeout,
    getLedBrightness,
    setLedBrightness,
    getFirmwareVersion,
} from "../api";
import { loadingState } from "../states";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";

@customElement("settings-page")
export class SettingsPage extends BasePage {
    @query("#firmwareVersion") firmwareVersionElement!: InputElement;
    @query("#sleepTimeout") sleepTimeoutElement!: InputElement;
    @query("#mqttTimeout") mqttTimeoutElement!: InputElement;
    @query("#configTimeout") configTimeoutElement!: InputElement;
    @query("#watchDogTimeout") watchDogTimeoutElement!: InputElement;
    @query("#ledBrightness") ledBrightnessElement!: InputElement;
    @state() errorText: string = "";

    loadingStateController = new StateController(this, loadingState);

    private initialSleepTimeout: number | null = null;
    private initialMqttTimeout: number | null = null;
    private initialConfigTimeout: number | null = null;
    private initialWatchDogTimeout: number | null = null;
    private initialLedBrightness: number | null = null;

    humanizeDuration(durationMs: number): string {
        let durationString = "";
        const durationDays = Math.floor(durationMs / (1000 * 60 * 60 * 24));
        if (durationDays > 0) {
            durationString += durationDays + " d ";
        }
        const durationHours = Math.floor(
            (durationMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        if (durationHours > 0) {
            durationString += durationHours + " h ";
        }
        const durationMinutes = Math.floor(
            (durationMs % (1000 * 60 * 60)) / (1000 * 60)
        );
        if (durationMinutes > 0) {
            durationString += durationMinutes + " min ";
        }
        const durationSeconds = Math.floor((durationMs % (1000 * 60)) / 1000);
        if (durationSeconds > 0) {
            durationString += durationSeconds + " s ";
        }
        const durationMilliseconds = Math.floor(durationMs % 1000);
        if (durationMilliseconds > 0) {
            durationString += durationMilliseconds + " ms ";
        }
        return durationString.trim();
    }

    async submitSleepTimeout(): Promise<boolean> {
        let sleepTimeoutString = this.sleepTimeoutElement.input.value;
        if (sleepTimeoutString.length == 0) {
            sleepTimeoutString = "1h";
            this.sleepTimeoutElement.input.value = sleepTimeoutString;
        }
        const sleepTimeout = timestring(sleepTimeoutString, "ms");
        if (this.initialSleepTimeout === sleepTimeout) return true;

        const sleepTimeoutResponse = await setSleepTimeout(sleepTimeout);

        if (!sleepTimeoutResponse.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht (Messintervall)";
            return false;
        }
        this.initialSleepTimeout = sleepTimeout;
        return true;
    }

    async submitMqttTimeout(): Promise<boolean> {
        let mqttTimeoutString = this.mqttTimeoutElement.input.value;
        if (mqttTimeoutString.length == 0) {
            mqttTimeoutString = "30s";
            this.mqttTimeoutElement.input.value = mqttTimeoutString;
        }
        const mqttTimeout = timestring(mqttTimeoutString, "ms");
        if (this.initialMqttTimeout === mqttTimeout) return true;

        const mqttTimeoutResponse = await setMqttMessageTimeout(mqttTimeout);

        if (!mqttTimeoutResponse.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht (MQTT Timeout)";
            return false;
        }
        this.initialMqttTimeout = mqttTimeout;
        return true;
    }

    async submitConfigTimeout(): Promise<boolean> {
        let configTimeoutString = this.configTimeoutElement.input.value;
        if (configTimeoutString.length == 0) {
            configTimeoutString = "5m";
            this.configTimeoutElement.input.value = configTimeoutString;
        }
        const configTimeout = timestring(configTimeoutString, "ms");
        if (this.initialConfigTimeout === configTimeout) return true;

        const configTimeoutResponse = await setConfigurationModeTimeout(
            configTimeout
        );

        if (!configTimeoutResponse.ok) {
            this.errorText =
                "Fehler, Gerät antwortet nicht (Konfigurationsmodus)";
            return false;
        }
        this.initialConfigTimeout = configTimeout;
        return true;
    }

    async submitWatchDogTimeout(): Promise<boolean> {
        let watchDogTimeoutString = this.watchDogTimeoutElement.input.value;
        if (watchDogTimeoutString.length == 0) {
            watchDogTimeoutString = "20s";
            this.watchDogTimeoutElement.input.value = watchDogTimeoutString;
        }
        const watchDogTimeout = timestring(watchDogTimeoutString, "ms");
        if (this.initialWatchDogTimeout === watchDogTimeout) return true;
        const watchDogTimeoutResponse = await setWatchDogTimeout(
            watchDogTimeout
        );
        if (!watchDogTimeoutResponse.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht (WatchDog Timeout)";
            return false;
        }
        this.initialWatchDogTimeout = watchDogTimeout;
        return true;
    }

    async submitLedBrightness(): Promise<boolean> {
        const ledBrightness = parseInt(this.ledBrightnessElement.input.value);
        if (isNaN(ledBrightness) || ledBrightness < 0 || ledBrightness > 255) {
            this.errorText = "Ungültige LED Helligkeit, bitte 0-255 eingeben.";
            return false;
        }
        if (this.initialLedBrightness === ledBrightness) return true;

        const ledBrightnessResponse = await setLedBrightness(ledBrightness);

        if (!ledBrightnessResponse.ok) {
            this.errorText = "Fehler, Gerät antwortet nicht (LED Helligkeit)";
            return false;
        }
        this.initialLedBrightness = ledBrightness;
        return true;
    }

    async submit() {
        this.errorText = "";
        loadingState.state++;
        await this.submitSleepTimeout();
        await this.submitMqttTimeout();
        await this.submitConfigTimeout();
        await this.submitWatchDogTimeout();
        await this.submitLedBrightness();
        loadingState.state--;
    }

    async firstUpdated() {
        // Firmware Version
        const firmwareVersion: number = await getFirmwareVersion();
        if (firmwareVersion != null) {
            this.firmwareVersionElement.input.value = `${firmwareVersion}`;
        } else {
            this.firmwareVersionElement.input.value = "Fehler beim Laden";
        }
        // Sleep Timeout
        const sleepTimeout: number = await getSleepTimeout();
        if (sleepTimeout != null) {
            this.sleepTimeoutElement.input.value =
                this.humanizeDuration(sleepTimeout);
            this.initialSleepTimeout = sleepTimeout;
        }
        // MQTT Timeout
        const mqttTimeout: number = await getMqttMessageTimeout();
        if (mqttTimeout != null) {
            this.mqttTimeoutElement.input.value =
                this.humanizeDuration(mqttTimeout);
            this.initialMqttTimeout = mqttTimeout;
        }
        // Config Mode Timeout
        const configTimeout: number = await getConfigurationModeTimeout();
        if (configTimeout != null) {
            this.configTimeoutElement.input.value =
                this.humanizeDuration(configTimeout);
            this.initialConfigTimeout = configTimeout;
        }
        // WatchDog Timeout
        const watchDogTimeout: number = await getWatchDogTimeout();
        if (watchDogTimeout != null) {
            this.watchDogTimeoutElement.input.value =
                this.humanizeDuration(watchDogTimeout);
            this.initialWatchDogTimeout = watchDogTimeout;
        }
        // LED Brightness
        const ledBrightness: number = await getLedBrightness();
        if (ledBrightness != null) {
            this.ledBrightnessElement.input.value = ledBrightness.toString();
            this.initialLedBrightness = ledBrightness;
        }
    }

    render() {
        return html`
            <title-element>Sensor-Konfiguration</title-element>
            <input-element-grid thirdColumn>
                <input-element
                    id="firmwareVersion"
                    label="Firmware Version"
                    initialValue="Noch nicht geladen"
                    ?readonly="${true}"
                ></input-element>
                <input-element
                    id="sleepTimeout"
                    label="Messintervall"
                    initialValue="Noch nicht geladen"
                ></input-element>
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Zeitintervall zwischen zwei Messungen (z.B. 1h, 30m, 10s).
                    Je größer das Intervall, desto weniger Strom verbraucht der
                    Sensor.
                </span>
                <input-element
                    id="mqttTimeout"
                    label="MQTT Timeout"
                    initialValue="Noch nicht geladen"
                ></input-element>
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Maximale Zeit, die gewartet wird, bis eine MQTT-Nachricht
                    erfolgreich gesendet wird. Sollte es Probleme während der
                    Home Assistant Verbindung geben, kann dieser Wert erhöht
                    werden.
                </span>
                <input-element
                    id="configTimeout"
                    label="Konfigurationsmodus Timeout"
                    initialValue="Noch nicht geladen"
                ></input-element>
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Hat sich innerhalb dieser Zeit während der Sensor im
                    Konfigurationsmodus ist kein Gerät mit dem Sensor verbunden,
                    wird der Konfigurationsmodus automatisch beendet.
                </span>
                <input-element
                    id="watchDogTimeout"
                    label="WatchDog Timeout"
                    initialValue="Noch nicht geladen"
                ></input-element>
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Nach dieser Zeit wird der Sensor im Sensormodus zurück in
                    den Tiefschlaf versetzt, damit er sich nicht aufhängt. Ist
                    der Wert zu niedrig, werden keine Daten mehr verschickt. Ist
                    er zu hoch, verbraucht der Sensor seinen gesamten Akku, wenn
                    er sich aufhängt.
                </span>
                <input-element
                    id="ledBrightness"
                    label="LED Helligkeit"
                    initialValue="0"
                    type="number"
                    min="0"
                    max="255"
                ></input-element>
                <span
                    style="grid-column: 1 / -1; color: var(--helper); font-size: 0.95em; margin-bottom: 0.75rem;"
                >
                    Helligkeit der Status-LED (0 = aus, 255 = maximal)
                </span>
            </input-element-grid>
            <text-element text="${this.errorText}"></text-element>
            <button-nav-element>
                <div>
                    <!-- Empty div to put submit button on the right side -->
                </div>
                <button-element
                    name="Speichern"
                    @click="${this.submit}"
                    ?secondary="${true}"
                    ?disabled="${loadingState.state > 0}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
