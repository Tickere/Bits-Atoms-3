import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying doughnut chart");

const width = 600;
const height = 600;
const margin = 40;

async function fetchData() {
  const url = "./data.json"; // data from https://opendata.swiss/en/dataset/treibhausgasemissionen-im-kanton-zurich
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    console.log("Received response:", json);
    const filteredData = filterData(json);
    drawChart(filteredData);
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function filterData(data) {
  return data
    .filter(
      (item) => item.thg === "CO2" && item.untergruppe === "Abfallverbrennung"
    )
    .map((d) => ({
      year: d.jahr,
      emission: d.emission,
    }));
}

function drawChart(data) {
  console.log("Filtered data: ", data);

  // Remove any existing chart
  const container = d3.select("#container");
  container.selectAll("*").remove();

  // Create the SVG container.
  const svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width / 2}, ${height / 2})`);

  // Prepare data for the doughnut chart
  const totalEmission = d3.sum(data, (d) => d.emission);
  const pieData = d3.pie().value((d) => d.emission)(data);

  // Color scale
  const color = d3.scaleOrdinal(d3.schemeCategory10);

  // Arc generator
  const radius = Math.min(width, height) / 2 - margin;
  const arc = d3
    .arc()
    .innerRadius(radius * 0.5) // Inner radius for the doughnut hole
    .outerRadius(radius);

  // Draw the arcs
  svg
    .selectAll("path")
    .data(pieData)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d, i) => color(i))
    .attr("stroke", "white")
    .style("stroke-width", "2px");

  // Add labels
  svg
    .selectAll("text")
    .data(pieData)
    .join("text")
    .text(
      (d) =>
        `${d.data.year}: ${((d.data.emission / totalEmission) * 100).toFixed(
          2
        )}%`
    )
    .attr("transform", (d) => `translate(${arc.centroid(d)})`)
    .style("text-anchor", "middle")
    .style("font-size", "12px");
}

// Fetch data and draw the chart
fetchData();
