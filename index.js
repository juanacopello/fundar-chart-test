//Para hacer carrera animada: https://www.amcharts.com/demos/bar-chart-race/
//https://stackoverflow.com/questions/72941086/amcharts-5-bar-chart-race-valueaxis-reset-on-chart-replay

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

//Deseleccionar todos los checkboxes
const uncheckAllCheckboxes = () => {
  document.querySelectorAll('input[type="checkbox"]')
    .forEach(el => el.checked = false);
}

let btnEliminar = document.getElementById('eliminar-seleccion')
btnEliminar.addEventListener('click', uncheckAllCheckboxes)

let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;

//Borrar gráfico anterior si existe

const clearChart = (divId) => {
  am5.array.each(am5.registry.rootElements, function(root) {
    if (root.dom.id == divId) {
      root.dispose();
    }
  });
};

//Creación y configuración del gráfico

const createChart = (divId) => {
  clearChart(divId);

  root = am5.Root.new(divId);

  /* Formateador y procesador de datos */

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
        minorGridDistance: 1,
        minorGridEnabled: true,
        minorLabelsEnabled: true,
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

//Lista de paises para el selector

let selectedCountries = ["ARG", "CHL"];

let countryForm = document.getElementById('countryForm')
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
          //Acá poner funcion que actualiza
          updateData()
        } else {
          const index = selectedCountries.indexOf(p.iso3);
          if (index !== -1) {
            selectedCountries.splice(index, 1);
            //Acá poner funcion que actualiza
            updateData()
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
      tooltip: am5.Tooltip.new(root, {
        pointerOrientation: "horizontal",
        labelText: "[bold]{anio}",
        forceHidden: true,
        animationDuration: 0
      })
    })
  );

 

  series.data.setAll(dataPais);

  series.bullets.push(function() {
    // create the circle first
    var circle = am5.Circle.new(root, {
      radius: 6,
      stroke: series.get("fill"),
      strokeWidth: 2,
      interactive: true, //required to trigger the state on hover
      fill: am5.color(0xffffff),
      opacity: 0
    });
    
    circle.states.create("default", {
      opacity: 0
    });

    circle.states.create("hover", {
      opacity: 1
    });

    return am5.Bullet.new(root, {
      sprite: circle
    });
  })
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

createChart("chart-cont");
fetchData();
const updateData = () => {
  createChart("chart-cont");
  fetchData();
};


var previousBulletSprites = [];
cursor.events.on("cursormoved", cursorMoved);

function cursorMoved() {
  for(var i = 0; i < previousBulletSprites.length; i++) {
    previousBulletSprites[i].unhover();
  }
  previousBulletSprites = [];
  chart.series.each(function(series) {
    var dataItem = series.get("tooltip").dataItem;
    if (dataItem) {
      var bulletSprite = dataItem.bullets[0].get("sprite");
      bulletSprite.hover();
      previousBulletSprites.push(bulletSprite);
    }
  });
}





/* https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/ */
