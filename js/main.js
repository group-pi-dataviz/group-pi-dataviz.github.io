import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { COLORS, DATA_SOURCES, BOLD_COUNTRIES } from "./config/constants.js";

// --- --- --- Utility --- --- ---

//creates a rectangle of the height of the source html tag and puts it below target
window.addThumbnail = function (source, target, scale)
{
  // console.log("addThumbnail", source, target, scale);
  const sourceRect = source.getBoundingClientRect();

  const charts = source.querySelectorAll(".visualization");
  const chartRects = Array.from(charts).map(chart => {
    const rect = chart.getBoundingClientRect();
    const xPercent = (rect.left - sourceRect.left) / sourceRect.width * 100;
    const widthPerc = rect.width / sourceRect.width * 100;
    // console.log(chart.getAttribute("chartType"));

    return {
      height: rect.height,
      y: rect.top - sourceRect.top,
      xPerc: xPercent,
      widthPerc: widthPerc,
      type: chart.getAttribute("chartType")
    };
  });

  const sectionSvg = d3.create("svg")
    .attr("height", sourceRect.height * scale)
    .attr("class", "w-2/3 mr-auto");

  const defs = sectionSvg.append("defs");
  const bgGradient = defs.append("linearGradient")
    .attr("id", "thumbnail_bg_gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "8px")
    .attr("gradientUnits", "userSpaceOnUse")
    .attr("spreadMethod", "repeat");
  
  bgGradient.append("stop")
    .attr("offset", "0").attr("stop-color", "#bbbbbb");
  bgGradient.append("stop")
    .attr("offset", "0.5").attr("stop-color", "#bbbbbb");
  bgGradient.append("stop")
    .attr("offset", "0.5").attr("stop-color", "white");
  bgGradient.append("stop")
    .attr("offset", "1").attr("stop-color", "white");

  sectionSvg.append("rect")
    .attr("width", "100%")
    .attr("height", sourceRect.height * scale)
    .attr("fill", "url(#thumbnail_bg_gradient)");

  const thumbnails = sectionSvg.selectAll(".chart-thumb")
    .data(chartRects)
    .enter()
    .append("svg")
    .attr("class", "chart-thumb")
    .attr("x", (d) => d.xPerc + "%")
    .attr("y", (d, i) => d.y * scale)
    .attr("width", d => d.widthPerc +"%")
    .attr("height", d => d.height * scale);

  // thumbnails.append("rect")
  //   .attr("fill", "aliceblue")
  //   .attr("stroke-width", "2px")
  //   .attr("stroke", "black")
  //   .attr("rx", 1)
  //   .attr("ry", 1);
  
  //WIP for thumbnails
  thumbnails.each(function(d) {
  // console.log(d3.select(this), d);
  // switch (d.type) {
  //   case "waffle":
  //     drawWaffleThumbnail(d3.select(this), d);
  //     break;
  //   default:
  //     drawGenericThumbnail(d3.select(this), d);
  //     break;
  // }
});

  target.appendChild(sectionSvg.node());
}

function drawGenericThumbnail() {
  console.log("drawGenericThumbnail");
  return d3.create("g").node();
}

window.addEventListener('scroll', () => {
    const main = document.querySelector('main');
    if (!main) return;

    const mainRect = main.getBoundingClientRect();
    const progressBar_id = document.querySelector('#progressBar_id');
    if (!progressBar_id) return;

    if (mainRect.top >= 0)
      progressBar_id.style.height = `0%`;
    else if (mainRect.bottom <= 0)
      progressBar_id.style.height = `100%`;
    else
    {
      //main lerp from 0 -> main_max = mainRect.height - window.innerHeight
      const progress = Math.min(100, Math.max(0, (Math.abs(mainRect.top) / (mainRect.height - window.innerHeight)) * 100));
      progressBar_id.style.top = `${mainRect.top}px`;
      progressBar_id.style.height = `${progress}%`;
    }
});


// --- --- --- Charts  --- --- ---

// --- --- --- Waffle --- --- ---

const waffleData = (await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.waffleDataSrc, d3.autoType))
.map(d => ({
  event_type: d.MACRO_EVENT_TYPE,
  percentage: d.PERCENTAGE,
}));

function dataToWaffleData(waffleData) {
  const violentPerc = Math.round(waffleData.find(d => d.event_type === "Violent").percentage);

  const array = [];
  for (let i = 0; i < 100; i++) {
    let percIndex = (100-i);

    array.push({x: i % 10, y: Math.floor(i /10), index: percIndex <= violentPerc ? 1 : 0});
  }
  return [array, violentPerc];
}

function drawWaffleChart(waffleData) {
  //convert data to waffle format
  const [waffleDataViz, violentPerc] = dataToWaffleData(waffleData);

  const N_CELLS = 10;
  const SQUARE_SIZE = 25;
  const SQUARE_GAP = 2;

  const totalSideLength = N_CELLS * SQUARE_SIZE + (N_CELLS - 1) * SQUARE_GAP;

  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = totalSideLength;
  const height = totalSideLength;

  // limit displayed width of the responsive SVG (viewBox) to maxChartWidth px
  const maxChartWidth = 400;
  d3.select("#waffle_id").style("max-width", maxChartWidth + "px");
  d3.select("#waffle_id").style("margin", "0 auto");

  // color scale for the two cell states (0 = non-violent, 1 = violent)
  const colorScale = d3.scaleOrdinal()
    .domain([0, 1])
    .range(["lightgray", "#ff4d4d"]);

  const svg = d3.select("#waffle_id") 
      .append("svg")
      .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      .attr("class", "visualization m-auto max-w-[500px]")
      .attr("chartType", "waffle");

  svg.selectAll(".waffle-cell")
      .data(waffleDataViz)
      .enter()
      .append("rect")
      .attr("class", "waffle-cell")
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("x", d => d.x * (SQUARE_SIZE + SQUARE_GAP))
      .attr("y", d => d.y * (SQUARE_SIZE + SQUARE_GAP))
      .attr("width", SQUARE_SIZE)
      .attr("height", SQUARE_SIZE)
      .attr("fill", d => colorScale(d.index));

    // tooltip (remove any existing tooltip first)
  d3.select("body").selectAll(".waffle-tooltip").remove();
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "waffle-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("border", "1px solid #666")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("font-size", "12px")
    .style("opacity", 0);

  // position helper: offsetX/offsetY adjust relative position
  function positionTooltip(event, offsetX = 12, offsetY = 12) {
    const pageX = event.pageX;
    const pageY = event.pageY;

    const node = tooltip.node();
    if (!node) return;

    // initial position to the right/below the cursor
    let left = pageX + offsetX;
    let top = pageY + offsetY;

    // measure tooltip size and viewport scroll
    const rect = node.getBoundingClientRect();
    const tw = rect.width;
    const th = rect.height;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // clamp horizontally (if it would overflow, try placing left of cursor)
    if (left + tw > scrollX + vw - 8) {
      left = pageX - offsetX - tw;
    }
    // clamp vertically (if it would overflow, try placing above cursor)
    if (top + th > scrollY + vh - 8) {
      top = pageY - offsetY - th;
    }

    tooltip.style("left", left + "px").style("top", top + "px");
  }

  // Attach interactivity to violent/non-violent cells
  svg.selectAll(".waffle-cell")
    .on("mouseover", function(event, d) {
      const key = d.index === 1 ? "Violent" : "Non-Violent";

      // percentage from the violent/non-violent
      const perc = key === "Violent" ? violentPerc : 100 - violentPerc;
      const percText = (typeof perc === "number") ? `${+perc}%` : `${perc}`;

      tooltip
        .html(`
          <rect style="display:inline-block;width:12px;height:12px;background:${colorScale(d.index)};vertical-align:middle;margin-right:8px;border-radius:2px;border:1px solid rgba(0,0,0,0.15)"></rect>
          <strong>${key}</strong><br>
          Percentage: ${percText}
          `)
        .style("opacity", 1);

      d3.select(this)
        .raise()
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5);
    })
    .on("mousemove", function(event) {
      // Use the shared positioning helper to place the tooltip and handle viewport clamping
      positionTooltip(event);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "none");
    });

  return svg.node();
}

waffle_id.appendChild(drawWaffleChart(waffleData));

function drawWaffleThumbnail(container)
{
  console.log("cont", container);

  container.attr("viewBox", [0,0,39,39])

  container.append("rect")
    .attr("width", 37)
    .attr("height", 37)
    .attr("fill", "white")
    .attr("stroke", "black");

  for (let i = 0; i < 3; ++i)
  {
    for (let j = 0; j < 3; ++j)
    {
      container.append("rect")
        .attr("x", j * 11 + 3)
        .attr("y", i * 11 + 3)
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", (i*3 + j) > 3 ? "#ff4d4d" : "lightgray");
    }
  }
}

// --- --- --- Grouped --- --- ---

const boldCountries = new Set(["Afghanistan", "Philippines", "Myanmar"]);

const groupedData = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.groupedDataSrc, d3.autoType);

function drawGroupedChart(groupedData, maxWidth=600, maxHeight=500) {
  const colors = function(category) {
    switch(category) {
      case "events": return "#888888";
      case "fatalities": return "#ff4d4d";
      default: return "gray";
    }
  }

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, maxWidth, maxHeight])
    .attr("class", "visualization m-auto");

  const yScale = d3.scaleBand()
    .domain(groupedData.map(d => d.country))
    .range([0, maxHeight - 50])
    .padding(0.2);

  const xScale = d3.scaleLinear()
    .domain([0, d3.max(groupedData, d => Math.max(d.events, d.fatalities))])
    .range([70, maxWidth - 40]);

  const groups = svg.selectAll(".grouped-bar")
    .data(groupedData)
    .enter()
    .append("g")
    .attr("class", "grouped-bar")
    .attr("chartType", "groupedBar")
    .attr("transform", d => `translate(0, ${yScale(d.country)})`);

  // tooltip (remove any existing tooltip first)
  d3.select("body").selectAll(".grouped-bar-tooltip").remove();
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "grouped-bar-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("border", "1px solid #666")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("font-size", "12px")
    .style("opacity", 0);

  // position helper: offsetX/offsetY adjust relative position
  function positionTooltip(event, offsetX = 12, offsetY = 12) {
    const pageX = event.pageX;
    const pageY = event.pageY;

    const node = tooltip.node();
    if (!node) return;

    // initial position to the right/below the cursor
    let left = pageX + offsetX;
    let top = pageY + offsetY;

    // measure tooltip size and viewport scroll
    const rect = node.getBoundingClientRect();
    const tw = rect.width;
    const th = rect.height;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // clamp horizontally (if it would overflow, try placing left of cursor)
    if (left + tw > scrollX + vw - 8) {
      left = pageX - offsetX - tw;
    }
    // clamp vertically (if it would overflow, try placing above cursor)
    if (top + th > scrollY + vh - 8) {
      top = pageY - offsetY - th;
    }

    tooltip.style("left", left + "px").style("top", top + "px");
  }

  // Attach interactivity to rects
  groups
    .on("mouseover", function(event, d) { // parent group's datum contains .key
      const country = d.country;

      // percentage from the stacked (dataPerc) row rounded to 2 decimals
      const events = +d.events;
      // absolute count from the dataCounts dataset (match by COUNTRY)
      const fatalities = +d.fatalities;

      const eventsText = (typeof events === "number") ? `${events}` : `${events}`;
      const fatalitiesText = (typeof fatalities === "number") ? `${fatalities}` : `${fatalities}`;

      tooltip
        .html(`
          <strong>${country}</strong><br>
          <rect style="display:inline-block;width:12px;height:12px;background:${colors("events")};vertical-align:middle;margin-right:8px;border-radius:2px;border:1px solid rgba(0,0,0,0.15)"></rect>
          Events: ${eventsText}<br>
          <rect style="display:inline-block;width:12px;height:12px;background:${colors("fatalities")};vertical-align:middle;margin-right:8px;border-radius:2px;border:1px solid rgba(0,0,0,0.15)"></rect>
          Fatalities: ${fatalitiesText}
          `)
        .style("opacity", 1);

      d3.select(this)
        .raise()
        .attr("opacity", 0.7);
    })
    .on("mousemove", function(event) {
      // Use the shared positioning helper to place the tooltip and handle viewport clamping
      positionTooltip(event);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("opacity", 1);
    });

  //event bars
  groups.append("rect")
    .attr("class", "bar events-bar")
    .attr("x", xScale(0))
    .attr("y", 0)
    .attr("width", d => xScale(d.events) - xScale(0))
    .attr("height", yScale.bandwidth() / 2)
    .attr("fill", colors("events"));

  //event labels
  groups.append("text")
    .attr("class", "event-label")
    .attr("x", d => xScale(d.events) + 2)
    .attr("y", yScale.bandwidth() / 2 - 2)
    .attr("fill", colors("events"))
    .attr("text-anchor", "start")
    .attr("font-size", "10px")
    .text(d => d.events);

  //fatalities bars
  groups.append("rect")
    .attr("class", "bar fatalities-bar")
    .attr("x", xScale(0))
    .attr("y", d => yScale.bandwidth() / 2)
    .attr("width", d => xScale(d.fatalities) - xScale(0))
    .attr("height", yScale.bandwidth() / 2)
    .attr("fill", colors("fatalities"));

  //fatalities labels
  groups.append("text")
    .attr("class", "fatalities-label")
    .attr("x", d => xScale(d.fatalities) + 2)
    .attr("y", yScale.bandwidth() - 2)
    .attr("fill", colors("fatalities"))
    .attr("text-anchor", "start")
    .attr("font-size", "10px")
    .text(d => d.fatalities);

  //axes
  svg.append("g")
    .attr("transform", `translate(0,${maxHeight - 50})`)
    .call(d3.axisBottom(xScale));

  svg.append("g")
    .attr("transform", `translate(70,0)`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .filter(d => boldCountries.has(d))
    .attr("font-weight", "bold");

  //legend
  const legend = svg.append("g")
    .attr("transform", `translate(${maxWidth - 100}, ${maxHeight - 100})`);

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", colors("events"));
  legend.append("text")
    .attr("x", 16)
    .attr("y", 11)
    .text("Events")
    .style("font-size", "14px");

  legend.append("rect")
    .attr("x", 0)
    .attr("y", 25)
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", colors("fatalities"));
  legend.append("text")
    .attr("x", 16)
    .attr("y", 36)
    .text("Fatalities")
    .style("font-size", "14px");
  
  return svg.node();
}

groupedBar_id.appendChild(drawGroupedChart(groupedData));

// --- --- --- Stacked 100% --- --- ---

const dataPerc = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.stackedDataPercSrc, d3.autoType);

const dataCounts = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.stackedDataCountsSrc, d3.autoType);

function drawStackedChart(dataPerc, dataCounts, maxWidth=600, maxHeight=600) {
  const eventTypes = dataPerc.columns.filter(d => d !== "COUNTRY");

  const countries = dataPerc.map(d => d["COUNTRY"]);

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(eventTypes)
    .range(eventTypes.map((d, i) => d3.schemeDark2[(i + 4) % 8])); //offset to avoid similar colors with grouped chart
  
  // stack the dataPerc? --> stack per subgroup
  const stackedData = d3.stack()
    .keys(eventTypes)
    (dataPerc);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, maxWidth, maxHeight])
    .attr("class", "visualization m-auto")
    .attr("chartType", "stacked100");

  const yScale = d3.scaleBand()
    .domain(countries)
    .range([100, maxHeight - 50])
    .padding(0.2);

  const xScale = d3.scaleLinear()
    .domain([0, 100])  //100% stacked
    .range([70, maxWidth - 40]);

  // Show the bars
  const groups = svg.selectAll(".stacked-bar")
    // Enter in the stack data
    .data(stackedData)
    .enter().append("g")
      // set the fill on the group using the series key (each series has a .key)
      .attr("fill", d => color(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter().append("rect")
        .attr("x", d => xScale(d[0]))
        .attr("y", d => yScale(d.data.COUNTRY))
        .attr("width", d => xScale(d[1]) - xScale(d[0]))
        .attr("height", yScale.bandwidth());

  // tooltip (remove any existing tooltip first)
  d3.select("body").selectAll(".stacked-tooltip").remove();
  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "stacked-tooltip")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("background", "white")
    .style("border", "1px solid #666")
    .style("padding", "8px")
    .style("border-radius", "4px")
    .style("box-shadow", "0 2px 6px rgba(0,0,0,0.2)")
    .style("font-size", "12px")
    .style("opacity", 0);

  // position helper: offsetX/offsetY adjust relative position
  function positionTooltip(event, offsetX = 12, offsetY = 12) {
    const pageX = event.pageX;
    const pageY = event.pageY;

    const node = tooltip.node();
    if (!node) return;

    // initial position to the right/below the cursor
    let left = pageX + offsetX;
    let top = pageY + offsetY;

    // measure tooltip size and viewport scroll
    const rect = node.getBoundingClientRect();
    const tw = rect.width;
    const th = rect.height;
    const scrollX = window.pageXOffset;
    const scrollY = window.pageYOffset;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // clamp horizontally (if it would overflow, try placing left of cursor)
    if (left + tw > scrollX + vw - 8) {
      left = pageX - offsetX - tw;
    }
    // clamp vertically (if it would overflow, try placing above cursor)
    if (top + th > scrollY + vh - 8) {
      top = pageY - offsetY - th;
    }

    tooltip.style("left", left + "px").style("top", top + "px");
  }

  // Attach interactivity to rects
  groups
    .on("mouseover", function(event, d) {
      const series = d3.select(this.parentNode).datum(); // parent group's datum contains .key
      const key = series.key;
      const country = d.data.COUNTRY;

      // percentage from the stacked (dataPerc) row rounded to 2 decimals
      const perc = +d.data[key].toFixed(2);
      // absolute count from the dataCounts dataset (match by COUNTRY)
      const countsRow = dataCounts.find(r => r.COUNTRY === country) || {};
      const abs = countsRow[key] != null ? countsRow[key] : 0;

      const percText = (typeof perc === "number") ? `${+perc}%` : `${perc}`;
      const absText = (typeof abs === "number") ? abs.toLocaleString() : abs;

      tooltip
        .html(`
          <rect style="display:inline-block;width:12px;height:12px;background:${color(key)};vertical-align:middle;margin-right:8px;border-radius:2px;border:1px solid rgba(0,0,0,0.15)"></rect>
          <strong>${key}</strong><br>
          <em>${country}</em><br>
          Percentage: ${percText}<br>
          Count: ${absText}
          `)
        .style("opacity", 1);

      d3.select(this)
        .raise()
        .attr("stroke", "#222")
        .attr("stroke-width", 1.5);
    })
    .on("mousemove", function(event) {
      // Use the shared positioning helper to place the tooltip and handle viewport clamping
      positionTooltip(event);
    })
    .on("mouseout", function() {
      tooltip.style("opacity", 0);
      d3.select(this).attr("stroke", "none");
    });

  //axes
  svg.append("g")
    .attr("transform", `translate(0,${maxHeight - 50})`)
    .call(d3.axisBottom(xScale));

  const yAxis = svg.append("g")
    .attr("transform", `translate(70,0)`)
    .call(d3.axisLeft(yScale));

  yAxis.selectAll("text")
    .filter(d => boldCountries.has(d))
    .attr("font-weight", "bold");

  // horizontal legend on two rows
  const legend = svg.append("g")
    .attr("transform", `translate(${100}, ${50})`);

  eventTypes.forEach((eventType, i) => {
    var x = (i % 3) * 150;
    var y = Math.floor(i / 3) * 20;
    if (i == 1 || i == 4) x -= 60;
    legend.append("rect")
      .attr("x", x - 20)
      .attr("y", y)
      .attr("width", 12)
      .attr("height", 12)
      .attr("fill", color(eventType));

    legend.append("text")
      .attr("x", 16 + x - 20)
      .attr("y", 11 + y)
      .text(eventType)
      .style("font-size", "13px");
  });

  return svg.node();
}

stackedBar_id.appendChild(drawStackedChart(dataPerc, dataCounts));


// --- --- --- Heatmap --- --- ---

const afghanistanData = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.heatmapAfghanistanSrc, d3.autoType);
const myanmarData = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.heatmapMyanmarSrc, d3.autoType);
const philippinesData = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.heatmapPhilippinesSrc, d3.autoType);

// Customizable parameters

const HEATMAP_CONFIG = {
  // Cell dimensions and spacing
  cellWidth: 35,
  cellHeight: 35,
  cellPadding: 0.08,
  cellCornerRadius: 3,

  // Margins around the heatmap
  margin: {
    top: 0,
    right: 40,
    bottom: 60,
    left: 160
  },

  // Color scheme (interpolator)
  colorScheme: d3.interpolateYlOrRd,

  // Colorbar settings (for shared bar)
  colorbar: {
    width: 20,
    height: 240,
    marginLeft: 30,
    tickCount: 5,
    title: "Events"
  },

  // Font sizes
  fontSize: {
    axis: 11,
    categoryLabel: 11,
    colorbarTitle: 12,
    colorbarTicks: 10
  },

  // Cell styling
  cellOpacity: 0.9,
  cellStrokeWidth: 1,
  cellHoverStroke: "black",

  // Category label mapping
  /*
  categoryLabels: {
    "Battles": "⚔️",
    "Explosions/Remote violence": "💥",
    "Protests": "✊",
    "Riots": "🔥",
    "Strategic developments": "🎯",
    "Violence against civilians": "👥"
  }
    */

  categoryLabels: {
    "Battles": "Battles",
    "Explosions/Remote violence": "Explosions/Remote violence",
    "Protests": "Protests",
    "Riots": "Riots",
    "Strategic developments": "Strategic developments",
    "Violence against civilians": "Violence against civilians"
  }

};

// Build a single, shared logarithmic color mapping from all heatmap datasets.
// Use log(v+1) to safely handle zeros.
// Build shared color mapping
function buildSharedColorMapping(datasets) {
  const vals = [];
  datasets.forEach(data => {
    const cats = data.columns.slice(1);
    data.forEach(d => cats.forEach(c => vals.push(+d[c] || 0)));
  });

  const minVal = d3.min(vals);
  const maxVal = d3.max(vals);
  const logMin = Math.log(minVal + 1);
  const logMax = Math.log(maxVal + 1);
  const logRange = (logMax - logMin) || 1;

  const valueToColor = (v) => {
    const t = (Math.log((v || 0) + 1) - logMin) / logRange;
    return HEATMAP_CONFIG.colorScheme(Math.max(0, Math.min(1, t)));
  };

  return { minVal, maxVal, valueToColor };
}

const sharedColor = buildSharedColorMapping([afghanistanData, myanmarData, philippinesData]);

// Draw shared colorbar
function drawSharedColorbar(minVal, maxVal, valueToColor) {
  let container = d3.select("#shared_heatmap_colorbar");
  if (container.empty()) {
    container = d3.select("body")
      .append("div")
      .attr("id", "shared_heatmap_colorbar")
      .style("display", "block")
      .style("margin", "20px auto")
      .style("text-align", "center")
      .style("width", "100%");
  } else {
    container.selectAll("*").remove();
  }

  const barWidth = 400;
  const barHeight = 20;
  const w = barWidth + 120;
  const h = 80;

  const svg = container.append("svg")
    .attr("viewBox", [0, 0, w, h])
    .style("overflow", "visible")
    .style("display", "block")
    .style("margin", "0 auto");

  const gradientId = "shared-colorbar-gradient";
  const defs = svg.append("defs");
  const lg = defs.append("linearGradient")
    .attr("id", gradientId)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

  const stops = 60;
  d3.range(stops).forEach(i => {
    const t = i / (stops - 1);
    const logMin = Math.log(minVal + 1);
    const logMax = Math.log(maxVal + 1);
    const logVal = logMin + t * (logMax - logMin);
    const val = Math.exp(logVal) - 1;
    lg.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", valueToColor(val));
  });

  const g = svg.append("g").attr("transform", `translate(60,30)`);

  g.append("text")
    .attr("x", barWidth / 2)
    .attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", HEATMAP_CONFIG.fontSize.colorbarTitle)
    .style("font-weight", "bold")
    .text(HEATMAP_CONFIG.colorbar.title);

  g.append("rect")
    .attr("width", barWidth)
    .attr("height", barHeight)
    .style("fill", `url(#${gradientId})`)
    .style("stroke", "#333")
    .style("stroke-width", 1);

  const cbScale = d3.scaleLog()
    .domain([Math.max(1, minVal + 1), Math.max(2, maxVal + 1)])
    .range([0, barWidth]);

  const minPower = Math.floor(Math.log10(Math.max(1, minVal + 1)));
  const maxPower = Math.ceil(Math.log10(maxVal + 1));
  const tickValues = [];
  for (let i = minPower; i <= maxPower; i++) {
    const tickVal = i == 0 ? Math.pow(10, i) : Math.pow(10, i) + 1;
    if (tickVal >= minVal + 1 && tickVal <= maxVal + 1) {
      tickValues.push(tickVal);
    }
  }
  tickValues.push(maxVal);

  const cbAxis = d3.axisBottom(cbScale)
    .tickValues(tickValues)
    .tickFormat(v => {
      const raw = Math.max(0, Math.round(v - 1));
      return d3.format(",d")(raw);
    });

  g.append("g")
    .attr("transform", `translate(0,${barHeight})`)
    .style("font-size", HEATMAP_CONFIG.fontSize.colorbarTicks)
    .call(cbAxis);
}

// Create shared tooltip
d3.select("body").selectAll(".heatmap-tooltip").remove();
const sharedTooltip = d3.select("body")
  .append("div")
  .attr("class", "heatmap-tooltip")
  .style("position", "absolute")
  .style("pointer-events", "none")
  .style("background", "white")
  .style("border", "2px solid #667eea")
  .style("padding", "10px")
  .style("border-radius", "8px")
  .style("box-shadow", "0 4px 12px rgba(102, 126, 234, 0.3)")
  .style("font-size", "13px")
  .style("max-width", "280px")
  .style("z-index", "1000")
  .style("opacity", 0);

// Tooltip positioning helper
function positionTooltip(event, tooltip, offsetX = 12, offsetY = 12) {
  const pageX = event.pageX;
  const pageY = event.pageY;
  const node = tooltip.node();
  if (!node) return;

  let left = pageX + offsetX;
  let top = pageY + offsetY;

  const rect = node.getBoundingClientRect();
  const tw = rect.width;
  const th = rect.height;
  const scrollX = window.pageXOffset;
  const scrollY = window.pageYOffset;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (left + tw > scrollX + vw - 8) {
    left = pageX - offsetX - tw;
  }
  if (top + th > scrollY + vh - 8) {
    top = pageY - offsetY - th;
  }

  tooltip.style("left", left + "px").style("top", top + "px");
}

// Draw heatmap function
function drawHeatmap(data, id = "#heatmap_id") {
  const myYears = data.map(d => d.YEAR);
  const myCategories = data.columns.slice(1);

  const longData = [];
  data.forEach(d => {
    myCategories.forEach(cat => {
      longData.push({
        year: d.YEAR,
        category: cat,
        value: +d[cat] || 0
      });
    });
  });

  const width = myYears.length * HEATMAP_CONFIG.cellWidth;
  const height = myCategories.length * HEATMAP_CONFIG.cellHeight;

  const x = d3.scaleBand()
    .range([0, width])
    .domain(myYears)
    .padding(HEATMAP_CONFIG.cellPadding);

  const y = d3.scaleBand()
    .range([0, height])
    .domain(myCategories)
    .padding(HEATMAP_CONFIG.cellPadding);

  d3.select(id).selectAll("*").remove();

  const svg = d3.select(id)
    .append("svg")
    .attr("viewBox", [0, 0, width + HEATMAP_CONFIG.margin.left + HEATMAP_CONFIG.margin.right, height + HEATMAP_CONFIG.margin.top + HEATMAP_CONFIG.margin.bottom])
    .append("g")
    .attr("transform", `translate(${HEATMAP_CONFIG.margin.left},${HEATMAP_CONFIG.margin.top})`);

  svg.append("g")
    .style("font-size", HEATMAP_CONFIG.fontSize.axis)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "middle");

  svg.selectAll(".domain").remove();

  svg.append("g")
    .style("font-size", HEATMAP_CONFIG.fontSize.categoryLabel)
    .call(d3.axisLeft(y).tickSize(0).tickFormat(d => HEATMAP_CONFIG.categoryLabels[d] || d));

  const mouseover = (event, d) => {
    const cellColor = sharedColor.valueToColor(d.value);
    const label = HEATMAP_CONFIG.categoryLabels[d.category] || d.category;
    
    sharedTooltip
      .html(`
        <div style="display:flex;align-items:center;margin-bottom:6px;">
          <div style="width:14px;height:14px;background:${cellColor};border:1px solid rgba(0,0,0,0.2);border-radius:2px;margin-right:8px;"></div>
          <strong style="font-size:14px;">${label}</strong>
        </div>
        <div style="color:#555;">Year: <strong>${d.year}</strong></div>
        <div style="color:#555;">Events: <strong>${d.value.toLocaleString()}</strong></div>
      `)
      .style("opacity", 1);
    
    d3.select(event.currentTarget)
      .raise()
      .style("stroke", HEATMAP_CONFIG.cellHoverStroke)
      .style("stroke-width", 2)
      .style("opacity", 1);
  };

  const mousemove = (event, d) => {
    positionTooltip(event, sharedTooltip);
  };

  const mouseleave = (event, d) => {
    sharedTooltip.style("opacity", 0);
    d3.select(event.currentTarget)
      .style("stroke", "none")
      .style("opacity", HEATMAP_CONFIG.cellOpacity);
  };

  svg.selectAll("rect")
    .data(longData)
    .enter()
    .append("rect")
    .attr("x", d => x(d.year))
    .attr("y", d => y(d.category))
    .attr("rx", HEATMAP_CONFIG.cellCornerRadius)
    .attr("ry", HEATMAP_CONFIG.cellCornerRadius)
    .attr("width", x.bandwidth())
    .attr("height", y.bandwidth())
    .style("fill", d => sharedColor.valueToColor(d.value))
    .style("stroke-width", HEATMAP_CONFIG.cellStrokeWidth)
    .style("stroke", "none")
    .style("opacity", HEATMAP_CONFIG.cellOpacity)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);
}

// Draw all three heatmaps
drawHeatmap(afghanistanData, "#heatmap_id");
drawHeatmap(myanmarData, "#heatmap_id_2");
drawHeatmap(philippinesData, "#heatmap_id_3");

// Draw shared colorbar
drawSharedColorbar(sharedColor.minVal, sharedColor.maxVal, sharedColor.valueToColor);

// --- Navigation System Heatmap ---
// Se esiste un container di navigazione, aggiungi i pulsanti
const navContainer = document.querySelector('.selector.country');
if (navContainer) {
  // I pulsanti dovrebbero già esistere nell'HTML, quindi aggiungiamo solo gli event listener
  const countryButtons = document.querySelectorAll('.btn.country');
  const heatmapContainers = document.querySelectorAll('.multi-container.heatmap');

  if (countryButtons.length > 0 && heatmapContainers.length > 0) {
    countryButtons.forEach(button => {
      button.addEventListener('click', () => {
        const country = button.getAttribute('data-country');
        
        // Update active button
        countryButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show corresponding heatmap
        heatmapContainers.forEach(container => {
          container.classList.remove('active');
        });
        
        const targetContainer = document.getElementById(`heatmap-${country}`);
        if (targetContainer) {
          targetContainer.classList.add('active');
        }
      });
    });
  }
}



// --- --- ---  Bar Chart --- --- ---

const barData = await d3.dsv(";", "./data/section_1/" + DATA_SOURCES.barDataSrc, d3.autoType);

function drawBarChart(barData, maxWidth=600, maxHeight=400) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, maxWidth, maxHeight])
    .attr("class", "visualization m-auto")
    .attr("chartType", "bar");

  const xScale = d3.scaleBand()
    .domain(barData.map(d => d.YEAR))
    .range([70, maxWidth - 40])
    .padding(0.2);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(barData, d => d.FATALITIES)])
    .range([maxHeight - 50, 20]);

  svg.selectAll(".bar")
    .data(barData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.YEAR))
    .attr("y", d => yScale(d.FATALITIES))
    .attr("width", xScale.bandwidth())
    .attr("height", d => maxHeight - 50 - yScale(d.FATALITIES))
    .attr("fill", "#ff4d4d");

  //axes
  svg.append("g")
    .attr("transform", `translate(0,${maxHeight - 50})`)
    .call(g => g.call(d3.axisBottom(xScale).tickFormat(d3.format("d"))))
      .call(g => g.select(".domain").remove()); // remove axis line

  const yAxisG = svg.append("g")
    .attr("transform", `translate(70,0)`)
    .call(g => g.call(d3.axisLeft(yScale))
      .call(g => g.select(".domain").remove())) // remove axis line
    .call(g => g.selectAll(".tick line")
      .clone()
      .attr("x2", maxWidth - 110)
      .attr("stroke-opacity", 0.5));

  yAxisG.lower();

  return svg.node();
}

bar_id.appendChild(drawBarChart(barData));

// --- --- --- Histogram --- --- ---

const histogramEventsData = await d3.dsv(",", "./data/section_2/" + DATA_SOURCES.histogramEventsDataSrc, d3.autoType);
const histogramFatalitiesData = await d3.dsv(",", "./data/section_2/" + DATA_SOURCES.histogramFatalitiesDataSrc, d3.autoType);

function drawHistogram(histogramData, maxWidth=600, maxHeight=400) {
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, maxWidth, maxHeight])
    .attr("class", "visualization m-auto")
    .attr("chartType", "histogram");

  const monthNames = histogramData.map(d => d.MONTH);

  // one color for events, another for fatalities
  const color = histogramData[0].EVENTS != null ? "#888888" : "#ff4d4d";
  
  const xScale = d3.scaleBand()
    .domain(monthNames)
    .range([70, maxWidth - 40])
    .padding(0.05);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(histogramData, d => d.EVENTS || d.FATALITIES)])
    .range([maxHeight - 50, 20]);

  svg.selectAll(".histogram")
    .data(histogramData)
    .enter()
    .append("rect")
    .attr("class", "histogram")
    .attr("x", d => xScale(d.MONTH))
    .attr("y", d => yScale(d.EVENTS || d.FATALITIES))
    .attr("width", xScale.bandwidth())
    .attr("height", d => maxHeight - 50 - yScale(d.EVENTS || d.FATALITIES))
    .attr("fill", color);

  //axes
  // X axis with rotated labels and no domain line
  svg.append("g")
    .attr("transform", `translate(0,${maxHeight - 50})`)
    .call(g => g.call(d3.axisBottom(xScale).tickFormat(d => d)) // keep original month names
      .call(g => g.select(".domain").remove())) // remove axis line
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  // Y axis with no domain line and grid lines behind bars
  const yAxisG = svg.append("g")
    .attr("transform", `translate(70,0)`)
    .call(g => g.call(d3.axisLeft(yScale))
      .call(g => g.select(".domain").remove()))
    .call(g => g.selectAll(".tick line")
      .clone()
      .attr("x2", maxWidth - 110)
      .attr("stroke-opacity", 0.5));

  yAxisG.lower();

  return svg.node();
}

histogram_id.appendChild(drawHistogram(histogramEventsData));
histogram_id_2.appendChild(drawHistogram(histogramFatalitiesData));

// --- Navigation System Histogram ---
const container = document.querySelector('.selector.histogram-type');
if (container) {
  // I pulsanti dovrebbero già esistere nell'HTML, quindi aggiungiamo solo gli event listener
  const typeButtons = document.querySelectorAll('.btn.histogram-type');
  const histogramContainers = document.querySelectorAll('.multi-container.histogram');

  if (typeButtons.length > 0 && histogramContainers.length > 0) {
    typeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const type = button.getAttribute('data-type');

        // Update active button
        typeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');

        // Show corresponding histogram
        histogramContainers.forEach(container => {
          container.classList.remove('active');
        });

        const targetContainer = document.getElementById(`histogram-${type}`);
        if (targetContainer) {
          targetContainer.classList.add('active');
        }
      });
    });
  }
}

// --- --- --- Box Plot --- --- ---

const boxData = await d3.dsv(';', './data/section_2/' + DATA_SOURCES.boxDataSrc);

function extractBoxValues(data, distributionLambda, whis=1.5)
{
  let values = distributionLambda(data);
  values.sort();
  const q1 = d3.quantile(values, 0.25);
  const median = d3.quantile(values, 0.5);
  const q3 = d3.quantile(values, 0.75);
  const interQuantileRange = q3 - q1;
  const min = Math.max(q1 - whis * interQuantileRange, 0);
  const max = q3 + whis * interQuantileRange;
  const outliers = values.filter(v => v < min || v > max);
  return { min, q1, median, q3, max, outliers };
}

function drawBoxplot(data, maxWidth=600, maxHeight=400)
{
  function drawSingleBoxplot(svg, boxValues, xPos, bandwidth, yScale)
  {
    const boxWidth = bandwidth * 0.6;

    const g = svg.append('g')
      .attr('transform', `translate(0,0)`);

    g.append('rect')
      .attr('x', xPos - boxWidth / 2)
      .attr('y', yScale(boxValues.q3))
      .attr('width', boxWidth)
      .attr('height', yScale(boxValues.q1) - yScale(boxValues.q3))
      .attr('fill', '#69b3a2')
      .attr('stroke', 'black');

    // Median line
    g.append('line')
      .attr('x1', xPos - boxWidth / 2)
      .attr('x2', xPos + boxWidth / 2)
      .attr('y1', yScale(boxValues.median))
      .attr('y2', yScale(boxValues.median))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

    //median label
    g.append('text')
      .attr('x', xPos + boxWidth / 2 + 5)
      .attr('y', yScale(boxValues.median) + 4)
      .text(boxValues.median.toFixed(2))
      .attr('font-size', '10px')
      .attr('fill', 'black');

    // Whiskers
    g.append('line')
      .attr('x1', xPos)
      .attr('x2', xPos)
      .attr('y1', yScale(boxValues.min))
      .attr('y2', yScale(boxValues.q1))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
    g.append('line')
      .attr('x1', xPos)
      .attr('x2', xPos)
      .attr('y1', yScale(boxValues.q3))
      .attr('y2', yScale(boxValues.max))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // Min/Max lines
    g.append('line')
      .attr('x1', xPos - boxWidth / 2)
      .attr('x2', xPos + boxWidth / 2)
      .attr('y1', yScale(boxValues.min))
      .attr('y2', yScale(boxValues.min))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);
    g.append('line')
      .attr('x1', xPos - boxWidth / 2)
      .attr('x2', xPos + boxWidth / 2)
      .attr('y1', yScale(boxValues.max))
      .attr('y2', yScale(boxValues.max))
      .attr('stroke', 'black')
      .attr('stroke-width', 1);

    // Outliers
    g.selectAll('circle.outlier')
      .data(boxValues.outliers)
      .enter()
      .append('circle')
      .attr('class', 'outlier')
      .attr('cx', xPos)
      .attr('cy', d => yScale(d))
      .attr('r', 3)
      .attr('fill', '#ff000088')
      .attr('stroke', 'black');
  }

  const years = function(d) { return d.YEAR; };
  const months = function(d) { return d.MONTH; };
  const catMap = years;

  const extraFilter = function(d) { return d.FAT_BAT != null && !isNaN(d.FAT_BAT); };

  const categories = Array.from(new Set(data.map(catMap)));

  const svg = d3.create('svg')
    .attr('viewBox', [0,0,maxWidth,maxHeight]);

  const xScale = d3.scaleBand()
    .domain(categories)
    .range([50, maxWidth-50])
    .padding(0.4);

  const yScale = d3.scaleLinear()
    .domain([0, 20])
    .range([maxHeight - 50, 50]);


  for (const category of categories) {
    const catData = data.filter(d => catMap(d) === category).filter(extraFilter);
    const distr = function(d) { return d.map(dd => dd.FAT_BAT); };
    const values = extractBoxValues(catData, distr, 1.5);
    drawSingleBoxplot(svg, values, xScale(category) + xScale.bandwidth() / 2, xScale.bandwidth(), yScale);
  }

  // Y Axis
  svg.append('g')
    .attr('transform', `translate(50,0)`)
    .call(d3.axisLeft(yScale));

  // X Axis
  const xLabels = svg.append('g')
    .attr('transform', `translate(0,${maxHeight - 50})`)
    .call(d3.axisBottom(xScale));
    //rotate labels
  // xLabels.selectAll('text')
    // .attr('transform', 'rotate(-45)')
    // .attr('text-anchor', 'end');

  const info = svg.append('text')
    .attr('x', maxWidth / 2)
    .attr('y', 80)
    .attr('font-size', '10px')
    .attr('text-anchor', 'middle')
    .append('tspan')
    .attr('x', maxWidth / 2)
    .attr('dy', '0em')
    .text('The year 2021 showed the most variability in fatalities per battle,');

  info.append('tspan')
    .attr('x', maxWidth / 2)
    .attr('dy', '1.2em')
    .text('with an outlier in the month of August reaching 14.54 fatalities per battle.');


  return svg.node();
}

boxplot_id.appendChild(drawBoxplot(boxData));


// --- --- --- Ridgeline Chart with Dual Scale Support --- --- ---

const rawText = await d3.text('./data/section_2/' + DATA_SOURCES.ridgeDataSrc);
const parsed = d3.csvParseRows(rawText);

// --- Configuration ---
const CONFIG = {
  maxWidth: 800,
  maxHeight: 500,
  margin: { top: 40, right: 150, bottom: 60, left: 180 },
  animationInterval: 800,
  kdePoints: 150,
  bandwidthMultiplier: 0.4,
  curveHeightRatio: 0.75,
  minCurveHeight: 12
};

// --- Header Parsing ---
const headerCommodity = parsed[0];
const columnNames = headerCommodity.map((c, i) => 
  c ? c.replaceAll(' ', '_') : `col${i}`
);

// --- Data Parsing ---
const dataRows = parsed.slice(3);
const data = dataRows.map(r => {
  const obj = {};
  columnNames.forEach((name, i) => obj[name] = r[i]);
  return obj;
});

data.forEach(d => d.year = +d.year);

const priceCols = columnNames.filter(cn => 
  cn !== 'year' && cn !== 'month' && cn !== 'date'
);

// --- Category Configuration ---
const categoryGroups = {
  'Grains & Flour': {
    items: ['Wheat', 'Wheat_flour', 'Wheat_flour_(low_quality)', 
            'Wheat_flour_(high_quality)', 'Bread'],
    color: '#8B4513'
  },
  'Rice': {
    items: ['Rice_(low_quality)', 'Rice_(high_quality)'],
    color: '#DEB887'
  },
  'Other Foods': {
    items: ['Oil_(cooking)', 'Pulses', 'Salt', 'Sugar'],
    color: '#2E8B57'
  },
  'Labor': {
    items: ['Wage_(non-qualified_labour,_non-agricultural)', 
            'Wage_(qualified_labour)'],
    color: '#4169E1'
  },
  'Energy & Currency': {
    items: ['Fuel_(diesel)', 'Exchange_rate'],
    color: '#DC143C'
  }
};

const categoryMap = {
  'Bread': 'Bread',
  'Fuel_(diesel)': 'Fuel (diesel)',
  'Wage_(non-qualified_labour,_non-agricultural)': 'Wage (non-qualified)',
  'Wage_(qualified_labour)': 'Wage (qualified)',
  'Wheat': 'Wheat',
  'Wheat_flour': 'Wheat flour',
  'Rice_(low_quality)': 'Rice (low quality)',
  'Rice_(high_quality)': 'Rice (high quality)',
  'Exchange_rate': 'Exchange rate',
  'Oil_(cooking)': 'Cooking oil',
  'Pulses': 'Pulses',
  'Salt': 'Salt',
  'Sugar': 'Sugar',
  'Wheat_flour_(high_quality)': 'Wheat flour (high quality)',
  'Wheat_flour_(low_quality)': 'Wheat flour (low quality)'
};

// Create ordered categories
const orderedCategories = [];
const categoryColors = {};
Object.entries(categoryGroups).forEach(([groupName, groupData]) => {
  groupData.items.forEach(item => {
    if (priceCols.includes(item)) {
      orderedCategories.push(item);
      categoryColors[item] = groupData.color;
    }
  });
});

// --- Compute Period-Specific Statistics ---
function computePeriodStats(yearFilter) {
  const filtered = data.filter(yearFilter);
  const values = filtered.flatMap(d => 
    orderedCategories.map(k => {
      const v = d[k];
      return (v !== '' && v != null && !isNaN(+v)) ? +v : NaN;
    }).filter(v => !isNaN(v))
  );
  
  return {
    max: values.length > 0 ? d3.max(values) : 1,
    std: values.length > 0 ? d3.deviation(values) || 1 : 1,
    count: values.length
  };
}

const periodStats = {
  early: computePeriodStats(d => d.year >= 2000 && d.year <= 2004),
  late: computePeriodStats(d => d.year >= 2005)
};

// Debug info
window.__ridgelineStats = periodStats;

// --- Helper Functions ---
function getStatsForYear(year) {
  return (year >= 2000 && year <= 2004) ? periodStats.early : periodStats.late;
}

function parseValue(value) {
  return (value !== '' && value != null && !isNaN(+value)) ? +value : NaN;
}

function kernelEpanechnikov(bandwidth) {
  return function(v) {
    const normalized = Math.abs(v / bandwidth);
    return normalized <= 1 ? 0.75 * (1 - normalized * normalized) / bandwidth : 0;
  };
}

function kernelDensityEstimator(kernel, ticks) {
  return function(values) {
    return ticks.map(x => [x, d3.mean(values, v => kernel(x - v))]);
  };
}

// --- Prepare Data for Specific Year ---
function prepareDataForYear(year) {
  const filtered = data.filter(d => d.year === year);
  const stats = getStatsForYear(year);
  
  // Parse values
  filtered.forEach(d => {
    orderedCategories.forEach(key => {
      d[key] = parseValue(d[key]);
    });
  });
  
  // Use period-specific bandwidth
  const bandwidth = stats.std * CONFIG.bandwidthMultiplier;
  const maxRange = stats.max * 1.1;
  
  const kde = kernelDensityEstimator(
    kernelEpanechnikov(bandwidth),
    d3.ticks(0, maxRange, CONFIG.kdePoints)
  );
  
  const allDensity = orderedCategories.map(key => {
    const values = filtered
      .map(d => d[key])
      .filter(v => !isNaN(v));
    
    const density = values.length > 0 ? kde(values) : [];
    
    return {
      key: categoryMap[key],
      originalKey: key,
      density: density,
      hasData: values.length > 0,
      color: categoryColors[key]
    };
  });
  
  return { 
    allDensity, 
    yearMax: stats.max,
    bandwidth,
    stats 
  };
}

// --- Draw Function ---
function drawRidgeline(allDensity, yearMax, year) {
  const chartContainer = document.getElementById('ridgeline_id');
  if (!chartContainer) return document.createElement('div');
  
  // Set container constraints
  d3.select(chartContainer)
    .style("max-width", CONFIG.maxWidth + "px")
    .style("overflow-x", "hidden")
    .style("margin", "0 auto");
  
  const svg = d3.select(chartContainer)
    .append("svg")
    .attr("viewBox", [0, 0, CONFIG.maxWidth, CONFIG.maxHeight])
    .attr("class", "visualization m-auto")
    .attr("chartType", "ridgeline")
    .style("display", "block");
  
  const width = CONFIG.maxWidth - CONFIG.margin.left - CONFIG.margin.right;
  const height = CONFIG.maxHeight - CONFIG.margin.top - CONFIG.margin.bottom;
  
  const g = svg.append("g")
    .attr("transform", `translate(${CONFIG.margin.left},${CONFIG.margin.top})`);
  
  // Handle no data case
  if (!allDensity || allDensity.length === 0) {
    svg.append("text")
      .attr("x", CONFIG.maxWidth / 2)
      .attr("y", CONFIG.maxHeight / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("fill", "#666")
      .text("No data available for this year");
    return svg.node();
  }
  
  // X scale - period-specific range
  const x = d3.scaleLinear()
    .domain([0, yearMax * 1.1])
    .range([0, width]);
  
  // Determine which period we're in
  const isEarlyPeriod = year >= 2000 && year <= 2004;
  const periodColor = isEarlyPeriod ? '#3498db' : '#e74c3c';
  const periodLabel = isEarlyPeriod ? 'Early Period (2000-2004)' : 'Late Period (2005-2024)';
  
  // Background highlight for period
  g.append("rect")
    .attr("x", -10)
    .attr("y", -10)
    .attr("width", width + 10)
    .attr("height", height + 10)
    .attr("fill", periodColor)
    .attr("opacity", 0.03)
    .attr("rx", 4);
  
  // X axis
  const xAxis = g.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(8));
  
  xAxis.selectAll("text")
    .style("font-size", "11px");
  
  // X axis label with period indicator
  g.append("text")
    .attr("x", width / 2)
    .attr("y", height + 45)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .style("font-weight", "500")
    .text("US Dollars");
  
  /*
  // Scale change indicator
  const scaleIndicator = g.append("g")
    .attr("class", "scale-indicator")
    .attr("transform", `translate(${width + 10}, 10)`);
  
  scaleIndicator.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 10)
    .attr("height", 60)
    .attr("fill", periodColor)
    .attr("opacity", 0.8)
    .attr("rx", 2);
  
  scaleIndicator.append("text")
    .attr("x", 18)
    .attr("y", 15)
    .style("font-size", "10px")
    .style("font-weight", "600")
    .style("fill", periodColor)
    .text(periodLabel);
  
  scaleIndicator.append("text")
    .attr("x", 18)
    .attr("y", 30)
    .style("font-size", "9px")
    .style("fill", "#666")
    .text(`Max: ${yearMax.toFixed(2)}`);
  
  scaleIndicator.append("text")
    .attr("x", 18)
    .attr("y", 43)
    .style("font-size", "9px")
    .style("fill", "#666")
    .text(`Scale adjusted`);
  
  // Warning icon for scale change years
  if (year === 2005 || year === 2004) {
    const warningGroup = svg.append("g")
      .attr("transform", `translate(${CONFIG.maxWidth - 80}, ${CONFIG.margin.top - 20})`);
    
    warningGroup.append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 10)
      .attr("fill", "#f39c12")
      .attr("opacity", 0.9);
    
    warningGroup.append("text")
      .attr("x", 0)
      .attr("y", 4)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("!");
    
    warningGroup.append("text")
      .attr("x", 15)
      .attr("y", 4)
      .style("font-size", "10px")
      .style("font-weight", "600")
      .style("fill", "#f39c12")
      .text("Scale change");
  }
      */
  
  // Y scale
  const categoryKeys = allDensity.map(d => d.key);
  const yName = d3.scaleBand()
    .domain(categoryKeys)
    .range([0, height])
    .paddingInner(0.1);
  
  // Curve height scale
  const maxDensity = d3.max(
    allDensity.filter(d => d.hasData),
    s => d3.max(s.density, p => p[1])
  ) || 1;
  
  const curveHeight = Math.max(
    CONFIG.minCurveHeight,
    yName.bandwidth() * CONFIG.curveHeightRatio
  );
  
  const y = d3.scaleLinear()
    .domain([0, maxDensity])
    .range([curveHeight, 0]);
  
  // Y axis
  g.append("g")
    .call(d3.axisLeft(yName).tickSize(0))
    .selectAll("text")
    .style("font-size", "11px")
    .style("font-weight", "400");
  
  // Draw ridges
  const ridges = g.selectAll("g.ridge")
    .data(allDensity)
    .enter()
    .append("g")
    .attr("class", "ridge")
    .attr("transform", d => `translate(0,${yName(d.key)})`);
  
  // Draw curves with data
  ridges.filter(d => d.hasData)
    .append("path")
    .datum(d => d.density)
    .attr("fill", (d, i, nodes) => {
      const parentData = d3.select(nodes[i].parentNode).datum();
      return parentData.color;
    })
    .attr("opacity", 0.65)
    .attr("stroke", (d, i, nodes) => {
      const parentData = d3.select(nodes[i].parentNode).datum();
      return d3.color(parentData.color).darker(1);
    })
    .attr("stroke-width", 1.2)
    .attr("d", d3.area()
      .curve(d3.curveBasis)
      .x(d => x(d[0]))
      .y0(curveHeight)
      .y1(d => y(d[1]))
    );
  
  // Baseline for missing data
  ridges.filter(d => !d.hasData)
    .append("line")
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", curveHeight)
    .attr("y2", curveHeight)
    .attr("stroke", "#ccc")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "2,2");
  
  return svg.node();
}

// --- Animation State ---
let currentYear = d3.min(data, d => d.year);
let isPlaying = false;
let intervalId = null;

// --- Update Chart ---
function updateChart(year) {
  const previousYear = currentYear;
  const previousPeriod = (previousYear >= 2000 && previousYear <= 2004);
  const newPeriod = (year >= 2000 && year <= 2004);
  const scaleChanged = previousPeriod !== newPeriod;
  
  currentYear = year;
  const { allDensity, yearMax } = prepareDataForYear(year);
  
  const chartContainer = document.getElementById('ridgeline_id');
  
  // Add transition effect on scale change
  if (scaleChanged) {
    d3.select(chartContainer)
      .transition()
      .duration(300)
      .style("opacity", 0.3)
      .transition()
      .duration(300)
      .style("opacity", 1);
  }
  
  chartContainer.innerHTML = '';
  
  drawRidgeline(allDensity, yearMax, year);
  
  const slider = document.getElementById('year-slider');
  const label = document.getElementById('year-label');
  
  if (slider) slider.value = year;
  if (label) {
    label.textContent = year;
    // Highlight label on scale change
    if (scaleChanged) {
      label.style.color = (year >= 2000 && year <= 2004) ? '#3498db' : '#e74c3c';
      label.style.fontWeight = '700';
      setTimeout(() => {
        label.style.color = '';
        label.style.fontWeight = '';
      }, 1500);
    }
  }
}

// --- Play/Pause Control ---
function togglePlay() {
  const playButton = document.getElementById('play-button');
  
  if (isPlaying) {
    clearInterval(intervalId);
    isPlaying = false;
    playButton.textContent = '▶ Play';
    playButton.style.background = '#4CAF50';
  } else {
    isPlaying = true;
    playButton.textContent = '⏸ Pause';
    playButton.style.background = '#ff9800';
    
    intervalId = setInterval(() => {
      const minYear = d3.min(data, d => d.year);
      const maxYear = d3.max(data, d => d.year);
      
      currentYear++;
      if (currentYear > maxYear) {
        currentYear = minYear;
      }
      updateChart(currentYear);
    }, CONFIG.animationInterval);
  }
}

// --- Initialize Controls ---
const yearSlider = document.getElementById('year-slider');
const yearLabel = document.getElementById('year-label');

const minYear = d3.min(data, d => d.year);
const maxYear = d3.max(data, d => d.year);

if (yearSlider) {
  yearSlider.min = Number.isFinite(minYear) ? minYear : currentYear;
  yearSlider.max = Number.isFinite(maxYear) ? maxYear : currentYear;
  yearSlider.value = currentYear;
  
  yearSlider.addEventListener('input', (e) => {
    const year = +e.target.value;
    if (isPlaying) togglePlay();
    updateChart(year);
  });
} else {
  console.warn('Year slider (#year-slider) not found in DOM.');
}

if (yearLabel) yearLabel.textContent = currentYear;

// --- Expose Global Functions ---
window.togglePlay = togglePlay;
window.updateChart = updateChart;
window.prepareDataForYear = prepareDataForYear;

// --- Initialize ---
updateChart(currentYear);
// --- --- --- Thumbnails --- --- ---
const thumbnailScale = 0.05;
addThumbnail(intro_id, intro_id_nav, thumbnailScale);
addThumbnail(sec1_id, sec1_id_nav, thumbnailScale);
addThumbnail(sec2_id, sec2_id_nav, thumbnailScale);