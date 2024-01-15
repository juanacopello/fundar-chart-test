//Para hacer carrera animada: https://www.amcharts.com/demos/bar-chart-race/
//https://stackoverflow.com/questions/72941086/amcharts-5-bar-chart-race-valueaxis-reset-on-chart-replay

// https://www.amcharts.com/docs/v5/getting-started/#Root_element
//let root = am5.Root.new("chart-cont");

let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;

const clearChart = (divId) => {
  am5.array.each(am5.registry.rootElements, (root) => {
    if (root.dom.id == divId) {
      root.dispose();
      console.log("Hola");
    } else {
      console.log("no puedo eliminar");
    }
  });
};

const createChart = (divId) => {
  clearChart(divId);

  root = am5.Root.new(divId);

  root.dateFormatter.setAll({
    dateFormat: "yyyy",
    dateFields: ["valueX"],
  });
  // Procesamiento de dato
  processor = am5.DataProcessor.new(root, {
    numericFields: ["valor_en_porcentaje"],
    dateFormat: "yyyy",
    dateFields: ["anio"],
  });

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      paddingLeft: 0,
      layout: root.verticalLayout,
      maxTooltipDistance: 0,
    })
  );

  // Creación del cursor
  cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "none",
    })
  );
  cursor.lineY.set("visible", false); //Pongo invisible la linea Y

  //Creación de eje X

  xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "year", count: 1 },
      renderer: am5xy.AxisRendererX.new(root, {
        timeUnit: "year",
        count: 10,
        minorGridDistance: 100,
        minorGridEnabled: true,
        minorLabelsEnabled: true
      }),
    })
  );

  xRenderer = xAxis.get("renderer");
  xRenderer.ticks.template.setAll({
    stroke: am5.color(0xff0000),
    visible: true,
  });

  //Creación del eje y
  yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 150,
        minorGridEnabled: true,
      }),
    })
  );
};

createChart("chart-cont");

//Lista de paises para el selector

let selectedCountries = ["ARG", "CHL"];

const dataPaises = "./data/codigos_paises.json";
fetch(dataPaises)
  .then((response) => {
    return response.json();
  })
  .then((listData) => {
    listData.forEach((p) => {
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.name = "countries";
      checkbox.value = p.pais;

      if (selectedCountries.includes(p.iso3)) {
        checkbox.checked = true;
      }

      checkbox.addEventListener("change", function () {
        if (this.checked) {
          selectedCountries.push(p.iso3);
          fetchData();
        } else {
          const index = selectedCountries.indexOf(p.iso3);
          if (index !== -1) {
            selectedCountries.splice(index, 1);
            fetchData();
          }
        }
        console.log("Selected Countries:", selectedCountries);
      });

      const label = document.createElement("label");
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(p.pais));
      countryForm.appendChild(label);
    });
  });

/* Formateador y procesador de datos */

let parsedData;
let allCountries = [];

//Fetch de datos
const fetchData = () => {
  //Fetch de datos CSV
  am5.net
    .load("/data/energia_baja_carbono.csv")
    .then((data) => {
      let fetchedData = data.response;

      //Parseo de datos CSV
      parsedData = am5.CSVParser.parse(fetchedData, {
        delimiter: ";",
        reverse: true,
        skipEmpty: true,
        useColumnNames: true,
      });

      processor.processMany(parsedData);

      //Creo una linea por cada pais
      selectedCountries.forEach((item) => {
        createLineSeries(item);
      });
    })
    .catch((result) => {
      if (result && result.xhr && result.xhr.responseURL) {
        console.log("Error en carga de datos: " + result.xhr.responseURL);
      } else {
        console.log("Error en carga de datos.");
      }
    });
};

fetchData();

/* CONFIGURACION DEL GRAFICO */
//Creacion de grafico

// const updateData = () => {
//   chart.series.values.forEach(c => {
//     console.log(c._settings.name)
//   })

//   array1.filter((value1) =>
//   array2.some((obj) => obj.propertyName === value1)
// );

//   selectedCountries.forEach((country) => {
//     const seriesExists = chart.series.values.contains((s) => s._settings.name === country);
//     console.log(seriesExists)
//     if (!seriesExists) {
//       createLineSeries(country);
//     }

// })

// };


/* https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/ */

//Funcion para crear gráficos de línea
let series;
const createLineSeries = (pais) => {
  let dataPais = parsedData.filter((item) => item.iso3 === pais);
  // Agregar serie por cada país seleccionado
  series = chart.series.push(
    am5xy.LineSeries.new(root, {
      name: pais,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "valor_en_porcentaje",
      valueXField: "anio",
      tooltip: am5.Tooltip.new(root, {}),
    })
  );

  series.data.setAll(dataPais);

  //   let tooltip = series.getTooltip()
  //   console.log("tooltip", tooltip)

  //   tooltip.label.adapters.add("text", function(text, target) {
  //     text = "";
  //     var i = 0;
  //     chart.series.each(function(series) {
  //       console.log(series)
  //       let tooltipDataItem = series.get(_dataItem);
  //       console.log(tooltipDataItem)
  //       if(tooltipDataItem){
  //         if(i != 0){
  //            text += "\n";
  //         }
  //         text += '[' + series.get("stroke").toString() + ']●[/] [bold width:100px]' + series.get("name") + ':[/] ' + tooltipDataItem.get("valueY");
  //       }
  //       i++;
  //     })
  //     return text
  //   });
};

//Mostrar menu

const toggleDisplay = () => {
  const selectorPaises = document.getElementById("selector-paises");
  selectorPaises.style.display =
    selectorPaises.style.display === "none" ? "block" : "none";
};
const botonPaises = document.getElementById("btn-paises");
botonPaises.addEventListener("click", toggleDisplay);

//Descargar CSV
const downloadCSV = () => {
  const filePath = "/data/energia_baja_carbono.csv";

  fetch(filePath)
    .then((response) => response.text())
    .then((csvData) => {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");

      link.download = "energia_baja_carbono_por_pais.csv";
      link.href = window.URL.createObjectURL(blob);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    })
    .catch((error) => {
      console.error("Error fetching CSV file:", error);
      alert("No se pudo descargar el recurso. Vuelva a intentarlo más tarde");
    });
};

const downloadButton = document.getElementById("btn-descarga");
downloadButton.addEventListener("click", downloadCSV);
