<script lang="ts">
  import { onMount } from "svelte";
  import VrmlViewer from "./lib/VRMLViewer.svelte";

  onMount(() => {
    // If clicked on any image, open it in a popover window
    const images = document.querySelectorAll(
      "main img"
    ) as NodeListOf<HTMLImageElement>;
    images.forEach((image) => {
      image.addEventListener("click", () => {
        const popover = document.createElement("div");
        popover.style.position = "fixed";
        popover.style.top = "0";
        popover.style.left = "0";
        popover.style.width = "100vw";
        popover.style.height = "100vh";
        popover.style.backgroundColor = "rgba(0,0,0,0.5)";
        popover.style.display = "flex";
        popover.style.justifyContent = "center";
        popover.style.alignItems = "center";
        popover.addEventListener("click", () => {
          document.body.removeChild(popover);
        });

        const img = document.createElement("img");
        img.src = image.src;
        img.style.maxWidth = "95vw";
        img.style.maxHeight = "95vh";
        img.style.cursor = "zoom-in";
        img.style.transformOrigin = "center center";

        let isZoomed = false;

        img.addEventListener("click", (event) => {
          if (isZoomed) {
            img.style.transform = "scale(1) translate(0, 0)";
            img.style.cursor = "zoom-in";
          } else {
            const scale = 5;
            const rect = img.getBoundingClientRect();
            const x = event.clientX - rect.left - 0.5 * rect.width;
            const y = event.clientY - rect.top - 0.5 * rect.height;
            const tx = -((scale - 1) / scale) * x;
            const ty = -((scale - 1) / scale) * y;
            img.style.transform = `scale(${scale}) translate(${tx}px, ${ty}px)`;
            img.style.cursor = "zoom-out";
          }
          isZoomed = !isZoomed;
          event.stopPropagation();
        });

        popover.appendChild(img);
        document.body.appendChild(popover);
      });
    });
  });
</script>

<header>
  <div class="logo">
    <img src="Logo.png" alt="ESPlant-Pages Logo" />
    <div>ESPlant</div>
  </div>
  <nav />
</header>
<main>
  <h1>ESPlant-Board v2.0 3d model</h1>
  <div class="vrml-container">
    <VrmlViewer src="https://raw.githubusercontent.com/Dennis960/ESPlant/bot/ESPlant-Board/dist/ESPlant-Board.wrl"/>
  </div>
  <h1>ESPlant-Board v1.0 Schematic</h1>
  <img
    src="https://raw.githubusercontent.com/Dennis960/ESPlant/bot/ESPlant-Board/v1.0/ESPlant-Board.svg"
    alt="SVG"
  />
</main>
<footer>
  Project on <a href="https://github.com/Dennis960/ESPlant">GitHub</a>
</footer>

<style>
  header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: #f0f0f0;
    padding: 2rem;
  }
  main {
    padding: 2rem;
  }
  footer {
    padding: 2rem;
    background-color: #f0f0f0;
    margin-top: auto;
  }
  h1 {
    margin-top: 3rem;
  }
  main img {
    max-width: 100%;
    cursor: pointer;
  }
  .logo {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
  }
  .logo img {
    height: 3rem;
  }
  .logo div {
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0;
    padding-left: 1rem;
  }
  .vrml-container {
    width: 30%;
    height: 50vh;
  }
</style>
