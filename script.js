import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// --- --- --- Utility --- --- ---

//creates a rectangle of the height of the source html tag and puts it below target
window.addThumbnail = function (source, target, scale)
{
  const sourceRect = source.getBoundingClientRect();

  const charts = source.querySelectorAll(".visualization");
  const chartRects = Array.from(charts).map(chart => {
    const rect = chart.getBoundingClientRect();
    const xPercent = (rect.left - sourceRect.left) / sourceRect.width * 100;
    const widthPerc = rect.width / sourceRect.width * 100;
    return {
      height: rect.height,
      y: rect.top - sourceRect.top,
      xPerc: xPercent,
      widthPerc: widthPerc,
    };
  });

  const sectionSvg = d3.create("svg")
    .attr("height", sourceRect.height * scale)
    .attr("class", "w-full m-auto");

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

  sectionSvg.selectAll(".chart-thumb")
    .data(chartRects)
    .enter()
    .append("rect")
    .attr("class", "chart-thumb")
    .attr("x", (d) => d.xPerc + "%")
    .attr("y", (d, i) => d.y * scale)
    .attr("width", d => d.widthPerc +"%")
    .attr("height", d => d.height * scale)
    .attr("fill", "aliceblue")
    .attr("stroke-width", "2px")
    .attr("stroke", "black")
    .attr("rx", 1)
    .attr("ry", 1);

  target.appendChild(sectionSvg.node());
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

// const data = d3.csv("./data/apac_data.csv", function(d) {console.log(d); return d;});

/*
const csv = d3.dsvFormat(";");
const data = await d3.text("./data/apac_data.csv").then(function(text) {
  return csv.parse(text);
});

console.log(data[0]);
*/

// const parseDate = d3.timeParse("%d-%B-%Y");

// const monthsMap = {
//   gennaio: "January",
//   febbraio: "February",
//   marzo: "March",
//   aprile: "April",
//   maggio: "May",
//   giugno: "June",
//   luglio: "July",
//   agosto: "August",
//   settembre: "September",
//   ottobre: "October",
//   novembre: "November",
//   dicembre: "December",
// };

// function parseNumber(str) {
//   if (!str) return NaN;
//   return parseFloat(str.replace(",", "."));
// }

// const dataSource = "event_fatalities.csv";

// const data = await d3.dsv(";", "./data/" + dataSource, (d) => {
//   // Converte "31-dicembre-2016" → "31-December-2016" e poi in oggetto Date
//   const weekStr = d["WEEK"]
//     .toLowerCase()
//     .replace(
//       /-(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)-/,
//       (match, month) => "-" + monthsMap[month] + "-"
//     );

//   return {
//     admin1: d["ADMIN1"],
//     centroid_latitude: parseNumber(d["CENTROID_LATITUDE"]),
//     centroid_longitude: parseNumber(d["CENTROID_LONGITUDE"]),
//     country: d["COUNTRY"],
//     disorder_type: d["DISORDER_TYPE"],
//     events: parseNumber(d["EVENTS"]),
//     event_type: d["EVENT_TYPE"],
//     fatalities: parseNumber(d["FATALITIES"]),
//     id: parseNumber(d["ID"]),
//     population_exposure: parseNumber(d["POPULATION_EXPOSURE"]),
//     region: d["REGION"],
//     sub_event_type: d["SUB_EVENT_TYPE"],
//     week: parseDate(weekStr), // <- oggetto Date JS
//   };
// });

// console.log(data.length, data[0]);

// const countriesFilter = ['Afghanistan', 'Pakistan'];

// BAR CHART
// Specify the chart’s dimensions, based on a bar’s height.
const barHeight = 25;
const marginTop = 30;
const marginRight = 0;
const marginBottom = 10;
const marginLeft = 30;
const width = 928;
const height = 400;

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

  console.log(svg.node());
  return svg.node();
}

waffle_id.appendChild(drawWaffleChart(waffleData));

// --- --- --- Grouped --- --- ---

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
    .attr("transform", d => `translate(0, ${yScale(d.country)})`);

  groups.on("mouseover", function(event, d) {
    d3.select(this).selectAll("*")
      .attr("opacity", 0.7);
  })
  .on("mouseout", function(event, d) {
    d3.select(this).selectAll("rect")
      .attr("opacity", 1.0);
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
    .call(d3.axisLeft(yScale));
  
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

const thumbnailScale = 0.05;
addThumbnail(intro_id, intro_id_nav, thumbnailScale);
addThumbnail(sec1_id, sec1_id_nav, thumbnailScale);
addThumbnail(sec2_id, sec2_id_nav, thumbnailScale);