<script lang="ts">
  import { onMount } from 'svelte';

  let initialAmount = 1000;
  let monthlyInvestment = 100;
  let annualRate = 10; // em percentual
  let durationType: 'years' | 'months' = 'years';
  let duration = 5;

  // Regras adicionais
  let ruleType: '' | 'fixed-increase' | 'custom-dates' = '';
  let ruleFrequency: 'monthly' | 'yearly' = 'monthly';
  let ruleValueType: 'percent' | 'fixed' = 'fixed';
  let ruleValue = 0;

  type CustomRule = {
    fromMonth: number;
    newInvestment: number;
  };

  let customRules: CustomRule[] = [];
  let newRuleMonth = 1;
  let newRuleValue = 0;

  type MonthData = {
    month: number;
    total: number;
    monthlyYield: number;
    annualYieldIfStopped: number;
    cumulativeYield: number;
    invested: number;
  };

  type YearData = {
    year: number;
    months: MonthData[];
    total: number;
    cumulativeYield: number;
    invested: number;
    open: boolean;
  };

  let result: YearData[] = [];

  function addCustomRule() {
    if (newRuleMonth > 0 && newRuleValue >= 0) {
      customRules.push({ fromMonth: newRuleMonth, newInvestment: newRuleValue });
      newRuleMonth = 1;
      newRuleValue = 0;
    }
  }

  function calculate() {
    result = [];
    const months = durationType === 'years' ? duration * 12 : duration;
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    let total = initialAmount;
    let invested = initialAmount;
    let cumulativeYield = 0;
    let year = 1;
    let monthsData: MonthData[] = [];
    let currentMonthlyInvestment = monthlyInvestment;

    for (let i = 1; i <= months; i++) {
      // Aplicar regra de aumento fixo
      if (ruleType === 'fixed-increase') {
        const isPeriod = ruleFrequency === 'monthly' ? true : i % 12 === 1 && i !== 1;
        if (isPeriod && i !== 1) {
          if (ruleValueType === 'percent') {
            currentMonthlyInvestment += currentMonthlyInvestment * (ruleValue / 100);
          } else {
            currentMonthlyInvestment += ruleValue;
          }
        }
      }

      // Aplicar regras de datas personalizadas
      if (ruleType === 'custom-dates') {
        const matched = customRules.find(r => r.fromMonth === i);
        if (matched) {
          currentMonthlyInvestment = matched.newInvestment;
        }
      }

      const monthlyYield = total * monthlyRate;
      total += monthlyYield + currentMonthlyInvestment;
      invested += currentMonthlyInvestment;
      cumulativeYield = total - invested;
      const annualYieldIfStopped = total * annualRate / 100;

      monthsData.push({
        month: i,
        total,
        monthlyYield,
        annualYieldIfStopped,
        cumulativeYield,
        invested,
      });

      if (i % 12 === 0 || i === months) {
        result.push({
          year: year++,
          months: [...monthsData],
          total,
          cumulativeYield,
          invested,
          open: false,
        });
        monthsData = [];
      }
    }
  }
</script>

<style>
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1em;
  }
  th, td {
    border: 1px solid #ccc;
    padding: 0.5em;
    text-align: right;
  }
  th {
    background-color: #f0f0f0;
  }
  .clickable {
    cursor: pointer;
    background-color: #eef;
  }
  ul.rule-list {
    margin-top: 0.5em;
    padding-left: 1em;
  }
  ul.rule-list li {
    text-align: left;
  }
</style>

<div>
  <label>Montante Inicial: <input type="number" bind:value={initialAmount} /></label>
  <label>Investimento Mensal: <input type="number" bind:value={monthlyInvestment} /></label>
  <label>Taxa de Rendimento Anual (%): <input type="number" bind:value={annualRate} /></label>
  <label>
    Duração:
    <input type="number" bind:value={duration} />
    <select bind:value={durationType}>
      <option value="years">Anos</option>
      <option value="months">Meses</option>
    </select>
  </label>

  <hr />

  <div>
    <label>Adicionar Regra:
      <select bind:value={ruleType}>
        <option value="">Nenhuma</option>
        <option value="fixed-increase">Aumentar investimento mensal por valor fixo</option>
        <option value="custom-dates">Alterar investimento mensal em datas</option>
      </select>
    </label>

    {#if ruleType === 'fixed-increase'}
      <div>
        <label>Frequência:
          <select bind:value={ruleFrequency}>
            <option value="monthly">Todo mês</option>
            <option value="yearly">Todo ano</option>
          </select>
        </label>
        <label>Tipo de aumento:
          <select bind:value={ruleValueType}>
            <option value="percent">Porcentagem (%)</option>
            <option value="fixed">Valor fixo</option>
          </select>
        </label>
        <label>Valor do aumento: <input type="number" bind:value={ruleValue} /></label>
      </div>
    {/if}

    {#if ruleType === 'custom-dates'}
      <div>
        <label>Mês: <input type="number" bind:value={newRuleMonth} min="1" /></label>
        <label>Novo investimento: <input type="number" bind:value={newRuleValue} /></label>
        <button type="button" on:click={addCustomRule}>Adicionar Regra</button>

        <ul class="rule-list">
          {#each customRules as r, i}
            <li>🗓 A partir do mês {r.fromMonth}: investimento mensal será R$ {r.newInvestment.toFixed(2)}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>

  <button on:click={calculate}>Calcular</button>
</div>

{#if result.length}
  <table>
    <thead>
      <tr>
        <th>Ano</th>
        <th>Total</th>
        <th>Rendimento Acumulado</th>
        <th>Investido</th>
      </tr>
    </thead>
    <tbody>
      {#each result as yearData}
        <tr class="clickable" on:click={() => yearData.open = !yearData.open}>
          <td>{yearData.year}</td>
          <td>{yearData.total.toFixed(2)}</td>
          <td>{yearData.cumulativeYield.toFixed(2)}</td>
          <td>{yearData.invested.toFixed(2)}</td>
        </tr>
        {#if yearData.open}
          <tr>
            <td colspan="4">
              <table>
                <thead>
                  <tr>
                    <th>Mês</th>
                    <th>Total</th>
                    <th>Rend. Mensal</th>
                    <th>Rend. Anual (est.)</th>
                    <th>Rend. Acumulado</th>
                    <th>Investido</th>
                  </tr>
                </thead>
                <tbody>
                  {#each yearData.months as monthData}
                    <tr>
                      <td>{monthData.month}</td>
                      <td>{monthData.total.toFixed(2)}</td>
                      <td>{monthData.monthlyYield.toFixed(2)}</td>
                      <td>{monthData.annualYieldIfStopped.toFixed(2)}</td>
                      <td>{monthData.cumulativeYield.toFixed(2)}</td>
                      <td>{monthData.invested.toFixed(2)}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </td>
          </tr>
        {/if}
      {/each}
    </tbody>
  </table>
{/if}
