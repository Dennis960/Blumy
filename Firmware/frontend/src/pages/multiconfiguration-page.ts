import { StateController } from "@lit-app/state";
import { css, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { plantnowSendCloudSetupBlumy, plantnowSendCredentials } from "../api";
import {
    addIgnoredMAC,
    startPollMACInterval,
    stopPollMACInterval,
} from "../plantnow";
import { loadingState } from "../states";
import { BasePage } from "./base-page";

@customElement("multiconfiguration-page")
export class MulticonfigurationPage extends BasePage {
    @state()
    errorText: string = "";
    @state()
    mac: string | null = null;
    @state()
    wifiSent: boolean = false;
    @state()
    cloudSetupBlumySent: boolean = false;

    loadingStateController = new StateController(this, loadingState);

    static styles = css`
        :host {
            display: flex;
            flex-direction: column;
            row-gap: 1rem;
        }
    `;

    exitMulticonfiguration() {
        location.href = location.origin;
    }

    async sendWifiCredentials() {
        loadingState.state++;
        const success = await plantnowSendCredentials();
        if (!success) {
            this.errorText =
                "Fehler beim Senden der Anmeldedaten. Bitte starte den Blumy Sensor neu und versuche es erneut.";
        } else {
            this.wifiSent = true;
        }
        loadingState.state--;
    }

    async sendCloudSetupBlumy(url: string, token: string) {
        loadingState.state++;
        const success = await plantnowSendCloudSetupBlumy({
            url: url,
            token: token,
        });
        if (!success) {
            this.errorText =
                "Fehler beim Senden der Konfiguration. Versuche es erneut oder starte den Sensor neu.";
        } else {
            this.cloudSetupBlumySent = true;
            location.href = `${location.origin}/?page=multiconfiguration&done=true`;
        }
        loadingState.state--;
    }

    async handleExternalSetup() {
        const redirectUrl = new URL(location.origin);
        redirectUrl.searchParams.set("page", "multiconfiguration");
        redirectUrl.searchParams.set("mac", this.mac || "");
        const blumyUrl = new URL("https://blumy.cloud/selector");
        blumyUrl.searchParams.set("redirect", redirectUrl.toString());
        location.href = blumyUrl.toString();
    }

    dotClicked(event: CustomEvent<number>) {
        const dot: number = event.detail;
        if (dot === 0) {
            this.wifiSent = false;
            this.cloudSetupBlumySent = false;
        } else if (dot === 1) {
            this.wifiSent = true;
            this.cloudSetupBlumySent = false;
        } else {
            this.wifiSent = true;
            this.cloudSetupBlumySent = true;
        }
    }

    connectedCallback(): void {
        super.connectedCallback();
        const searchParams = new URLSearchParams(location.search);
        this.mac = searchParams.get("mac");
        if (this.mac) {
            addIgnoredMAC(this.mac);
        } else {
            startPollMACInterval((mac) => {
                this.mac = mac;
                const url = new URL(location.href);
                url.searchParams.set("mac", mac);
                url.searchParams.delete("done");
                this.wifiSent = false;
                this.cloudSetupBlumySent = false;
                history.replaceState({}, "", url.toString());
                this.errorText = "";
            });
        }
        if (searchParams.has("token") && searchParams.has("blumyUrl")) {
            this.wifiSent = true;
            this.sendCloudSetupBlumy(
                searchParams.get("blumyUrl") || "",
                searchParams.get("token") || ""
            );
        }
        if (searchParams.has("done")) {
            this.wifiSent = true;
            this.cloudSetupBlumySent = true;
        }
    }

    disconnectedCallback(): void {
        super.disconnectedCallback();
        stopPollMACInterval();
    }

    render() {
        return html`
            <dots-stepper-element
                numberOfDots="3"
                currentDot="${!this.wifiSent
                    ? "0"
                    : !this.cloudSetupBlumySent
                    ? "1"
                    : "2"}"
                @dotClicked="${this.dotClicked}"
            ></dots-stepper-element>
            <title-element>Multikonfigurationsmodus</title-element>
            <description-element>
                ${this.mac
                    ? `Verbundenes Blumy Gerät: ${this.mac}`
                    : "Kein Blumy Gerät verbunden."}
            </description-element>
            ${this.mac || (this.wifiSent && this.cloudSetupBlumySent)
                ? html`
                      ${!this.wifiSent
                          ? html`
                                <button-element
                                    name="WLAN Anmeldedaten senden"
                                    @click="${this.sendWifiCredentials}"
                                    ?secondary="${true}"
                                    ?disabled="${loadingState.state > 0}"
                                ></button-element>
                                <span>
                                    Dadurch werden die aktuellen WLAN
                                    Anmeldedaten an den Blumy Sensor gesendet.
                                </span>
                            `
                          : !this.cloudSetupBlumySent
                          ? html`
                                <button-element
                                    name="Über die Blumy Cloud einrichten"
                                    @click="${this.handleExternalSetup}"
                                    ?secondary="${true}"
                                    ?disabled="${loadingState.state > 0}"
                                ></button-element>
                                <span>
                                    Dadurch wird der Blumy Sensor mit der Blumy
                                    Cloud verbunden.
                                </span>
                            `
                          : html`
                                <text-element
                                    text="Blumy wurde erfolgreich eingerichtet."
                                    color="success"
                                ></text-element>
                            `}
                      <text-element text="${this.errorText}"></text-element>
                  `
                : ""}
            <button-nav-element>
                <button-element
                    name="Zurück zur Startseite"
                    @click="${this.exitMulticonfiguration}"
                    ?secondary="${false}"
                ></button-element>
            </button-nav-element>
        `;
    }
}
