import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying multiple doughnut charts");

const width = 300; // Width of each chart
const height = 300; // Height of each chart
const margin = 20; // Margin for each chart

async function fetchData() {
  const url = "./data.json";
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    console.log("Received response:", json);
    drawCharts(json);
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function drawCharts(data) {
  const container = d3.select("#container");

  data.forEach((productData) => {
    // Extract relevant metrics for the product
    const productMetrics = [
      { name: productData["untergruppe 1"], value: productData["value 1"] },
      { name: productData["untergruppe 2"], value: productData["value 2"] },
      { name: productData["untergruppe 3"], value: productData["value 3"] },
      { name: productData["untergruppe 4"], value: productData["value 4"] },
    ];

    // Create a separate div for each chart
    const chartContainer = container
      .append("div")
      .attr("class", "chart")
      .style("display", "inline-block")
      .style("margin", "20px");

    // Add product name
    chartContainer
      .append("h3")
      .text(productData.product)
      .style("text-align", "center");

    // Create SVG for the doughnut chart
    const svg = chartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Prepare data for the doughnut chart
    const pieData = d3.pie().value((d) => d.value)(productMetrics);

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
      .text((d) => `${d.data.name}: ${d.data.value}`)
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .style("text-anchor", "middle")
      .style("font-size", "10px");
  });
}

// Fetch data and draw the charts
fetchData();
