<script lang="ts">
	import TutorialPage from '$lib/components/tutorial/tutorial-page.svelte';
	import { default as IconBattery } from '@tabler/icons-svelte/icons/battery';
	import { default as IconBattery2 } from '@tabler/icons-svelte/icons/battery-2';
	import { default as IconBellRinging } from '@tabler/icons-svelte/icons/bell-ringing';
	import { default as IconBox } from '@tabler/icons-svelte/icons/box';
	import { default as IconDeviceDesktop } from '@tabler/icons-svelte/icons/device-desktop';
	import { default as IconWifi } from '@tabler/icons-svelte/icons/wifi';
	import { default as IconWorld } from '@tabler/icons-svelte/icons/world';
	import { default as IconShovel } from '@tabler/icons-svelte/icons/shovel';

	const steps = [
		{
			icon: IconBox,
			title: 'Sensor auspacken',
			desc: 'Nimm deinen Blumy-Sensor vorsichtig aus der Verpackung. Überprüfe, ob alle Teile (Sensor, Anleitung, ggf. Zubehör) vorhanden und unbeschädigt sind.'
		},
		{
			icon: IconBattery,
			title: 'Batteriefach öffnen',
			desc: 'Öffne das Batteriefach auf der Rückseite des Sensors, indem du die Abdeckung vorsichtig abnimmst. Achte darauf, keine Bauteile zu beschädigen.'
		},
		{
			icon: IconBattery2,
			title: 'Zwei AAA-Batterien einlegen',
			desc: 'Setze zwei neue AAA-Batterien in das Fach ein. Achte dabei auf die richtige Ausrichtung der Pole (+/-), wie im Batteriefach angegeben.'
		},
		{
			icon: IconBellRinging,
			title: 'Sensor einschalten',
			desc: 'Nach dem Einlegen der Batterien gibt der Sensor einen Signalton ab und die LEDs leuchten kurz auf. Falls dies nicht geschieht, drücke den linken Knopf, um den Sensor zu starten.'
		},
		{
			icon: IconWifi,
			title: 'Mit WLAN verbinden',
			desc: 'Öffne die WLAN-Einstellungen auf deinem Computer oder Smartphone und verbinde dich mit dem neuen Netzwerk namens "Blumy". Es ist kein Passwort erforderlich.'
		},
		{
			icon: IconDeviceDesktop,
			title: 'Einrichtungsseite öffnen',
			desc: 'Gib im Browser die Adresse <code>192.168.4.1</code> ein, um die Konfigurationsseite des Sensors zu öffnen. Stelle sicher, dass du mit dem "Blumy"-WLAN verbunden bist.'
		},
		{
			icon: IconWorld,
			title: 'Einrichtung abschließen',
			desc: 'Folge den Anweisungen auf der Webseite, um deinen Sensor mit deinem Heimnetzwerk zu verbinden und die Einrichtung abzuschließen. Nach erfolgreicher Einrichtung ist der Sensor einsatzbereit.'
		},
		{
			icon: IconShovel,
			title: 'Sensor in die Erde stecken',
			desc: 'Stecke den Blumy-Sensor vorsichtig mit den Messspitzen in die Erde deiner Pflanze. Achte darauf, dass die Messspitzen vollständig im Boden stecken und der Sensor stabil steht.'
		}
	];
</script>

<TutorialPage
	title="Erste Schritte mit deinem Blumy-Sensor"
	description="In dieser Anleitung erfährst du, wie du deinen Blumy-Sensor in wenigen Schritten einrichtest und startklar machst."
	{steps}
/>
