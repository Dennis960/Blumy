<script lang="ts">
	import TutorialPage from '$lib/components/tutorial/tutorial-page.svelte';
	import { default as IconPower } from '@tabler/icons-svelte/icons/power';
	import { default as IconPlugConnected } from '@tabler/icons-svelte/icons/plug-connected';
	import { default as IconChecklist } from '@tabler/icons-svelte/icons/checklist';
	import { default as IconDeviceMobile } from '@tabler/icons-svelte/icons/device-mobile';
	import { default as IconWifi } from '@tabler/icons-svelte/icons/wifi';
	import { default as IconWorld } from '@tabler/icons-svelte/icons/world';

	const steps: {
		icon: any;
		img?: string;
		imgAlt?: string;
		title: string;
		desc: string;
	}[] = [
		{
			icon: IconPlugConnected,
			title: 'Home Assistant MQTT Integration',
			desc: `Stelle sicher, dass die MQTT-Integration in Home Assistant aktiviert ist.<br>
            Solltest du nicht wissen, wie du MQTT in Home Assistant einrichtest, findest du eine Anleitung auf der <a href="https://www.home-assistant.io/integrations/mqtt/" target="_blank">offiziellen Website</a>.`
		},
		{
			icon: IconPower,
			title: 'Sensor einschalten',
			desc: 'Schalte den Sensor ein. Betätige dafür kurz die linke Taste, um den Konfigurationsmodus zu aktivieren. Die LEDs sollten aufleuchten und ein Signalton ertönt.'
		},
		{
			icon: IconWifi,
			title: 'Mit WLAN verbinden',
			desc: 'Verbinde dich mit dem WLAN namens "Blumy".'
		},
		{
			icon: IconDeviceMobile,
			title: 'Einrichtungsseite öffnen',
			desc: 'Gib im Browser die Adresse <a href="http://192.168.4.1"><code>192.168.4.1</code></a> ein, um die Konfigurationsseite des Sensors zu öffnen. Stelle sicher, dass du mit dem "Blumy"-WLAN verbunden bist.'
		},
		{
			icon: IconWorld,
			title: 'MQTT Einstellungen eintragen',
			desc: `Beginne das Setup und trage auf der Konfigurationsseite die Daten deines MQTT-Brokers ein:<br>
                <ul>
                    <li><b>Sensor Id:</b> Eindeutige ID für deinen Sensor, z.B. <code>1</code>, diese wird in Home Assistant zum Sensornamen zugefügt</li>
                    <li><b>MQTT Server:</b> IP-Adresse oder Domäne deines Home Assistant MQTT-Brokers, z.B. <code>192.168.2.22</code> oder <code>mqtt.example.com</code></li>
                    <li><b>Port:</b> Standard ist meist 1883</li>
                    <li><b>Benutzername & Passwort:</b> (falls gesetzt), ansonsten leer lassen</li>
					<li><b>Client Id:</b> Eindeutige Client-ID für den Sensor, z.B. <code>blumy-sensor-1</code>, diese wird nur benötigt, wenn dein MQTT-Broker Client-IDs verlangt</li>
                </ul>
                Speichere die Einstellungen. Der Sensor sollte nun in deinem Home Assistant Dashboard erscheinen.
				Sollte der Sensor nicht erscheinen, überprüfe die MQTT-Einstellungen und stelle sicher, dass der Sensor korrekt mit dem WLAN verbunden ist.`
		},
		{
			icon: IconChecklist,
			title: 'Fertig!',
			desc: 'Beende das Setup. Der Sensor geht nun in den Sensormodus und sendet Daten über MQTT an Home Assistant. Du kannst ihn jetzt in Automatisierungen und Dashboards verwenden.'
		}
	];
</script>

<TutorialPage
	title="Home Assistant Integration"
	description="In dieser Anleitung erfährst du, wie du deinen Blumy-Sensor mit Home Assistant verbindest und die MQTT-Integration einrichtest."
	{steps}
/>
