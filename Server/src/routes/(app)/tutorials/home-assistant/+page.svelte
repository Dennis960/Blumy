<script lang="ts">
	import TutorialPage from '$lib/components/tutorial/tutorial-page.svelte';
	import { default as IconBattery2 } from '@tabler/icons-svelte/icons/battery-2';
	import { default as IconBellRinging } from '@tabler/icons-svelte/icons/bell-ringing';
	import { default as IconChecklist } from '@tabler/icons-svelte/icons/checklist';
	import { default as IconDeviceDesktop } from '@tabler/icons-svelte/icons/device-desktop';
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
			icon: IconBellRinging,
			title: 'Home Assistant MQTT Integration',
			desc: `Stelle sicher, dass die MQTT-Integration in Home Assistant aktiviert ist.<br>
            Solltest du nicht wissen, wie du MQTT in Home Assistant einrichtest, findest du eine Anleitung auf der <a href="https://www.home-assistant.io/integrations/mqtt/" target="_blank">offiziellen Website</a>.`
		},
		{
			icon: IconBattery2,
			title: 'Sensor Konfigurieren',
			desc: 'Schalte den Sensor ein. Halte danach die linke Taste gedrückt, um den Konfigurationsmodus zu aktivieren. Die LEDs sollten aufleuchten und ein Signalton ertönt.'
		},
		{
			icon: IconWifi,
			title: 'Mit WLAN verbinden',
			desc: 'Verbinde dich mit dem WLAN namens "Blumy".'
		},
		{
			icon: IconDeviceDesktop,
			title: 'Einrichtungsseite öffnen',
			desc: 'Öffne im Browser <code>192.168.4.1</code>, um die Konfigurationsseite zu erreichen.'
		},
		{
			icon: IconWorld,
			title: 'MQTT Einstellungen eintragen',
			desc: `Beginne das Setup und trage auf der Konfigurationsseite die Daten deines MQTT-Brokers ein:<br>
                <ul>
                    <li><b>Sensor Id:</b> Eindeutige ID für deinen Sensor, z.B. <code>1</code>, diese wird in Home Assistant zum Sensornamen zugefügt</li>
                    <li><b>MQTT Server:</b> IP-Adresse deines Home Assistant MQTT-Brokers, z.B. <code>192.168.2.22</code></li>
                    <li><b>Port:</b> Standard ist meist 1883</li>
                    <li><b>Benutzername & Passwort:</b> (falls gesetzt), ansonsten leer lassen</li>
                </ul>
                Speichere die Einstellungen. Der Sensor sollte nun in deinem Home Assistant Dashboard erscheinen.
				Sollte der Sensor nicht erscheinen, überprüfe die MQTT-Einstellungen und stelle sicher, dass der Sensor korrekt mit dem WLAN verbunden ist.`
		},
		{
			icon: IconChecklist,
			title: 'Fertig!',
			desc: 'Beende das Setup und schalte den Sensor so in den Sensormodus. Dein Sensor sendet nun Daten über MQTT an Home Assistant. Du kannst ihn jetzt in Automatisierungen und Dashboards verwenden.'
		}
	];
</script>

<TutorialPage
	title="Home Assistant Integration"
	description="In dieser Anleitung erfährst du, wie du deinen Blumy-Sensor mit Home Assistant verbindest und die MQTT-Integration einrichtest."
	{steps}
/>
