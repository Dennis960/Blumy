<script lang="ts">
  export let icon: string;
  export let size: number = 48;
</script>

<img
  class="no-responsive no-border icon-img"
  src={icon}
  alt={icon[0]}
  style={`width: ${size}px; height: ${size}px`}
/>

<style>
  img {
    color: black;
  }
</style>
