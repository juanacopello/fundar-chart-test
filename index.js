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
  }
};

const btnCruz = document.getElementById("cerrar-ventana");
btnCruz.addEventListener("click", ocultarPaises);

//Descargar CSV
const downloadCSV = () => {
  const filePath = "./data/energia_baja_carbono_por_pais.csv";

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
const goFullScreen = () => {
  var elem = document.getElementById("chart-cont");

  if (elem.requestFullscreen) {
    elem.requestFullscreen();
  } else if (elem.mozRequestFullScreen) {
    elem.mozRequestFullScreen();
  } else if (elem.webkitRequestFullscreen) {
    elem.webkitRequestFullscreen();
  } else if (elem.msRequestFullscreen) {
    elem.msRequestFullscreen();
  }
};

const fullscreenBtn = document.getElementById("btn-fullscreen");
fullscreenBtn.addEventListener("click", goFullScreen);

//Lista de paises para el selector

let selectedCountries = ["ARG", "OWID_WRL", "BRA", "CHL"];
let countryForm = document.getElementById("countryForm");
const searchBar = document.getElementById("search-bar");

const crearCheckboxes = (data) => {
  countryForm.innerHTML = "";

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
  return filteredList;
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

searchBar.addEventListener("input", () => {
  const searchTerm = searchBar.value.toLowerCase();
  actualizarCheckboxes(searchTerm);
});

//Deseleccionar todos los checkboxes
const uncheckAllCheckboxes = () => {
  selectedCountries = [];
  createChart("chart-cont");
  document
    .querySelectorAll('input[type="checkbox"]')
    .forEach((el) => (el.checked = false));
};

let btnEliminar = document.getElementById("eliminar-seleccion");
btnEliminar.addEventListener("click", uncheckAllCheckboxes);

/* GRÁFICO */
let chart;
let cursor;
let xAxis;
let xRenderer;
let yAxis;
let root;
let processor;
let legend;
let myTheme;

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

  myTheme = am5.Theme.new(root);
  myTheme.rule("Label").setAll({
    fill: am5.color(0xff0000),
    fontSize: "1.5em",
  });

  /* Formateador y procesador de datos */

  // Procesamiento de dato
  processor = am5.DataProcessor.new(root, {
    numericFields: ["valor_en_porcentaje"],
    dateFormat: "yyyy",
    dateFields: ["anio"],
    colorFields: ["color_pais"]
  });

  chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,
      padding: 20,
      paddingRight:50,
    })
  );

  // Creación del cursor
  cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "zoomX"
    })
  );


  cursor.lineX.setAll({
    stroke: am5.color("#4D4D4D"),
    strokeWidth: 1,
    strokeDasharray: [],
  });

  cursor.lineY.set("visible", false); //Pongo invisible la linea Y

 colors = chart.get("colors"); //colores para grafico


  //Creación de eje X
  xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: { timeUnit: "year", count: 1 },
      min: new Date(1965, 1, 1).getTime(),
      max: new Date(2022, 1, 1).getTime(),
      minPosition: 0.1,
      maxPosition: 0.8, 
      renderer: am5xy.AxisRendererX.new(root, {}),
    })
  );

  //Pongo 1965 y 2022 en el gráfico

  const firstDate = new Date(1965, 1, 1).getTime();
  let firstDateLocation = xAxis.makeDataItem({ value: firstDate });
  xAxis.createAxisRange(firstDateLocation);

  firstDateLocation.get("label").setAll({
    text: 1965,
    fontSize: 16,
    forceHidden: false,
    fontWeight: 800,
    dx: 20,
  });

  const lastDate = new Date(2022, 1, 1).getTime();
  let lastDateLocation = xAxis.makeDataItem({ value: lastDate });
  xAxis.createAxisRange(lastDateLocation);

  lastDateLocation.get("label").setAll({
    text: 2022,
    fontSize: 16,
    forceHidden: false,
    fontWeight: 800,
    dx: -20,
  });

  //config de estilos de eje x

  let rendererX = xAxis.get("renderer");

  rendererX.labels.template.setAll({
    fontSize: 16,
    fontFamily: "Chivo Mono",
    marginTop: 30,
  });

  rendererX.grid.template.set("forceHidden", true);
  chart
    .get("colors")
    .set("colors", [
      am5.color("#FF7B03"),
      am5.color("#006CBA"),
      am5.color("#000000"),
      am5.color("#ABBABA"),
      am5.color("#4B4BB0"),
      am5.color("#720034"),
      am5.color("#608584"),
      am5.color("#C43E3E"),
      am5.color("#CCE3F1")
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

  //config estilos de eje y
  yAxis.get("renderer").labels.template.setAll({
    fontSize: 18,
    fontFamily: "Chivo Mono",
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
    .load("./data/energia_baja_carbono.csv")
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
            getFillFromSprite: false,
            getStrokeFromSprite: false,
            autoTextColor: false,
            getLabelFillFromSprite: false,
            forceHidden: true,
        }),
    })
  );


  series.strokes.template.setAll({
    strokeWidth: 3,
  });
  series.data.setAll(dataPais);


  //Bullets en hover
  series.bullets.push(() => {
    let circle = am5.Circle.new(root, {
      strokeWidth: 0,
      radius: 8,
      opacity: 0,
      toggleKey: "active",
      pointerOrientation: "horizontal",
      interactive: true,
      fill: "red"
    });

    circle.states.create("default", {
      opacity: 0,
    });

    circle.states.create("hover", {
      opacity: 1,
    });

    circle.adapters.add("tooltipHTML", (text, target) => {
      if (target.dataItem) {
        const dataItem = target.dataItem.dataContext
        let divTool = `<div class="tooltip-bg"><p class="tooltip-year">${dataItem.anio_txt}</p>`;

        const hoverCountries = parsedData
          .filter((d) => d.anio_txt === dataItem.anio_txt && selectedCountries.includes(d.iso3))
          .map((d) => {
            divTool += `<p class="pais-detalle"><span style='color:${d.color_pais};' class='punto-tooltip'>&#9679</span>${d.pais}: ${d.valor_en_porcentaje.toFixed(2)}%</p>`;
            return divTool
          })
          .map((d) => {
            return divTool
          })
          let soloPais = new Set(hoverCountries)
          let arrPais = Array.from(soloPais)
          divTool += `</div>`;
          return arrPais
      }

      return text
    })


    return am5.Bullet.new(root, {
      sprite: circle,
    });
  });

  /*Funcion que buscaba poner el nombre del pais al final del gráfico<

  series.bullets.push(function(root, series, dataItem) {

    var lastIndex = series.dataItems.length - 1;

    if (series.dataItems.indexOf(dataItem) == lastIndex) {
      return am5.Bullet.new(root, {
        opacity: 1,
        sprite: am5.Label.new(root, {
          text: dataItem.dataContext.pais,
          fill: series.get("fill"),
        })
      });
    }
  
  });
  
  return series;
};
*/

}
createChart("chart-cont");
fetchData();

//Actualizar datos cuando selecciono el checkbox
const updateData = () => {
  createChart("chart-cont");
  fetchData();
};

