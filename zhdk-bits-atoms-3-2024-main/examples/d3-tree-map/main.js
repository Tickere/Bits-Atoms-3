import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

console.log("Displaying enhanced tree map");

// Declare the chart dimensions and margins.
const margin = { top: 20, right: 20, bottom: 20, left: 20 };
const width = window.innerWidth - margin.left - margin.right;
const height = window.innerHeight - margin.top - margin.bottom;

let svg;

// Get all the names for the items without children in a flat array
function getNames(node) {
  let names = [];
  if (node.children) {
    node.children.forEach((child) => {
      names = names.concat(getNames(child));
    });
  } else {
    if (node.name) {
      names.push(node.name);
    }
  }
  return names;
}

async function fetchData(dataSet) {
  const url = `./${dataSet}`; // data from https://opendata.swiss/en/dataset/treibhausgasemissionen-im-kanton-zurich
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    console.log("Data fetched successfully:", json);
    drawChart(json);
  } else {
    alert("HTTP-Error: " + response.status);
  }
}

/* Add Id functionality. Copied from https://github.com/observablehq/stdlib/blob/main/src/dom/uid.js */
let count = 0;

export function uid(name) {
  return new Id("O-" + (name == null ? "" : name + "-") + ++count);
}

function Id(id) {
  this.id = id;
  this.href = new URL(`#${id}`, location) + "";
}

Id.prototype.toString = function () {
  return "url(" + this.href + ")";
};

function addEventListeners() {
  const form = document.querySelector(".form");

  form.addEventListener("change", (event) => {
    if (event.target.name === "options") {
      console.log(`Selected option: ${event.target.value}`);
      let path = "data.json";

      if (event.target.value === "ch") {
        path = "data-ch.json";
      }

      // Refetch the data with the new path
      fetchData(path);
    }
  });
}

function drawChart(data) {
  const tileNames = getNames(data);
  console.log("Tile Names: ", tileNames);

  // Specify the color scale.
  const color = d3.scaleOrdinal(
    tileNames, // names:  ["Livestock","Crops (excl. Feeds)","Forests","Shrub","Urban","Freshwater","Glaciers","Barren land"]
    d3.schemeSet3 // or use a predefined color scheme from d3
  );

  // Compute the layout.
  const root = d3
    .treemap()
    .tile(d3.treemapSquarify) // e.g., d3.treemapSquarify
    .size([width, height])
    .padding(2)
    .round(true)(
    d3
      .hierarchy(data)
      .sum((d) => d.value)
      .sort((a, b) => b.value - a.value)
  );

  // Create the SVG container.
  if (!svg) {
    svg = d3
      .create("svg")
      .attr("viewBox", [0, 0, width, height])
      .attr("width", width)
      .attr("height", height);
  }

  // Add a cell for each leaf of the hierarchy.
  const leaf = svg.selectAll("g").data(root.leaves(), (d) => d.data.name);

  // Define enter (instead of using .join, which would also handle update and exit)
  const leafEnter = leaf
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  // Append a color rectangle with hover effects.
  leafEnter
    .append("rect")
    .attr("id", (d) => (d.leafUid = uid("leaf")).id)
    .attr("fill", (d) => color(d.data.name))
    .attr("stroke-width", 1)
    .attr("stroke", (d) => (d.depth >= 3 ? "#5F8E79" : "#5A3D3D"))
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .on("mouseover", (event, d) => {
      tooltip.style("visibility", "visible");
      d3.select(event.target)
        .style("cursor", "pointer")
        .transition()
        .duration(200)
        .scale(1.05);
    })
    .on("mousemove", (event, d) => {
      tooltip
        .style("top", event.pageY - 10 + "px")
        .style("left", event.pageX + 10 + "px")
        .html(`${d.data.name}:<br>${d.data.value.toFixed(2)}%`);
    })
    .on("mouseout", (event) => {
      tooltip.style("visibility", "hidden");
      d3.select(event.target).transition().duration(200).scale(1);
    })
    .transition()
    .duration(750)
    .attr("fill-opacity", 0.8)
    .attr("stroke-opacity", 0.8);

  leafEnter
    .append("text")
    .attr("clip-path", (d) => d.clipUid)
    .selectAll("tspan")
    .data((d) => {
      return d.data.name
        .split(/(?=[A-Z][a-z])|\s+/g)
        .concat(`${d.data.value.toFixed(2)}%`);
    })
    .join("tspan")
    .attr("x", 3)
    .attr(
      "y",
      (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 1.1}em`
    )
    .attr("fill-opacity", (d, i, nodes) =>
      i === nodes.length - 1 ? 0.7 : null
    )
    .text((d) => d)
    .transition()
    .duration(750);

  // Handle update selection (existing data).
  leaf
    .transition()
    .duration(750) // Smooth transition for updates.
    .attr("transform", (d) => `translate(${d.x0},${d.y0})`);

  leaf
    .select("rect")
    .transition()
    .duration(750)
    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0);

  leaf
    .select("text")
    .selectAll("tspan")
    .data((d) => {
      return d.data.name
        .split(/(?=[A-Z][a-z])|\s+/g)
        .concat(`${d.data.value.toFixed(2)}%`);
    })
    .text((d) => d);

  // Handle exit selection (remove data).
  leaf.exit().remove();

  // Append tooltip for mouseover
  let tooltip = d3.select("body").append("div").attr("class", "tooltip");

  svg.node();

  // Append the SVG to the DOM
  document.body.appendChild(svg.node());
}

// Make the document listen for changes on the radio button
addEventListeners();
fetchData("data.json");
