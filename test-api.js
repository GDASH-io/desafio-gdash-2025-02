const BASE_URL = "http://localhost:3000";

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(title, color = colors.cyan) {
  console.log(`\n${color}${colors.bright}=== ${title} ===${colors.reset}\n`);
}

async function makeRequest(method, path, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${path}`, options);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error(`Erro: ${error.message}`);
  }
}

async function downloadFile(path, filename) {
  try {
    const response = await fetch(`${BASE_URL}${path}`);
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();
    await Bun.write(filename, buffer);
    console.log(`✅ Arquivo salvo: ${filename}`);
  } catch (error) {
    console.error(`❌ Erro ao baixar: ${error.message}`);
  }
}

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTests() {
  console.log(`${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════════╗
║           WEATHER API - SUITE DE TESTES                  ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);

  log("1. CRIAR LOG CLIMÁTICO (Normal)", colors.green);
  await makeRequest("POST", "/weather/logs", {
    timestamp: "2025-11-29T21:00:00.000Z",
    location: {
      city: "Natal",
      state: "RN",
      country: "Brasil",
      latitude: "-5.7945",
      longitude: "-35.211",
    },
    weather: {
      temperature: 28.5,
      temperature_unit: "°C",
      humidity: 65,
      humidity_unit: "%",
      wind_speed: 12.5,
      wind_speed_unit: "km/h",
      wind_direction: "NE",
      condition: "Parcialmente nublado",
      weather_code: 2,
      precipitation: 0,
      precipitation_unit: "mm",
      rain_probability: 20,
    },
  });

  log("2. CRIAR LOG CLIMÁTICO (Extremo - Tempestade)", colors.green);
  await makeRequest("POST", "/weather/logs", {
    timestamp: "2025-11-29T21:30:00.000Z",
    location: {
      city: "Natal",
      state: "RN",
      country: "Brasil",
      latitude: "-5.7945",
      longitude: "-35.211",
    },
    weather: {
      temperature: 32.5,
      temperature_unit: "°C",
      humidity: 85,
      humidity_unit: "%",
      wind_speed: 35,
      wind_speed_unit: "km/h",
      wind_direction: "NE",
      condition: "Tempestade",
      weather_code: 95,
      precipitation: 50,
      precipitation_unit: "mm",
      rain_probability: 95,
    },
  });

  log("3. LISTAR LOGS (Paginação padrão)", colors.blue);
  await makeRequest("GET", "/weather/logs");

  log("4. LISTAR LOGS (Com filtros)", colors.blue);
  await makeRequest("GET", "/weather/logs?page=1&limit=10&location=Natal");

  log("5. LISTAR LOGS (Com data range)", colors.blue);
  await makeRequest(
    "GET",
    "/weather/logs?startDate=2025-11-29&endDate=2025-11-30"
  );

  log("6. CALCULAR ESTATÍSTICAS", colors.yellow);
  await makeRequest(
    "GET",
    "/weather/analytics/statistics?startDate=2025-11-29&endDate=2025-11-30"
  );

  log("7. DETECTAR TENDÊNCIAS", colors.yellow);
  await makeRequest(
    "GET",
    "/weather/analytics/trends?startDate=2025-11-29&endDate=2025-11-30&location=Natal"
  );

  log("8. GERAR ALERTAS", colors.yellow);
  await makeRequest(
    "GET",
    "/weather/analytics/alerts?startDate=2025-11-29&endDate=2025-11-30"
  );

  log("9. CLASSIFICAR DIA MAIS RECENTE", colors.yellow);
  await makeRequest("GET", "/weather/analytics/classify");

  log("10. ÍNDICE DE CONFORTO MAIS RECENTE", colors.yellow);
  await makeRequest("GET", "/weather/analytics/comfort");

  log("11. GERAR RESUMO COMPLETO", colors.yellow);
  await makeRequest(
    "GET",
    "/weather/analytics/summary?startDate=2025-11-29&endDate=2025-11-30&days=7"
  );

  log("12. DASHBOARD COMPLETO", colors.magenta);
  await makeRequest("GET", "/weather/dashboard");

  log("13. DASHBOARD COM FILTROS", colors.magenta);
  await makeRequest(
    "GET",
    "/weather/dashboard?startDate=2025-11-29&endDate=2025-11-30&location=Natal&recentLogsLimit=5"
  );

  log("14. GERAR INSIGHTS (GET)", colors.cyan);
  await makeRequest(
    "GET",
    "/weather/insights?startDate=2025-11-29&endDate=2025-11-30&location=Natal&limit=100"
  );

  log("15. GERAR INSIGHTS (POST)", colors.cyan);
  await makeRequest(
    "POST",
    "/weather/insights?startDate=2025-11-29&endDate=2025-11-30"
  );

  log("16. EXPORTAR CSV (Todos os dados)", colors.green);
  await downloadFile("/weather/export/csv", "weather_logs.csv");

  log("17. EXPORTAR CSV (Com filtros)", colors.green);
  await downloadFile(
    "/weather/export/csv?startDate=2025-11-29&endDate=2025-11-30&location=Natal",
    "weather_logs_filtered.csv"
  );

  log("18. EXPORTAR XLSX (Todos os dados)", colors.green);
  await downloadFile("/weather/export/xlsx", "weather_logs.xlsx");

  log("19. EXPORTAR XLSX (Com filtros)", colors.green);
  await downloadFile(
    "/weather/export/xlsx?startDate=2025-11-29&endDate=2025-11-30&location=Natal",
    "weather_logs_filtered.xlsx"
  );

  log("20. CRIAR MÚLTIPLOS LOGS (Diferentes condições)", colors.green);

  const conditions = [
    {
      name: "Frio e ventoso",
      data: {
        timestamp: "2025-11-29T10:00:00.000Z",
        weather: {
          temperature: 15,
          condition: "Frio e ventoso",
          humidity: 50,
          wind_speed: 25,
          weather_code: 3,
          rain_probability: 10,
        },
      },
    },
    {
      name: "Quente e seco",
      data: {
        timestamp: "2025-11-29T14:00:00.000Z",
        weather: {
          temperature: 35,
          condition: "Ensolarado",
          humidity: 30,
          wind_speed: 10,
          weather_code: 0,
          rain_probability: 0,
        },
      },
    },
    {
      name: "Agradável",
      data: {
        timestamp: "2025-11-29T18:00:00.000Z",
        weather: {
          temperature: 24,
          condition: "Perfeito",
          humidity: 50,
          wind_speed: 12,
          weather_code: 1,
          rain_probability: 5,
        },
      },
    },
  ];

  for (const { name, data } of conditions) {
    console.log(`Criando log: ${name}...`);
    await makeRequest("POST", "/weather/logs", {
      ...data,
      location: {
        city: "Natal",
        state: "RN",
        country: "Brasil",
        latitude: "-5.7945",
        longitude: "-35.211",
      },
      weather: {
        ...data.weather,
        temperature_unit: "°C",
        humidity_unit: "%",
        wind_speed_unit: "km/h",
        wind_direction: "N",
        precipitation: 0,
        precipitation_unit: "mm",
      },
    });
    await sleep(500);
  }

  log("21. TESTE DE VALIDAÇÃO (Dados inválidos)", colors.yellow);
  await makeRequest("POST", "/weather/logs", {
    weather: {
      temperature: "invalid",
      humidity: 150,
    },
  });

  log("22. TESTE DE PAGINAÇÃO INVÁLIDA", colors.yellow);
  await makeRequest("GET", "/weather/logs?page=-1&limit=0");

  console.log(`\n${colors.bright}${colors.magenta}
╔═══════════════════════════════════════════════════════════╗
║              RESUMO DE ENDPOINTS DISPONÍVEIS             ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}
${colors.green}📝 INGESTÃO:${colors.reset}
  POST   /weather/logs

${colors.blue}📊 CONSULTA:${colors.reset}
  GET    /weather/logs

${colors.yellow}📈 ANALYTICS:${colors.reset}
  GET    /weather/analytics/statistics
  GET    /weather/analytics/trends
  GET    /weather/analytics/alerts
  GET    /weather/analytics/classify
  GET    /weather/analytics/classify/:id
  GET    /weather/analytics/comfort
  GET    /weather/analytics/comfort/:id
  GET    /weather/analytics/summary

${colors.magenta}🎯 DASHBOARD:${colors.reset}
  GET    /weather/dashboard

${colors.cyan}💡 INSIGHTS:${colors.reset}
  GET    /weather/insights
  POST   /weather/insights

${colors.green}📥 EXPORTAÇÃO:${colors.reset}
  GET    /weather/export/csv
  GET    /weather/export/xlsx

${colors.bright}✅ Testes concluídos! Verifique os arquivos CSV e XLSX gerados.${colors.reset}
`);
}

runTests().catch(console.error);
