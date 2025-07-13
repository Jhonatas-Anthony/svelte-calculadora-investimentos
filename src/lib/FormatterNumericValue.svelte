<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';

  export let value: number | string = '';
  export let placeholder = '';
  export let name = '';

  const dispatch = createEventDispatcher();

  let inputValue = '';

  // Formatar ao montar
  onMount(() => {
    inputValue = format(value);
  });

  // Formatador local (pt-BR)
  function format(val: number | string): string {
    const num = Number(val);
    return isNaN(num)
      ? ''
      : num.toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  }

  function unformat(val: string): number {
    const cleaned = val.replace(/\./g, '').replace(',', '.');
    return Number(cleaned);
  }

  function handleInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;

    const unformatted = unformat(raw);
    inputValue = format(unformatted);

    // Dispara evento com o valor real (não formatado)
    dispatch('change', unformatted);
  }
</script>

<input
  type="text"
  bind:value={inputValue}
  placeholder={placeholder}
  name={name}
  on:input={handleInput}
/>

<style>
  input {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    width: 100%;
  }
</style>
