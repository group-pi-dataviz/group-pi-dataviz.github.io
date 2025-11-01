import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// --- --- --- Utility --- --- ---

//creates a rectangle of the height of the source html tag and puts it below target
window.addThumbnail = function (source, target, scale) {
  const sourceRect = source.getBoundingClientRect();
  const thumbnail = document.createElement("div");
  thumbnail.classList = "rounded bg-[repeating-linear-gradient(0deg,_#dedede_0,_#dedede_7px,_white_5px,_white_10px)] bg-[size:100%_10px]";
  thumbnail.style.width = "100%";
  thumbnail.style.height = sourceRect.height * scale + "px";
  target.appendChild(thumbnail);
}

const thumbnailScale = 0.1;
addThumbnail(intro_id, intro_id_nav, thumbnailScale);
addThumbnail(sec1_id, sec1_id_nav, thumbnailScale);
addThumbnail(sec2_id, sec2_id_nav, thumbnailScale);

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
// // const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

// // Create the scales.
// const x = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d.events)])
//     .range([marginLeft, width - marginRight]);
  
// const y = d3.scaleBand()
//     .domain(d3.sort(data, d => -d.events).map(d => d.country))
//     .rangeRound([marginTop, height - marginBottom])
//     .padding(0.1);

// // Create a value format.
// const format = x.tickFormat(20, "");

// // Create the SVG container.
// const svg = d3.create("svg")
//     .attr("width", width)
//     .attr("height", height)
//     .attr("viewBox", [0, 0, width, height])
//     .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  
// // Append a rect for each letter.
// svg.append("g")
//     .attr("fill", "steelblue")
//     .selectAll()
//     .data(data)
//     .join("rect")
//     .attr("x", x(0))
//     .attr("y", (d) => y(d.country))
//     .attr("width", (d) => x(d.events) - x(0))
//     .attr("height", y.bandwidth());
  
// // Append a label for each letter.
// svg.append("g")
//     .attr("fill", "white")
//     .attr("text-anchor", "end")
//     .selectAll()
//     .data(data)
//     .join("text")
//     .attr("x", (d) => x(d.events))
//     .attr("y", (d) => y(d.country) + y.bandwidth() / 2)
//     .attr("dy", "0.35em")
//     .attr("dx", -4)
//     .text((d) => format(d.events))
//     .call((text) => text.filter(d => x(d.events) - x(0) < 20) // short bars
//     .attr("dx", +4)
//     .attr("fill", "black")
//     .attr("text-anchor", "start"));

// // Create the axes.
// svg.append("g")
//     .attr("transform", `translate(0,${marginTop})`)
//     .call(d3.axisTop(x).ticks(width / 80, "%"))
//     .call(g => g.select(".domain").remove());

// svg.append("g")
//     .attr("transform", `translate(${marginLeft},0)`)
//     .call(d3.axisLeft(y).tickSizeOuter(0));

// console.log(svg.node());

// document.getElementById("chart").appendChild(svg.node());



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

    array.push({x: i % 10, y: Math.floor(i /10), index: percIndex < violentPerc ? 1 : 0});
  }
  return array;
}

function drawWaffleChart(waffleData) {
    waffleData = dataToWaffleData(waffleData);
    // --- 1. Configuration ---
    const N_CELLS = 10;
    const SQUARE_SIZE = 25; // Size of each square (cell)
    const SQUARE_GAP = 2;   // Gap between squares

    // Calculate total width/height for the 10x10 grid
    const totalSideLength = N_CELLS * SQUARE_SIZE + (N_CELLS - 1) * SQUARE_GAP;

    const margin = { top: 0, right: 0, bottom: 0, left: 0 };
    const width = totalSideLength;
    const height = totalSideLength;

    const colorScale = d3.scaleOrdinal().domain(waffleData)
      .range(["lightgray", "#ff4d4d"]); // lightgray for non-violent, red for violent

    // --- 2. Setup SVG Container ---
    // Remove any existing SVG to prevent charts from stacking if the function is called multiple times
    d3.select("#waffle_id").select("svg").remove();

    // Select the container and append the SVG
    const svg = d3.select("#waffle_id") 
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("class", "m-auto")

    // --- 3. Data Binding and Drawing Rectangles ---
    svg.selectAll(".waffle-cell")
        .data(waffleData)
        .enter()
        .append("rect")
        .attr("class", "waffle-cell")
        // Use the x, y grid indices to calculate the pixel position
        .attr("x", d => d.x * (SQUARE_SIZE + SQUARE_GAP))
        .attr("y", d => d.y * (SQUARE_SIZE + SQUARE_GAP))
        .attr("width", SQUARE_SIZE)
        .attr("height", SQUARE_SIZE)
        // Set the fill color based on the data element's index or category
        .attr("fill", d => colorScale(d.index % 10)) // Using modulo 10 to fit in d3.schemeCategory10
        // Add an optional title for hover/tooltip functionality
        .append("title") 
        .text(d => `Element Index: ${d.index}\n(x: ${d.x}, y: ${d.y})`);

    console.log(svg.node());
    return svg.node();
}

waffle_id.appendChild(drawWaffleChart(waffleData));

// --- --- --- Grouped --- --- ---

const groupedDataSrc = "event_fatalities.csv";
const groupedData = await d3.dsv(";", "./data/" + groupedDataSrc, d3.autoType);

console.log(groupedData);

function drawGroupedChart(groupedData) {
  const events = new Set(groupedData.map(d => d.events));
  const fatalities = new Set(groupedData.map(d => d.fatalities));

  //horizontal grouped bar chart
  const margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const svg = d3.create("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const y = d3.scaleBand()
    .domain(["events, fatalities"])
    .range([0, width])
    .paddingInner(0.1);

  const x = d3.scaleLinear()
    .domain([0, d3.max(groupedData, d => d.value)])
    .nice()
    .range([height, 0]);

  const color = d3.scaleOrdinal()
    .domain(Array.from(fatalities))
    .range(d3.schemeCategory10);

  svg.append("g")
    .selectAll("g")
    .data(groupedData)
    .join("g")
    .attr("transform", d => `translate(${x(d.events)},0)`)
    .append("rect")
    .attr("x", d => x(d.fatalities))
    .attr("y", d => y(d.value))
    .attr("width", d => x(d.fatalities))
    .attr("height", )
    .attr("fill", d => color(d.fatalities));
    
  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x));

  svg.append("g")
    .call(d3.axisLeft(y));

  console.log(svg.node());
  return svg.node();
}

groupedBar_id.appendChild(drawGroupedChart(groupedData));