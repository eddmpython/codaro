<script lang="ts">
  import ComponentStub from "./ComponentStub.svelte";

  let props = $props();
</script>

<ComponentStub label="task-list" {...props} />
