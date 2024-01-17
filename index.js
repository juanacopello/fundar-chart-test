//Para hacer carrera animada: https://www.amcharts.com/demos/bar-chart-race/
//https://stackoverflow.com/questions/72941086/amcharts-5-bar-chart-race-valueaxis-reset-on-chart-replay
//Cursor + Tooltip > https://codepen.io/team/amcharts/pen/jOwzwXB https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
// Bullets en hover https://codepen.io/team/amcharts/pen/vYeVamo

//Eliminar paises que no están en el listado + Traducción al castellano ESTA NOCHE
//Search bar
//Logo para agrandar
//Leyendas al final de la línea + Configuración de ejes + Configuracion de colores

//Mostrar menu

const selectorPaises = document.getElementById("selector-paises");
const mostrarPaises = () => {
  selectorPaises.style.display = "block";
};

const botonPaises = document.getElementById("btn-paises");
botonPaises.addEventListener("click", mostrarPaises);

const ocultarPaises = () => {
  if (selectorPaises.style.display === "block") {
    selectorPaises.style.display = "none";
  } else {
    selectorPaises.style.display = "block";
  }
};

const btnCruz = document.getElementById("cerrar-ventana");
btnCruz.addEventListener("click", ocultarPaises);

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
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((el) => (el.checked = false));
};

let btnEliminar = document.getElementById("eliminar-seleccion");
btnEliminar.addEventListener("click", uncheckAllCheckboxes);

let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;
let legend;

//Borrar gráfico anterior si existe

const clearChart = (divId) => {
  am5.array.each(am5.registry.rootElements, function (root) {
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
      // layout: root.verticalLayout,
      maxTooltipDistance: 0,
      // cursor: am5xy.XYCursor.new(root, {})
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
      min: 0,
      max: 60,
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 150,
        minorGridEnabled: true,
      }),
    })
  );

  legend = chart.children.push(am5.Legend.new(root, {}));
  legend.data.setAll(chart.series.values);
};

//Lista de paises para el selector

let selectedCountries = ["ARG", "OWID_WRL", "BRA", "CHL"];

let countryForm = document.getElementById("countryForm");
const dataPaises = "./data/codigos_paises.json";

let dataPaisesFetched;
fetch(dataPaises)
  .then((response) => {
    return response.json();
  })
  .then((listData) => {
    dataPaisesFetched = listData;

    dataPaisesFetched.forEach((p) => {
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
          updateData();
        } else {
          const index = selectedCountries.indexOf(p.iso3);
          if (index !== -1) {
            selectedCountries.splice(index, 1);
            //Acá poner funcion que actualiza
            updateData();
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

const searchBar = document.getElementById("search-bar");
const searchTerm = searchBar.value.toLowerCase();

const filtrarPaises = (searchTerm) => {
  if (!searchTerm.trim()) {
    return dataPaisesFetched;
  }
  const filteredList = dataPaisesFetched.filter((p) =>
    p.pais.toLowerCase().includes(searchTerm)
  );
  console.log(filteredList);
  return filteredList
};

const mostrarResultados = (resultados) => {
      countryForm.innerHTML = '';
      resultados.forEach(result => {
          const listItem = document.createElement('li');
          listItem.textContent = result.pais;
          countryForm.appendChild(listItem);
      });
}

// Attach an event listener to the search bar input
searchBar.addEventListener("input", () => {
  const searchTerm = searchBar.value;
  const filteredResults = filtrarPaises(searchTerm);
  mostrarResultados(filteredResults);
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
    am5xy.SmoothedXLineSeries.new(root, {
      name: pais,
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "valor_en_porcentaje",
      valueXField: "anio",
      setStateOnChildren: true,
      tooltip: am5.Tooltip.new(root, {
        labelText: undefined,
        forceHidden: true,
        animationDuration: 0,
      }),
    })
  );

  // let tooltip = series.set("tooltip", am5.Tooltip.new(root, {
  //   pointerOrientation: "horizontal"
  // }));

  // tooltip.label.setAll({
  //   // text: "[bold]{categoryX}:[/]\n[width: 130px]Italy[/] {italy}\n[width: 130px]Germany[/] {germany}\n[width: 130px]United Kingdom[/] {uk}"
  //   text: "Hola"
  // });

  series.strokes.template.setAll({
    strokeWidth: 2,
  });

  series.bullets.push(() => {
    let circle = am5.Circle.new(root, {
      radius: 6,
      stroke: series.get("fill"),
      strokeWidth: 2,
      interactive: true, //required to trigger the state on hover
      fill: am5.color(0xffffff),
      opacity: 0,
    });

    circle.states.create("default", {
      opacity: 0,
    });

    circle.states.create("hover", {
      opacity: 1,
    });

    return am5.Bullet.new(root, {
      sprite: circle,
    });
  });

  series.data.setAll(dataPais);
  return series;

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

let previousBulletSprites = [];

const cursorMoved = () => {
  for (let i = 0; i < previousBulletSprites.length; i++) {
    previousBulletSprites[i].unhover();
  }

  previousBulletSprites = [];
  chart.series.each(function (series) {
    var dataItem = series.get("tooltip").dataItem;
    if (dataItem) {
      console.log(dataItem);
      var bulletSprite = dataItem.bullets[0].get("sprite");
      bulletSprite.hover();
      previousBulletSprites.push(bulletSprite);
    }
  });
};

cursor.events.on("cursormoved", cursorMoved);

// var previousBulletSprites = [];
// cursor.events.on("cursormoved", cursorMoved);

// function cursorMoved() {
//   for (var i = 0; i < previousBulletSprites.length; i++) {
//     previousBulletSprites[i].unhover();
//   }
//   previousBulletSprites = [];
//   chart.series.each(function (series) {
//     var dataItem = series.get("tooltip").dataItem;
//     if (dataItem) {
//       var bulletSprite = dataItem.bullets[0].get("sprite");
//       bulletSprite.hover();
//       previousBulletSprites.push(bulletSprite);
//     }
//   });
// }

/* https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/ */
