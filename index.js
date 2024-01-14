//Para hacer carrera animada: https://www.amcharts.com/demos/bar-chart-race/
//https://stackoverflow.com/questions/72941086/amcharts-5-bar-chart-race-valueaxis-reset-on-chart-replay

// https://www.amcharts.com/docs/v5/getting-started/#Root_element
let root = am5.Root.new("chart-cont");

root.dateFormatter.setAll({
  dateFormat: "yyyy",
  dateFields: ["valueX"],
});

let parsedData;
let allCountries = [];

// Procesamiento de datos
let processor = am5.DataProcessor.new(root, {
  numericFields: ["valor_en_porcentaje"],
  dateFormat: "yyyy",
  dateFields: ["anio"],
  // dateFields: ["anio"],
});

//Fetch de datos CSV
am5.net
  .load("/data/energia_baja_carbono.csv")
  .then((data) => {
    let fetchedData = data.response;
    console.log(fetchedData);

    //Parseo de datos CSV
    parsedData = am5.CSVParser.parse(fetchedData, {
      delimiter: ";",
      reverse: true,
      skipEmpty: true,
      useColumnNames: true,
    });

    console.log("parsed data", parsedData);

    processor.processMany(parsedData);

    //Busco los paises para hacer menu dropdown del selector
    let listCountries = [...new Set(parsedData.map((item) => item.iso3))];
    listCountries.sort(); //Ordenado alfabeticamente
    //Instanciado en HTML
    listCountries.forEach((country) => {
      document.getElementById("countryForm").innerHTML += `
        <label><input class="input-paises" type="checkbox" name="countries" value="${country}">${country}</label>
      `;
    });

    allCountries = listCountries;
    console.log(allCountries)

    allCountries.forEach((item) => {
      createLineSeries(item);
    });
    

  })
  .catch((result) => {
    console.log("Result Object:", result);

    if (result && result.xhr && result.xhr.responseURL) {
      console.log("Error en carga de datos: " + result.xhr.responseURL);
    } else {
      console.log("Error en carga de datos.");
    }
  });

//Creo el gráfico Chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
let chart = root.container.children.push(
  am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    paddingLeft: 0,
  })
);

// Add cursor
// https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
let cursor = chart.set(
  "cursor",
  am5xy.XYCursor.new(root, {
    behavior: "zoomX",
  })
);

cursor.lineY.set("visible", false);

let xAxis = chart.xAxes.push(
  am5xy.DateAxis.new(root, {
    baseInterval: { timeUnit: "year", count: 1 },
    renderer: am5xy.AxisRendererX.new(root, {
      // minGridDistance: 50,
      // pan:"zoom",
      // minorGridEnabled: true
    }),
    tooltip: am5.Tooltip.new(root, {}),
  })
);

let yAxis = chart.yAxes.push(
  am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
  })
);

/* Muchos line charts
https://www.amcharts.com/demos/highlighting-line-chart-series-on-legend-hover/
*/

const createLineSeries = (pais) => {
  let countryData = parsedData.filter((item) => item.iso3 === pais);

  // Agregar serie por cada país seleccionado
  let series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: pais,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "valor_en_porcentaje",
      valueXField: "anio",
      tooltip: am5.Tooltip.new(root, {
        labelText: "Año: {anio} Valor: {valor_en_porcentaje}",
      }),
    })
  );

  series.data.setAll(countryData);
};

