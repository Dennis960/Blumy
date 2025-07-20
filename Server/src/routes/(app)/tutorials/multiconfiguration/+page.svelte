<script lang="ts">
	import TutorialPage from '$lib/components/tutorial/tutorial-page.svelte';
	import { route } from '$lib/ROUTES';
	import { default as IconChecklist } from '@tabler/icons-svelte/icons/checklist';
	import { default as IconDeviceMobile } from '@tabler/icons-svelte/icons/device-mobile';
	import { default as IconPower } from '@tabler/icons-svelte/icons/power';
	import { default as IconWifi } from '@tabler/icons-svelte/icons/wifi';

	const steps = [
		{
			icon: IconChecklist,
			title: 'Den ersten Sensor einrichten',
			desc: `Richte den ersten sensor ein, wie in der Anleitung <a href="${route('/tutorials/getting-started')}">Erste Schritte</a> beschrieben.`
		},
		{
			icon: IconPower,
			title: 'Sensor anschalten',
			desc: 'Hast du den konfigurierten Sensor ausgeschaltet, schalte ihn wieder ein. Betätige dafür kurz die linke Taste, um den Konfigurationsmodus zu aktivieren. Die LEDs sollten aufleuchten und ein Signalton ertönt.'
		},
		{
			icon: IconWifi,
			title: 'Mit WLAN verbinden',
			desc: 'Öffne die WLAN-Einstellungen auf deinem Computer oder Smartphone und verbinde dich mit dem neuen Netzwerk namens "Blumy". Es ist kein Passwort erforderlich.'
		},
		{
			icon: IconDeviceMobile,
			title: 'Einrichtungsseite öffnen',
			desc: 'Gib im Browser die Adresse <a href="http://192.168.4.1"><code>192.168.4.1</code></a> ein, um die Konfigurationsseite des Sensors zu öffnen. Stelle sicher, dass du mit dem "Blumy"-WLAN verbunden bist.'
		},
		{
			icon: IconPower,
			title: 'Einen weiteren Sensor anschalten',
			desc: 'Schalte nun einen weiteren Sensor ein, indem du Batterien einlegst und die linke Taste betätigst. Die LEDs des zweiten Sensors sollten gleichzeitig rot und grün leuchten. Der Sensor ist bereit zur Konfiguration.'
		},
		{
			icon: IconChecklist,
			title: 'Den zweiten Sensor einrichten',
			desc: 'Auf der Konfiugrationsseite sollte nun eine Meldung kommen <bold>Blumy möchte sich verbinden. Möchtest du die Verbindung zulassen?</bold> Klicke auf "Ja", um den zweiten Sensor zu konfigurieren. Folge den Anweisungen auf der Webseite.'
		}
	];
</script>

<TutorialPage
	title="Mehrere Sensoren auf einmal einrichten"
	description="In dieser Anleitung erfährst du, wie du mehrere Blumy-Sensoren gleichzeitig einrichtest und startklar machst."
	{steps}
/>
