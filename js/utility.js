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
