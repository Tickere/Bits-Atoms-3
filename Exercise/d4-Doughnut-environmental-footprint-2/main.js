import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying selectable doughnut charts with hover effect");

const width = 300; // Width of each chart
const height = 300; // Height of each chart
const margin = 20; // Margin for each chart

async function fetchData() {
  const url = "./data.json";
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    console.log("Received response:", json);
    createRadioButtons(json);
    drawCharts(json);
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

function createRadioButtons(data) {
  const container = d3.select("#container");

  // Create a container for radio buttons
  const radioContainer = d3
    .select("body")
    .insert("div", "#container")
    .attr("id", "radio-container")
    .style("margin-bottom", "20px");

  // Add radio buttons for each group
  data.forEach((groupData, index) => {
    const radioLabel = radioContainer
      .append("label")
      .style("margin-right", "15px");

    radioLabel
      .append("input")
      .attr("type", "radio")
      .attr("name", "category")
      .attr("value", index)
      .property("checked", index === 0) // Check the first option by default
      .on("change", () => showChart(index));

    radioLabel.append("span").text(groupData.group);
  });
}

function drawCharts(data) {
  const container = d3.select("#container");

  data.forEach((groupData, index) => {
    const metrics = [
      { name: "Almond milk", value: groupData["value 1"] },
      { name: "Dairy milk", value: groupData["value 2"] },
      { name: "Oat milk", value: groupData["value 3"] },
      { name: "Rice milk", value: groupData["value 4"] },
      { name: "Soy milk", value: groupData["value 5"] },
    ];

    // Create a separate div for each chart
    const chartContainer = container
      .append("div")
      .attr("class", "chart")
      .style("display", index === 0 ? "inline-block" : "none") // Show only the first chart initially
      .style("margin", "20px")
      .attr("data-index", index);

    // Add group name and declaration as title
    chartContainer
      .append("h3")
      .text(groupData.group)
      .style("text-align", "center");

    chartContainer
      .append("p")
      .text(groupData.declaration)
      .style("text-align", "center")
      .style("font-size", "12px")
      .style("color", "gray");

    // Create SVG for the doughnut chart
    const svg = chartContainer
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Prepare data for the doughnut chart
    const pieData = d3.pie().value((d) => d.value)(metrics);

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

    // Create a label at the bottom for displaying the hovered value
    const valueLabel = chartContainer
      .append("div")
      .attr("class", "value-label")
      .style("text-align", "center")
      .style("font-size", "14px")
      .style("margin-top", "10px");

    // Set default label text
    valueLabel.text("Hover over a segment to see the value");

    // Add hover functionality to display value at the bottom
    svg
      .selectAll("path")
      .on("mouseover", (event, d) => {
        // Update the label with the value of the hovered segment
        valueLabel.text(`${d.data.name}: ${d.data.value}`);
      })
      .on("mouseout", () => {
        // Reset the label text when mouse leaves the segment
        valueLabel.text("Hover over a segment to see the value");
      });
  });
}

function showChart(index) {
  // Hide all charts and show only the selected one
  d3.selectAll(".chart").style("display", "none");
  d3.select(`.chart[data-index="${index}"]`).style("display", "inline-block");
}

// Fetch data and draw the charts
fetchData();
