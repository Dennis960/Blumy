import { getPlantName, getSensorId, getSleepTimeout, setPlantName, setSensorId, setSleepTimeout } from "../api";
import { html } from "lit";
import { property, query, customElement, state } from "lit/decorators.js";
import { BasePage } from "./base-page";
import { InputElement } from "./page-elements/input-element";
import { funnyPlantNames } from "./funny-plant-names";
import timestring from "timestring";

@customElement("name-page")
export class NamePage extends BasePage {
    @property({ type: String }) onlineStatus: string;
    @query("#name") nameElement: InputElement;
    @query("#id") idElement: InputElement;
    @query("#sleepTimeout") sleepTimeoutElement: InputElement;
    @state() errorText: string = "";

    generateRandomName() {
        const name =
            funnyPlantNames[Math.floor(Math.random() * funnyPlantNames.length)];
        this.nameElement.input.value = name;
        return name;
    }
    setIdToDate() {
        const id = Date.now();
        this.idElement.input.value = String(id);
        return id;
    }

    async submit() {
        let name = this.nameElement.input.value ?? "";
        const id =
            this.idElement.input.value.length == 0
                ? Date.now()
                : Number(this.idElement.input.value);
        let sleepTimeoutString = this.sleepTimeoutElement.input.value;
        if (sleepTimeoutString.length == 0) {
            // Default to 1 hour
            sleepTimeoutString = "1h";
            this.sleepTimeoutElement.input.value = sleepTimeoutString;
        }
        const sleepTimeout = timestring(sleepTimeoutString, "ms");

        this.idElement.input.value = id.toString();
        if (name.length == 0) {
            name = this.generateRandomName();
        }
        if (name.length > 32) {
            this.errorText = "Name muss zwischen 1 und 32 Zeichen lang sein";
            return;
        }
        if (typeof id !== "number" || id < 0 || id > Number.MAX_SAFE_INTEGER) {
            this.errorText = `Sensor-ID muss eine Zahl zwischen 0 und ${Number.MAX_SAFE_INTEGER} sein`;
            return;
        }
        this.errorText = "";
        const plantNameResponse = await setPlantName(name);
        const sensorIdResponse = await setSensorId(id);
        const sleepTimeoutResponse = await setSleepTimeout(sleepTimeout);

        if (
            !plantNameResponse.ok ||
            !sensorIdResponse.ok ||
            !sleepTimeoutResponse.ok
        ) {
            this.errorText = "Fehler, Gerät antwortet nicht";
            return;
        }
        this.next();
    }

    async firstUpdated() {
        const plantName = await getPlantName();
        const id = await getSensorId();
        const sleepTimeout = await getSleepTimeout();
        if (plantName != null) {
            this.nameElement.input.value = plantName;
        }
        if (id != null) {
            this.idElement.input.value = String(id);
        }
        if (sleepTimeout != null) {
            this.sleepTimeoutElement.input.value = `${sleepTimeout} ms`;
        }
    }

    render() {
        return html`
            <title-element>Wähle einen Namen für deine Pflanze</title-element>
            <input-element-grid>
                <input-element id="name" label="Name">
                    <button-element
                        name="Zufällig"
                        @click="${this.generateRandomName}"
                        ?secondary="${false}"
                    ></button-element>
                </input-element>
                <input-element id="id" type="number" label="Sensor-ID">
                    <button-element
                        name="Zeit"
                        @click="${this.setIdToDate}"
                        ?secondary="${false}"
                    ></button-element>
                </input-element>
                <input-element
                    id="sleepTimeout"
                    label="Messinterval"
                    initialValue="30 min"
                >
                </input-element>
            </input-element-grid>
            <error-text-element text="${this.errorText}"></error-text-element>
            <description-element
                >Leere Werte werden beim Speichern durch Standardwerte ersetzt.</description-element
            >
            <button-nav-element>
                <button-element
                    name="Zurück"
                    @click="${this.back}"
                    ?secondary="${false}"
                ></button-element>
                <button-element
                    name="Überspringen"
                    @click="${this.next}"
                    ?secondary="${true}"
                ></button-element>
                <button-element
                    name="Speichern"
                    @click="${this.submit}"
                    ?secondary="${true}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
