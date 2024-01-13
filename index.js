//Para hacer carrera animada: https://www.amcharts.com/demos/bar-chart-race/
//https://stackoverflow.com/questions/72941086/amcharts-5-bar-chart-race-valueaxis-reset-on-chart-replay

/* Chart code */
// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
let root = am5.Root.new("chart-cont");

const myTheme = am5.Theme.new(root);

// Move minor label a bit down
myTheme.rule("AxisLabel", ["minor"]).setAll({
  dy: 1,
});

// Tweak minor grid opacity
// myTheme.rule("Grid", ["minor"]).setAll({
//   strokeOpacity: 0.08,
// });

// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
// root.setThemes([
//   am5themes_Animated.new(root),
//   myTheme
// ]);

let parsedData;


    // Process data
    let processor = am5.DataProcessor.new(root, {
      dateFields: ["anio"],
      dateFormat: "yyyy",
      numericFields: ["valor_en_porcentaje"],
    });


am5.net
  .load("/data/energia_baja_carbono.csv")
  .then((data) => {
    console.log(data.response);
    parsedData = am5.CSVParser.parse(data.response, {
      delimiter: ";",
      reverse: true,
      skipEmpty: true,
      useColumnNames: true,
      process: (row) => {
        // Convert timestamp to a Date object
        row.anio = new Date(parseInt(row.anio));

        return row;
      },
    });
    console.log(parsedData);

    processor.processMany(parsedData);


    series.data.setAll(parsedData);
  })
  .catch((result) => {
    console.log("Error loading " + result.xhr.responseURL);
  });

// Create chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
let chart = root.container.children.push(
  am5xy.XYChart.new(root, {
    panX: false,
    panY: false,
    // wheelX: "panX",
    // wheelY: "zoomX",
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

// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
let xAxis = chart.xAxes.push(
  am5xy.DateAxis.new(root, {
    maxDeviation: 0,
    baseInterval: {
      timeUnit: "year",
      count: 10,
    },

    renderer: am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 200,
      minorLabelsEnabled: true,
    }),
    tooltip: am5.Tooltip.new(root, {}),
  })
);

xAxis.set("minorDateFormats", {
  // day: "dd",
  // month: "MM",
  year: "YYYY",
});

let yAxis = chart.yAxes.push(
  am5xy.ValueAxis.new(root, {
    renderer: am5xy.AxisRendererY.new(root, {}),
  })
);

// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
let series = chart.series.push(
  am5xy.LineSeries.new(root, {
    name: "Series",
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: "valor_en_porcentaje",
    valueXField: "anio",
    tooltip: am5.Tooltip.new(root, {
      labelText: "Año: {anio} Valor: {valor_en_porcentaje}",
    }),
  })
);


// const downloadCSV = () => {
//   const csvData = 
// }