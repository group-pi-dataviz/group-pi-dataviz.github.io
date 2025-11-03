import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// --- --- --- Utility --- --- ---

//creates a rectangle of the height of the source html tag and puts it below target
window.addThumbnail = function (source, target, scale)
{
  console.log("addThumbnail", source, target, scale);
  const sourceRect = source.getBoundingClientRect();

  const charts = source.querySelectorAll(".visualization");
  const chartRects = Array.from(charts).map(chart => {
    const rect = chart.getBoundingClientRect();
    const xPercent = (rect.left - sourceRect.left) / sourceRect.width * 100;
    const widthPerc = rect.width / sourceRect.width * 100;
    console.log(chart.getAttribute("chartType"));

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

const waffleDataSrc = "macro_event_type_counts.csv";
const waffleData = (await d3.dsv(";", "./data/" + waffleDataSrc, d3.autoType))
.map(d => ({
  event_type: d.MACRO_EVENT_TYPE,
  percentage: d.PERCENTAGE,
}));

function dataToWaffleData(waffleData) {
  const violentPerc = Math.round(waffleData.find(d => d.event_type === "Violent").percentage);
  console.log("violentPerc", violentPerc);

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

  const colorScale = d3.scaleOrdinal()
    .domain(waffleDataViz)
    .range(["lightgray", "#ff4d4d"]);

  const svg = d3.select("#waffle_id") 
      .append("svg")
      .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom])
      .attr("class", "visualization m-auto max-w-[500px]")
      .attr("chartType", "waffle")

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
      .attr("fill", d => colorScale(d.index))
      .append("title")
      .text(d => d.index === 1 ? `Violent (${violentPerc}%)` : `Non-Violent (${100 - violentPerc}%)`);

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

const boldCountries = new Set(["Afghanistan", "Indonesia", "Myanmar"]);


const groupedDataSrc = "event_fatalities.csv";
const groupedData = await d3.dsv(";", "./data/" + groupedDataSrc, d3.autoType);

function drawGroupedChart(groupedData, maxWidth=600, maxHeight=500) {
  const colors = function(category) {
    switch(category) {
      case "events": return "darkgray";
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

const stackedDataPercSrc = "event_types_percentages.csv";
const dataPerc = await d3.dsv(";", "./data/" + stackedDataPercSrc, d3.autoType);

const stackedDataCountsSrc = "event_types_counts.csv";
const dataCounts = await d3.dsv(";", "./data/" + stackedDataCountsSrc, d3.autoType);

function drawStackedChart(dataPerc, dataCounts, maxWidth=600, maxHeight=600) {
  const eventTypes = dataPerc.columns.filter(d => d !== "COUNTRY");

  const countries = dataPerc.map(d => d["COUNTRY"]);

  // color palette = one color per subgroup
  const color = d3.scaleOrdinal()
    .domain(eventTypes)
    .range(eventTypes.map((d, i) => d3.schemeObservable10[i % 10]));
  
  // stack the dataPerc? --> stack per subgroup
  const stackedData = d3.stack()
    .keys(eventTypes)
    (dataPerc);

  console.log(stackedData);

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

// some datasources for caucasus and central asia
const dataSources = ["caucasus_and_central_asia_yearly_events_by_event_type.csv", 
                     "caucasus_and_central_asia_yearly_events_by_sub_event_type.csv", 
                     "caucasus_and_central_asia_yearly_fatalities_by_event_type.csv", 
                     "caucasus_and_central_asia_yearly_fatalities_by_sub_event_type.csv"];

// Customizable parameters

const HEATMAP_CONFIG = {
  // Cell dimensions and spacing
  cellWidth: 35,           // Width of each cell in pixels (for years)
  cellHeight: 35,          // Height of each cell in pixels (for categories)
  cellPadding: 0.08,       // Padding between cells (0-1, where 0.1 = 10% of cell size)
  cellCornerRadius: 3,     // Rounded corners (0 = sharp corners)
  
  // Margins around the heatmap
  margin: {
    top: 60,
    right: 140,            // Extra space for colorbar
    bottom: 60,            // Space for year labels
    left: 80              // Space for category labels (reduced)
  },
  
  // Color scheme (choose from d3 color schemes)
  colorScheme: d3.interpolateViridis,  // Options: interpolateViridis, interpolateInferno, 
                                        // interpolatePlasma, interpolateTurbo, interpolateRdYlBu, etc.
  
  // Colorbar settings
  colorbar: {
    width: 20,             // Width of the colorbar
    height: 200,           // Height of the colorbar (reduced to fit)
    marginLeft: 30,        // Distance from heatmap to colorbar
    tickCount: 5,          // Number of ticks on colorbar
    title: "Event Count"   // Label for colorbar
  },
  
  // Font sizes
  fontSize: {
    axis: 11,
    categoryLabel: 11,     // Font size for category labels
    colorbarTitle: 12,
    colorbarTicks: 10
  },
  
  // Cell styling
  cellOpacity: 0.9,        // Default opacity (0-1)
  cellStrokeWidth: 1,      // Border width
  cellHoverStroke: "black", // Border color on hover
  
  // Category label mapping
  categoryLabels: {
    "Battles": "⚔️ Battles",
    "Explosions/Remote violence": "💥 Explosions/Remote",
    "Protests": "✊ Protests",
    "Riots": "🔥 Riots",
    "Strategic developments": "🎯 Strategic Dev.",
    "Violence against civilians": "👥 Violence vs Civilians"
  }
};

const heatmapDataSrc = "caucasus_and_central_asia_yearly_events_by_event_type.csv";
var heatmap_data = await d3.dsv(";", "./data/" + heatmapDataSrc, d3.autoType);

function drawHeatmap(data, id="#heatmap_id") {
  
  // ==== PREPARE DATA ====
  const myYears = data.map(d => d.YEAR);
  const myCategories = data.columns.slice(1); // all columns except YEAR

  // Reshape wide → long
  const longData = [];
  data.forEach(d => {
    myCategories.forEach(cat => {
      longData.push({
        year: d.YEAR,
        category: cat,
        value: +d[cat] || 0  // handle null/undefined values
      });
    });
  });

  // ==== CALCULATE DIMENSIONS ====
  const width = myYears.length * HEATMAP_CONFIG.cellWidth;  // Years on X
  const height = myCategories.length * HEATMAP_CONFIG.cellHeight;  // Categories on Y

  // ==== SCALES ====
  const x = d3.scaleBand()
    .range([0, width])
    .domain(myYears)
    .padding(HEATMAP_CONFIG.cellPadding);

  const y = d3.scaleBand()
    .range([0, height])
    .domain(myCategories)
    .padding(HEATMAP_CONFIG.cellPadding);

  // ==== CREATE SVG ====
  // Clear any existing svg first
  d3.select(id).selectAll("*").remove();

  const svg = d3.select(id)
    .append("svg")
    .attr("viewBox", [0,0,width + HEATMAP_CONFIG.margin.left + HEATMAP_CONFIG.margin.right,height + HEATMAP_CONFIG.margin.top + HEATMAP_CONFIG.margin.bottom])
    // .attr("width", width + HEATMAP_CONFIG.margin.left + HEATMAP_CONFIG.margin.right)
    // .attr("height", height + HEATMAP_CONFIG.margin.top + HEATMAP_CONFIG.margin.bottom)
    .attr("chartType", "heatmap")
    .append("g")
    .attr("transform", `translate(${HEATMAP_CONFIG.margin.left},${HEATMAP_CONFIG.margin.top})`);

  // ==== COLOR SCALE ====
  const values = longData.map(d => d.value);
  const minVal = d3.min(values);
  const maxVal = d3.max(values);
  
  const myColor = d3.scaleSequential()
    .interpolator(HEATMAP_CONFIG.colorScheme)
    .domain([minVal, maxVal]);

  // ==== AXES ====
  // X axis (years at bottom)
  svg.append("g")
    .style("font-size", HEATMAP_CONFIG.fontSize.axis)
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(0))
    .selectAll("text")
    .style("text-anchor", "middle");
  
  svg.selectAll(".domain").remove();

  // Y axis (categories at left) - with compact labels
  const yAxisGroup = svg.append("g")
    .style("font-size", HEATMAP_CONFIG.fontSize.categoryLabel)
    .call(d3.axisLeft(y).tickSize(0).tickFormat(d => {
      // Use compact labels from config
      return HEATMAP_CONFIG.categoryLabels[d] || d;
    }));

  // ==== TOOLTIP ====
  const tooltip = d3.select(id)
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid 2px #666")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("box-shadow", "0 2px 4px rgba(0,0,0,0.2)")
    .style("font-size", "13px")
    .style("max-width", "250px");

  const mouseover = (event, d) => {
    tooltip.style("opacity", 1);
    d3.select(event.currentTarget)
      .style("stroke", HEATMAP_CONFIG.cellHoverStroke)
      .style("stroke-width", 2)
      .style("opacity", 1);
  };
  
  const mousemove = (event, d) => {
    const label = HEATMAP_CONFIG.categoryLabels[d.category] || d.category;
    tooltip
      .html(`<strong>${label}</strong><br>Year: ${d.year}<br>Events: ${d.value.toLocaleString()}`)
      .style("left", (event.pageX + 15) + "px")
      .style("top", (event.pageY - 28) + "px");
  };
  
  const mouseleave = (event, d) => {
    tooltip.style("opacity", 0);
    d3.select(event.currentTarget)
      .style("stroke", "none")
      .style("opacity", HEATMAP_CONFIG.cellOpacity);
  };

  // ==== DRAW RECTANGLES ====
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
    .style("fill", d => myColor(d.value))
    .style("stroke-width", HEATMAP_CONFIG.cellStrokeWidth)
    .style("stroke", "none")
    .style("opacity", HEATMAP_CONFIG.cellOpacity)
    .on("mouseover", mouseover)
    .on("mousemove", mousemove)
    .on("mouseleave", mouseleave);

  // ==== COLORBAR LEGEND ====
  const colorbarGroup = svg.append("g")
    .attr("transform", `translate(${width + HEATMAP_CONFIG.colorbar.marginLeft}, ${(height - HEATMAP_CONFIG.colorbar.height) / 2})`);

  // Create gradient for colorbar
  const defs = svg.append("defs");
  const linearGradient = defs.append("linearGradient")
    .attr("id", "colorbar-gradient")
    .attr("x1", "0%")
    .attr("y1", "100%")
    .attr("x2", "0%")
    .attr("y2", "0%");

  // Add color stops
  const numStops = 20;
  d3.range(numStops).forEach(i => {
    const t = i / (numStops - 1);
    const value = minVal + t * (maxVal - minVal);
    linearGradient.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", myColor(value));
  });

  // Draw colorbar rectangle
  colorbarGroup.append("rect")
    .attr("width", HEATMAP_CONFIG.colorbar.width)
    .attr("height", HEATMAP_CONFIG.colorbar.height)
    .style("fill", "url(#colorbar-gradient)")
    .style("stroke", "#333")
    .style("stroke-width", 1);

  // Colorbar scale and axis
  const colorbarScale = d3.scaleLinear()
    .domain([minVal, maxVal])
    .range([HEATMAP_CONFIG.colorbar.height, 0]);

  const colorbarAxis = d3.axisRight(colorbarScale)
    .ticks(HEATMAP_CONFIG.colorbar.tickCount)
    .tickFormat(d3.format(".0f"));

  colorbarGroup.append("g")
    .attr("transform", `translate(${HEATMAP_CONFIG.colorbar.width}, 0)`)
    .style("font-size", HEATMAP_CONFIG.fontSize.colorbarTicks)
    .call(colorbarAxis);

  // Colorbar title
  colorbarGroup.append("text")
    .attr("transform", `translate(${HEATMAP_CONFIG.colorbar.width / 2}, ${-15})`)
    .style("text-anchor", "middle")
    .style("font-size", HEATMAP_CONFIG.fontSize.colorbarTitle)
    .style("font-weight", "bold")
    .text(HEATMAP_CONFIG.colorbar.title);
}


drawHeatmap(heatmap_data);

// Altre possibilità
heatmap_data = await d3.dsv(";", "./data/" + dataSources[1], d3.autoType);
drawHeatmap(heatmap_data, "#heatmap_id_2");

heatmap_data = await d3.dsv(";", "./data/" + dataSources[2], d3.autoType);
drawHeatmap(heatmap_data, "#heatmap_id_3");

heatmap_data = await d3.dsv(";", "./data/" + dataSources[3], d3.autoType);
drawHeatmap(heatmap_data, "#heatmap_id_4");



// --- --- ---  Bar Chart --- --- ---

const barDataSrc = "bar_data.csv";
const barData = await d3.dsv(";", "./data/" + barDataSrc, d3.autoType);

function drawBarChart(barData, maxWidth=600, maxHeight=400) {
  console.log(barData);
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
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));

  svg.append("g")
    .attr("transform", `translate(70,0)`)
    .call(d3.axisLeft(yScale));

  return svg.node();
}

bar_id.appendChild(drawBarChart(barData));

const thumbnailScale = 0.05;
addThumbnail(intro_id, intro_id_nav, thumbnailScale);
addThumbnail(sec1_id, sec1_id_nav, thumbnailScale);
addThumbnail(sec2_id, sec2_id_nav, thumbnailScale);