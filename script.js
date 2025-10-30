import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// const data = d3.csv("./data/apac_data.csv", function(d) {console.log(d); return d;});

/*
const csv = d3.dsvFormat(";");
const data = await d3.text("./data/apac_data.csv").then(function(text) {
  return csv.parse(text);
});

console.log(data[0]);
*/

const parseDate = d3.timeParse("%d-%B-%Y");

const monthsMap = {
  gennaio: "January",
  febbraio: "February",
  marzo: "March",
  aprile: "April",
  maggio: "May",
  giugno: "June",
  luglio: "July",
  agosto: "August",
  settembre: "September",
  ottobre: "October",
  novembre: "November",
  dicembre: "December",
};

function parseNumber(str) {
  if (!str) return NaN;
  return parseFloat(str.replace(",", "."));
}

const dataSource = "apac_data_test.csv";

const data = await d3.dsv(";", "./data/" + dataSource, (d) => {
  // Converte "31-dicembre-2016" → "31-December-2016" e poi in oggetto Date
  const weekStr = d["WEEK"]
    .toLowerCase()
    .replace(
      /-(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)-/,
      (match, month) => "-" + monthsMap[month] + "-"
    );

  return {
    admin1: d["ADMIN1"],
    centroid_latitude: parseNumber(d["CENTROID_LATITUDE"]),
    centroid_longitude: parseNumber(d["CENTROID_LONGITUDE"]),
    country: d["COUNTRY"],
    disorder_type: d["DISORDER_TYPE"],
    events: parseNumber(d["EVENTS"]),
    event_type: d["EVENT_TYPE"],
    fatalities: parseNumber(d["FATALITIES"]),
    id: parseNumber(d["ID"]),
    population_exposure: parseNumber(d["POPULATION_EXPOSURE"]),
    region: d["REGION"],
    sub_event_type: d["SUB_EVENT_TYPE"],
    week: parseDate(weekStr), // <- oggetto Date JS
  };
});

console.log(data.length, data[0]);

const countriesFilter = ['Afghanistan', 'Pakistan'];

// BAR CHART
// Specify the chart’s dimensions, based on a bar’s height.
const barHeight = 25;
const marginTop = 30;
const marginRight = 0;
const marginBottom = 10;
const marginLeft = 30;
const width = 928;
const height = 400;
// const height = Math.ceil((data.length + 0.1) * barHeight) + marginTop + marginBottom;

// Create the scales.
const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.events)])
    .range([marginLeft, width - marginRight]);
  
const y = d3.scaleBand()
    .domain(d3.sort(data, d => -d.events).map(d => d.country))
    .rangeRound([marginTop, height - marginBottom])
    .padding(0.1);

// Create a value format.
const format = x.tickFormat(20, "");

// Create the SVG container.
const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height])
    .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");
  
// Append a rect for each letter.
svg.append("g")
    .attr("fill", "steelblue")
    .selectAll()
    .data(data)
    .join("rect")
    .attr("x", x(0))
    .attr("y", (d) => y(d.country))
    .attr("width", (d) => x(d.events) - x(0))
    .attr("height", y.bandwidth());
  
// Append a label for each letter.
svg.append("g")
    .attr("fill", "white")
    .attr("text-anchor", "end")
    .selectAll()
    .data(data)
    .join("text")
    .attr("x", (d) => x(d.events))
    .attr("y", (d) => y(d.country) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("dx", -4)
    .text((d) => format(d.events))
    .call((text) => text.filter(d => x(d.events) - x(0) < 20) // short bars
    .attr("dx", +4)
    .attr("fill", "black")
    .attr("text-anchor", "start"));

// Create the axes.
svg.append("g")
    .attr("transform", `translate(0,${marginTop})`)
    .call(d3.axisTop(x).ticks(width / 80, "%"))
    .call(g => g.select(".domain").remove());

svg.append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .call(d3.axisLeft(y).tickSizeOuter(0));

console.log(svg.node());

document.getElementById("chart").appendChild(svg.node());