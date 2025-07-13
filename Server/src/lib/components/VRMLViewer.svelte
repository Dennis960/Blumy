<script lang="ts">
	import { browser } from '$app/environment';
	import { clientApi } from '$lib/client/api';
	import { onDestroy, onMount } from 'svelte';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
	import { VRMLLoader } from 'three/addons/loaders/VRMLLoader.js';

	interface Props {
		class?: string;
		style?: string;
	}

	let { class: className = '', ...rest }: Props = $props();

	let canvasContainer: HTMLDivElement = $state()!;
	let renderer: THREE.WebGLRenderer;
	let scene: THREE.Scene = $state()!;
	let camera: THREE.PerspectiveCamera;
	let animation: number;
	let controls: OrbitControls = $state()!;
	let lastPixelRatio: number;

	function centerCamera(object: THREE.Object3D) {
		const box = new THREE.Box3().setFromObject(object);
		const center = new THREE.Vector3();
		box.getCenter(center);
		const size = box.getSize(new THREE.Vector3()).length();
		const cameraPos = new THREE.Vector3(size, size, size);
		camera.position.copy(cameraPos);
		camera.lookAt(center);
		controls.target.copy(center);
		controls.update();
	}

	function updateRendererSize() {
		if (
			canvasContainer.clientWidth !== renderer.domElement.width ||
			canvasContainer.clientHeight !== renderer.domElement.height
		) {
			renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
			camera.aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
			camera.updateProjectionMatrix();
		}
	}

	function updateRenderQuality() {
		let pixelRatio = window.devicePixelRatio;
		if (pixelRatio !== lastPixelRatio) {
			renderer.setPixelRatio(pixelRatio);
			lastPixelRatio = pixelRatio;
		}
	}

	function addLighting() {
		const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
		scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
		directionalLight.position.set(5, 10, 5);
		scene.add(directionalLight);
	}

	async function loadVrmlFromBlob() {
		const blob = await clientApi().blumyWrl().parse();
		const objectUrl = URL.createObjectURL(blob);

		const loader = new VRMLLoader();

		loader.load(
			objectUrl,
			(object) => {
				scene.clear();
				addLighting();

				scene.add(object);
				centerCamera(object);
			},
			undefined,
			(error) => {
				console.error('VRML load error:', error);
			}
		);
	}

	onMount(() => {
		renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
		scene = new THREE.Scene();
		loadVrmlFromBlob();
		renderer.setPixelRatio(window.devicePixelRatio);
		canvasContainer.appendChild(renderer.domElement);

		camera = new THREE.PerspectiveCamera(
			45,
			canvasContainer.clientWidth / canvasContainer.clientHeight,
			1,
			10000
		);
		updateRendererSize();

		controls = new OrbitControls(camera, renderer.domElement);
		controls.autoRotate = true;
		controls.autoRotateSpeed = 10;
		controls.enableZoom = false;
		controls.enablePan = false;
		controls.enableRotate = false;

		const animate = () => {
			animation = requestAnimationFrame(animate);
			updateRendererSize();
			updateRenderQuality();
			controls.update();
			renderer.render(scene, camera);
		};
		animate();
	});

	onDestroy(() => {
		if (!browser) return;
		renderer.dispose();
		cancelAnimationFrame(animation);
	});
</script>

<div id="canvas-container" bind:this={canvasContainer} class={className} {...rest}></div>
