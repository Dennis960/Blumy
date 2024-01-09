<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { VRMLLoader } from "three/examples/jsm/loaders/VRMLLoader.js";
  import * as THREE from "three";
  // @ts-ignore
  import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

  export let src: string;

  let canvasContainer: HTMLDivElement;
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  const scene = new THREE.Scene();
  let camera: THREE.PerspectiveCamera;
  let rotateAnimation: number;
  let animation: number;
  let object: THREE.Object3D;

  const autoRotateObj = () => {
    rotateAnimation = requestAnimationFrame(autoRotateObj);
    if (object != undefined) {
      object.rotation.y += 0.01;
    }
  };

  onMount(() => {
    // setup //
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasContainer.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
      45,
      canvasContainer.clientWidth / canvasContainer.clientHeight,
      1,
      10000
    );

    camera.position.set(5, 4, 4);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.update();

    const light = new THREE.AmbientLight(0xffffff, 2);
    scene.add(light);

    let loader = new VRMLLoader();
    loader.load(src, (obj) => {
      scene.add(obj);
      object = obj;
      // move the object to the center of the scene
      obj.position.y = -0.5;

      autoRotateObj();
    });

    renderer.render(scene, camera);

    canvasContainer.addEventListener("mouseenter", () => {
      cancelAnimationFrame(rotateAnimation);
    });
    canvasContainer.addEventListener("mouseleave", () => {
      autoRotateObj();
    });

    const animate = () => {
      animation = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();
  });
  onDestroy(() => {
    renderer.dispose();
    cancelAnimationFrame(rotateAnimation);
    cancelAnimationFrame(animation);
  });
</script>

<div id="canvas-container" bind:this={canvasContainer} />

<style>
  #canvas-container {
    width: 100%;
    height: 100%;
    border: 5px solid black;
    border-radius: 5px;
  }
</style>
