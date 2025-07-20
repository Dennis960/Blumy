import { plantnowHasReceivedPeerMac } from "./api";

let timeoutId: number | undefined;
let ignoredMACs: string[] = [];
async function pollMAC(onMACAccepted: (mac: string) => void) {
    const mac = await plantnowHasReceivedPeerMac();
    if (!mac || ignoredMACs.includes(mac)) {
        return;
    }
    const shouldAddMac = window.confirm(
        `Blumy mit MAC-Adresse ${mac} möchte sich verbinden. Möchtest du die Verbindung zulassen?`
    );
    ignoredMACs.push(mac);
    if (shouldAddMac) {
        onMACAccepted(mac);
    }
}

export async function startPollMACInterval(
    onMACAccepted: (mac: string) => void = () => {}
) {
    await pollMAC(onMACAccepted);
    timeoutId = window.setTimeout(() => {
        startPollMACInterval(onMACAccepted);
    }, 2000);
}

export function stopPollMACInterval() {
    if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = undefined;
    }
    ignoredMACs = [];
}

export function addIgnoredMAC(mac: string) {
    ignoredMACs.push(mac);
}
