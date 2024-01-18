/**
 * ---------------------------------------
 * This demo was created using amCharts 5.
 *
 * For more information visit:
 * https://www.amcharts.com/
 *
 * Documentation is available at:
 * https://www.amcharts.com/docs/v5/
 * ---------------------------------------
 */

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
var root = am5.Root.new("chartdiv");


// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root)
]);


// Create chart
// https://www.amcharts.com/docs/v5/charts/xy-chart/
var chart = root.container.children.push(am5xy.XYChart.new(root, {
  panX: false,
  panY: false,
  wheelX: "panX",
  wheelY: "zoomX",
  layout: root.verticalLayout,
  cursor: am5xy.XYCursor.new(root, {})
}));


var data = [{
  "year": "2015",
  "value": 450,
  "value2": 362,
  "value3": 699
}, {
  "year": "2016",
  "value": 269,
  "value2": 450,
  "value3": 841
}, {
  "year": "2017",
  "value": 700,
  "value2": 358,
  "value3": 699
}, {
  "year": "2018",
  "value": 490,
  "value2": 367,
  "value3": 500
}, {
  "year": "2019",
  "value": 500,
  "value2": 485,
  "value3": 369
}, {
  "year": "2020",
  "value": 550,
  "value2": 354,
  "value3": 250
}, {
  "year": "2021",
  "value": 420,
  "value2": 350,
  "value3": 600
}]


// Create axes
// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
var xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
  categoryField: "year",
  startLocation: 0.1,
  endLocation: 0.9,
  renderer: am5xy.AxisRendererX.new(root, {}),
  tooltip: am5.Tooltip.new(root, {})
}));

xAxis.data.setAll(data);

var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
  renderer: am5xy.AxisRendererY.new(root, {}),
  tooltip: am5.Tooltip.new(root, {})
}));


// Add series
// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
function createSeries(field) {
  var series = chart.series.push(am5xy.LineSeries.new(root, {
    xAxis: xAxis,
    yAxis: yAxis,
    valueYField: field,
    categoryXField: "year",
    setStateOnChildren: true,
    // tooltip must be added but you might hide it if you don't want it
    tooltip: am5.Tooltip.new(root, {
      labelText: undefined,
      forceHidden: true,
      animationDuration: 0
    })
  }));

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
  });
  
  series.data.setAll(data);
  
  return series;
}

var series = createSeries("value");
var series2 = createSeries("value2");
var series3 = createSeries("value3");

var cursor = chart.get("cursor");
cursor.setAll({
  xAxis: xAxis,
  yAxis: yAxis
});


// Make stuff animate on load
// https://www.amcharts.com/docs/v5/concepts/animations/
series.appear();
chart.appear(1000, 100);


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