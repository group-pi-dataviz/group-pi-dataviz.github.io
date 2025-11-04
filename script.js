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

const afghanistanData = await d3.dsv(";", "./data/afghanistan_yearly_events_by_event_type.csv", d3.autoType);
const myanmarData = await d3.dsv(";", "./data/myanmar_yearly_events_by_event_type.csv", d3.autoType);
const philippinesData = await d3.dsv(";", "./data/philippines_yearly_events_by_event_type.csv", d3.autoType);

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

// --- Navigation System ---
// Se esiste un container di navigazione, aggiungi i pulsanti
const navContainer = document.querySelector('.country-selector');
if (navContainer) {
  // I pulsanti dovrebbero già esistere nell'HTML, quindi aggiungiamo solo gli event listener
  const countryButtons = document.querySelectorAll('.country-btn');
  const heatmapContainers = document.querySelectorAll('.heatmap-container');

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

const barDataSrc = "bar_data.csv";
const barData = await d3.dsv(";", "./data/" + barDataSrc, d3.autoType);

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