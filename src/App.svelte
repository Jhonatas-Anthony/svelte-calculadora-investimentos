<script lang="ts">
  let initialAmount = 1000;
  let monthlyInvestment = 100;
  let annualRate = 10; // em percentual
  let durationType: "years" | "months" = "years";
  let duration = 5;

  // Regra adicional
  let ruleType: "" | "fixed-increase" = "";
  let ruleFrequency: "monthly" | "yearly" = "monthly";
  let ruleValueType: "percent" | "fixed" = "fixed";
  let ruleValue = 10;

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

  function calculate() {
    result = [];
    const months = durationType === "years" ? duration * 12 : duration;
    const monthlyRate = Math.pow(1 + annualRate / 100, 1 / 12) - 1;
    let total = initialAmount;
    let invested = initialAmount;
    let cumulativeYield = 0;
    let year = 1;
    let monthsData: MonthData[] = [];
    let currentMonthlyInvestment = monthlyInvestment;

    for (let i = 1; i <= months; i++) {
      if (ruleType === "fixed-increase") {
        const isPeriod =
          ruleFrequency === "monthly" ? true : i % 12 === 1 && i !== 1;

        if (isPeriod && i !== 1) {
          if (ruleValueType === "percent") {
            currentMonthlyInvestment +=
              currentMonthlyInvestment * (ruleValue / 100);
          } else {
            currentMonthlyInvestment += ruleValue;
          }
        }
      }

      const monthlyYield = total * monthlyRate;
      total += monthlyYield + currentMonthlyInvestment;
      invested += currentMonthlyInvestment;
      cumulativeYield = total - invested;
      const annualYieldIfStopped = (total * annualRate) / 100;

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

  function clearRules() {
    ruleType = "";
    ruleFrequency = "monthly";
    ruleValueType = "fixed";
    ruleValue = 0;
  }
</script>

<div id="container">
  <div id="form">
    <label
      >Montante Inicial: <input
        type="number"
        bind:value={initialAmount}
      /></label
    >
    <label
      >Investimento Mensal: <input
        type="number"
        bind:value={monthlyInvestment}
      /></label
    >
    <label
      >Taxa de Rendimento Anual (%): <input
        type="number"
        bind:value={annualRate}
      /></label
    >
    <label>
      Duração:
      <!-- <span> -->
      <input type="number" bind:value={duration} />
      <select bind:value={durationType}>
        <option value="years">Anos</option>
        <option value="months">Meses</option>
      </select>
      <!-- </span> -->
    </label>

    <div style="display: flex; flex-direction: column; gap: 1rem;">
      <label>
        Adicionar Regra:
        <select bind:value={ruleType}>
          <option value="">Nenhuma</option>
          <option value="fixed-increase">
            Aumentar investimento mensal
          </option>
        </select>
      </label>

      {#if ruleType === "fixed-increase"}
        <div>
          <label>
            Frequência:
            <select bind:value={ruleFrequency}>
              <option value="monthly">Todo mês</option>
              <option value="yearly">Todo ano</option>
            </select>
          </label>

          <label>
            Tipo de aumento:
            <select bind:value={ruleValueType}>
              <option value="percent">Porcentagem (%)</option>
              <option value="fixed">Valor fixo</option>
            </select>
          </label>

          <label>
            Valor do aumento:
            <input type="number" bind:value={ruleValue} />
          </label>

          <button on:click={clearRules} style="margin-top: 0.5rem;" id="clear">
            Limpar Regras
          </button>
        </div>
      {/if}
    </div>

    <button on:click={calculate}>Calcular</button>
  </div>

  <hr />

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
          <tr
            class="clickable"
            on:click={() => (yearData.open = !yearData.open)}
          >
            <td>{yearData.year}</td>
            <td
              >{new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(yearData.total)}</td
            >
            <td
              >{new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(yearData.cumulativeYield)}</td
            >
            <td
              >{new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(yearData.invested)}</td
            >
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
                        <td
                          >{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(monthData.total)}</td
                        >
                        <td
                          >{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(monthData.monthlyYield)}</td
                        >
                        <td
                          >{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(monthData.annualYieldIfStopped)}</td
                        >
                        <td
                          >{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(monthData.cumulativeYield)}</td
                        >
                        <td
                          >{new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(monthData.invested)}</td
                        >
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
</div>

<style>
  /* body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #f5f7fa;
    margin: 0;
    padding: 0;
  } */

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    background-color: #ffffff;
    overflow-x: auto;
    /* display: block; */
  }

  th,
  td {
    border: 1px solid #e0e0e0;
    padding: 0.75em 1em;
    text-align: right;
    /* background-color: #fff; */
    /* white-space: nowrap; */
  }

  th {
    background-color: #ffffff;
    font-weight: 600;
    text-align: center;
  }

  tr {
    background-color: #ffffff;
    transition: background-color 0.2s ease-in-out;
  }

  tr.clickable:hover {
    background-color: coral;
  }

  .clickable {
    cursor: pointer;
    background-color: #ffffff;
    transition: background-color 0.2s ease-in-out;
  }

  /* .clickable:hover {
    background-color: #dbeafe;
  } */

  #container {
    max-width: 900px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  #form {
    margin: 0 auto 2rem;
  }

  label {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1rem;
    font-weight: 600;
    font-size: 0.95rem;
  }

  input,
  select {
    padding: 0.5rem;
    font-size: 1rem;
    border-radius: 6px;
    border: 1px solid #ccc;
    width: 100%;
    box-sizing: border-box;
    margin-top: 0.25rem;
  }

  button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background-color: #007acc;
    color: white;
    font-size: 1rem;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    margin: 0.5rem 0;
  }

  button:hover {
    background-color: #005fa3;
  }

  #clear {
    background-color: #f5f7fa;
    color: #cc0000;
    border: 1px solid #cc0000;
    transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
  }

  @media (max-width: 600px) {
    #container {
      padding: 1rem;
      margin: 1rem;
    }

    table {
      font-size: 0.85rem;
    }
  }
</style>
