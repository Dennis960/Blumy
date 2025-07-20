<script lang="ts">
	import TutorialPage from '$lib/components/tutorial/tutorial-page.svelte';
	import { default as IconBattery } from '@tabler/icons-svelte/icons/battery';
	import { default as IconBattery2 } from '@tabler/icons-svelte/icons/battery-4';
	import { default as IconDeviceMobile } from '@tabler/icons-svelte/icons/device-mobile';
	import { default as IconPower } from '@tabler/icons-svelte/icons/power';
	import { default as IconShovel } from '@tabler/icons-svelte/icons/shovel';
	import { default as IconWifi } from '@tabler/icons-svelte/icons/wifi';
	import { default as IconChecklist } from '@tabler/icons-svelte/icons/checklist';

	const steps = [
		{
			icon: IconBattery,
			title: 'Batteriefach öffnen',
			desc: 'Öffne das Batteriefach auf der Rückseite des Sensors, indem du die Abdeckung nach unten schiebst.'
		},
		{
			icon: IconBattery2,
			title: 'Zwei AAA-Batterien einlegen',
			desc: 'Setze zwei neue AAA-Batterien in das Fach ein. Achte dabei auf die richtige Ausrichtung der Pole (+/-), wie im Batteriefach angegeben.'
		},
		{
			icon: IconPower,
			title: 'Sensor einschalten',
			desc: 'Nach dem Einlegen der Batterien gibt der Sensor einen Signalton ab und die LEDs leuchten auf. Falls dies nicht geschieht, betätige den linken Knopf, um den Sensor zu starten.'
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
			icon: IconChecklist,
			title: 'Einrichtung abschließen',
			desc: 'Folge den Anweisungen auf der Webseite, um deinen Sensor mit deinem Heimnetzwerk zu verbinden und die Einrichtung abzuschließen. Nach erfolgreicher Einrichtung ist der Sensor einsatzbereit.'
		},
		{
			icon: IconShovel,
			title: 'Sensor in die Erde stecken',
			desc: 'Stecke den Blumy-Sensor vorsichtig mit der Messspitze in die Erde deiner Pflanze. Achte darauf, dass die Messspitze vollständig im Boden steckt (bis zur weißen Linie) und der Sensor stabil steht.'
		}
	];
</script>

<TutorialPage
	title="Erste Schritte mit deinem Blumy-Sensor"
	description="In dieser Anleitung erfährst du, wie du deinen Blumy-Sensor in wenigen Schritten einrichtest und startklar machst."
	{steps}
/>
