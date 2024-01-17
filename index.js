//Cursor + Tooltip > https://codepen.io/team/amcharts/pen/jOwzwXB https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
// Bullets en hover https://codepen.io/team/amcharts/pen/vYeVamo

//Leyendas al final de la línea + Configuración de ejes

//Mostrar menu
const selectorPaises = document.getElementById("selector-paises");
const mostrarPaises = () => {
  selectorPaises.style.display = "block";
};

const botonPaises = document.getElementById("btn-paises");
botonPaises.addEventListener("click", mostrarPaises);

//Ocultar menú
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

//Hacer gráfico full screen
const goFullScreen =() =>{

  var elem = document.getElementById('chart-cont');

  if(elem.requestFullscreen){
      elem.requestFullscreen();
  }
  else if(elem.mozRequestFullScreen){
      elem.mozRequestFullScreen();
  }
  else if(elem.webkitRequestFullscreen){
      elem.webkitRequestFullscreen();
  }
  else if(elem.msRequestFullscreen){
      elem.msRequestFullscreen();
  }
}

const fullscreenBtn = document.getElementById('btn-fullscreen')
fullscreenBtn.addEventListener('click', goFullScreen)

//Lista de paises para el selector

let selectedCountries = ["ARG", "OWID_WRL", "BRA", "CHL"];

let countryForm = document.getElementById("countryForm");
const searchBar = document.getElementById("search-bar");

const crearCheckboxes = (data) => {
  countryForm.innerHTML = ''; // Clear existing checkboxes

  data.forEach((p) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.name = "countries";
    checkbox.value = p.pais;
    checkbox.classList.add("checkbox-pais");

    if (selectedCountries.includes(p.iso3_code)) {
      checkbox.checked = true;
    }

    checkbox.addEventListener("change", function () {
      if (this.checked) {
        if (!selectedCountries.includes(p.iso3_code)) {
          selectedCountries.push(p.iso3_code);
          updateData();
        }
      } else {
        const index = selectedCountries.indexOf(p.iso3_code);
        if (index !== -1) {
          selectedCountries.splice(index, 1);
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
};

// Filtrar países en barra de búsqueda

const dataPaises = "./data/paises.json";
let dataPaisesFetched;
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

const actualizarCheckboxes = (searchTerm) => {
  const filteredResults = filtrarPaises(searchTerm);
  crearCheckboxes(filteredResults);
};

fetch(dataPaises)
  .then((response) => {
    return response.json();
  })
  .then((listData) => {
    dataPaisesFetched = listData;
    crearCheckboxes(dataPaisesFetched);
  });

// Attach an event listener to the search bar input
searchBar.addEventListener("input", () => {
  const searchTerm = searchBar.value.toLowerCase();
  actualizarCheckboxes(searchTerm);
});

/* GRÁFICO */
let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;
let legend;
let myTheme

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
  //root.setThemes([am5themes_Animated.new(root)]);

  myTheme = am5.Theme.new(root);
  myTheme.rule("Label").setAll({
    fill: am5.color(0xFF0000),
    fontSize: "1.5em"
  });



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
      layout: root.horizontalLayout,
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

cursor.lineX.setAll({
  stroke: am5.color('#4D4D4D'),
  strokeWidth: 1,
  strokeDasharray: []
});

  cursor.lineY.set("visible", false); //Pongo invisible la linea Y

  //Creación de eje X
  xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "year", count: 1 },
      min: new Date(1965, 1, 1).getTime(),
      max: new Date(2022, 1, 1).getTime(),
      renderer: am5xy.AxisRendererX.new(root, {
      }),
    })
  );

  const firstDate = new Date(1965, 1, 1).getTime()
  let firstDateLocation = xAxis.makeDataItem({ value: firstDate });
  xAxis.createAxisRange(firstDateLocation);

  firstDateLocation.get("label").setAll({
    text: 1965,
    fontSize: 16,
    forceHidden: false,
    fontWeight: 800,
    dx: 20
  });

  const lastDate = new Date(2022, 1, 1).getTime()
  let lastDateLocation = xAxis.makeDataItem({ value: lastDate });
  xAxis.createAxisRange(lastDateLocation);

  lastDateLocation.get("label").setAll({
    text: 2022,
    fontSize: 16,
    forceHidden: false,
    fontWeight: 800,
    dx: -20

  });

  let rendererX = xAxis.get("renderer");

  rendererX.labels.template.setAll({
    fontSize: 16,
    fontFamily: "Chivo Mono",
    marginTop: 30
  });



  rendererX.grid.template.set("forceHidden", true);
  chart.get("colors").set("colors", [
    am5.color('#FF7B03'),
    am5.color('#006CBA'),
    am5.color('#000000'),
    am5.color('#ABBABA'),
  ]);

  //Creación del eje y
  yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 0,
      max: 60,
      numberFormat: "#'%'",
      renderer: am5xy.AxisRendererY.new(root, {
        minGridDistance: 150,
      }),
    })
  );

  yAxis.get("renderer").labels.template.setAll({
    fontSize: 18,
    fontFamily: "Chivo Mono"
  });

  root.dateFormatter.set("dateFormat", "[bold]yyyy");

  legend = chart.children.push(am5.Legend.new(root, {}));
  legend.data.setAll(chart.series.values);
};

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
        text: "{valor_en_porcentaje}"
      })
    })
  );

  series.strokes.template.setAll({
    strokeWidth: 3,
  });

  // series.bullets.push(function() {
  //   let circle = am5.Circle.new(root, {
  //     radius: 6,
  //     stroke: series.get("stroke"),
  //     strokeWidth: 2,
  //     interactive: true,
  //     fill: series.get("stroke"),
  //     opacity: 0
  //   });
    
  //   circle.states.create("default", {
  //     opacity: 0
  //   });

  //   circle.states.create("hover", {
  //     opacity: 1
  //   });

  //   return am5.Bullet.new(root, {
  //     sprite: circle
  //   });
  // });


  // yAxis.axisHeader.children.push(am5.Legend.new(root, {
  //   y: "pais",
  //   // centerY: am5.p50
  // }));
  // legend.data.setAll([series]);

  series.data.setAll(dataPais);
  return series;

};

createChart("chart-cont");
fetchData();

//Actualizar datos cuando selecciono el checkbox
const updateData = () => {
  createChart("chart-cont");
  fetchData();
};

//Deseleccionar todos los checkboxes
const uncheckAllCheckboxes = () => {
  selectedCountries = []
  createChart('chart-cont')
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((el) => (el.checked = false));
};

let btnEliminar = document.getElementById("eliminar-seleccion");
btnEliminar.addEventListener("click", uncheckAllCheckboxes);





/* https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/ */

