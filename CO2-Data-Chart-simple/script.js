// Initialize Tooltip using D3.js
const tooltip = d3.select("#tooltip");

// Medium names corresponding to their index
const mediumNames = [
  "Video Conference",
  "Streaming",
  "E-Mail Attachment",
  "AI Prompt",
  "E-Mail",
  "Spam",
  "Tweet",
  "Google Search",
];

// Placeholder for dynamically computed square data
let squaresPerGridFull = [];
let activeMediums = []; // Start with no active mediums
let currentCountry = "Berlin"; // Default country

const spacing = 2;
const padding = 5;

// Fetch the data and initialize
async function fetchData() {
  try {
    const response = await fetch("data.json");
    const data = await response.json();
    window.fullData = data;

    updateSquaresFromCountry(currentCountry);
    updateCountryData(currentCountry);
    buildLayout();
  } catch (error) {
    console.error("Failed to fetch or parse data.json:", error);
  }
}

function updateSquaresFromCountry(countryName) {
  const countryData = window.fullData.find(
    (item) => item.country === countryName
  );
  if (!countryData) return;

  squaresPerGridFull = [
    Math.round(countryData["Video conference"] / 1000),
    Math.round(countryData["Streaming"] / 1000),
    Math.round(countryData["E-Mail attachment"] / 1000),
    Math.round(countryData["AI prompt"] / 1000),
    Math.round(countryData["E-Mail"] / 1000),
    Math.round(countryData["Spam"] / 1000),
    Math.round(countryData["Tweet"] / 1000),
    Math.round(countryData["Google search"] / 1000),
  ];
}

function updateCountryData(countryName) {
  const countryDataContainer = document.getElementById(
    "country-data-container"
  );
  const countryData = window.fullData.find(
    (item) => item.country === countryName
  );
  if (!countryData) {
    countryDataContainer.innerHTML = "No data available for this country.";
    return;
  }

  const countryDetailsHTML = `
    <div class="column">
      <div><strong>Country:</strong> ${countryData.country}</div>
      <div><strong>Flight duration:</strong> ${countryData["Flight duration"]}</div>
      <div><strong>Distance:</strong> ${countryData.Distance}</div>
    </div>
    <div class="column">
      <div><strong>gCO₂ per passenger:</strong> ${countryData["gCO₂ per passenger"]}</div>
      <div><strong>Google search:</strong> ${countryData["Google search"]}</div>
      <div><strong>Tweet:</strong> ${countryData.Tweet}</div>
      <div><strong>Spam:</strong> ${countryData.Spam}</div>
      <div><strong>E-Mail:</strong> ${countryData["E-Mail"]}</div>
    </div>
    <div class="column">
      <div><strong>AI prompt:</strong> ${countryData["AI prompt"]}</div>
      <div><strong>E-Mail attachment:</strong> ${countryData["E-Mail attachment"]}</div>
      <div><strong>Streaming:</strong> ${countryData.Streaming}</div>
      <div><strong>Video conference:</strong> ${countryData["Video conference"]}</div>
    </div>
  `;

  countryDataContainer.innerHTML = countryDetailsHTML;
}

function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = "";

  for (let i = 0; i < squaresPerGridFull.length; i++) {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
    outerContainer.appendChild(grid);
    grid.style.display = activeMediums.includes(i) ? "flex" : "none";
  }

  layoutAllGrids();
}

function findMaxSquareSizeForSingleGrid(container, numSquares) {
  const totalWidth = container.clientWidth;
  const totalHeight = container.clientHeight;
  const innerWidth = totalWidth - 2 * padding;
  const innerHeight = totalHeight - 2 * padding;

  let bestSquareSize = 0;
  for (let columns = 1; columns <= numSquares; columns++) {
    const rows = Math.ceil(numSquares / columns);
    const totalHorizontalSpacing = (columns - 1) * spacing;
    const possibleWidth = (innerWidth - totalHorizontalSpacing) / columns;
    const possibleHeight = (innerHeight - rows * spacing) / rows;
    const squareSize = Math.floor(Math.min(possibleWidth, possibleHeight));

    if (squareSize > bestSquareSize) {
      bestSquareSize = squareSize;
    }
  }
  return bestSquareSize;
}

function findGlobalSquareSize() {
  const containers = document.querySelectorAll(".grid-container");
  const sizes = [];
  for (let i = 0; i < squaresPerGridFull.length; i++) {
    if (activeMediums.includes(i)) {
      const container = containers[i];
      const maxSize = findMaxSquareSizeForSingleGrid(
        container,
        squaresPerGridFull[i]
      );
      sizes.push(maxSize);
    }
  }
  return Math.max(14, Math.min(...sizes));
}

function layoutSquaresForContainer(
  container,
  numSquares,
  globalSquareSize,
  mediumIndex
) {
  container.innerHTML = "";

  const totalWidth = container.clientWidth;
  const innerWidth = totalWidth - 2 * padding;

  let chosenColumns = 1;
  for (let cols = numSquares; cols >= 1; cols--) {
    const rows = Math.ceil(numSquares / cols);
    const totalHorizontalSpacing = (cols - 1) * spacing;

    const requiredWidth = cols * globalSquareSize + totalHorizontalSpacing;
    if (requiredWidth <= innerWidth) {
      chosenColumns = cols;
      break;
    }
  }

  const chosenRows = Math.ceil(numSquares / chosenColumns);
  const requiredHeight =
    padding * 2 + chosenRows * globalSquareSize + (chosenRows - 1) * spacing;
  container.style.height = requiredHeight + "px";

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.width = globalSquareSize + "px";
    square.style.height = globalSquareSize + "px";

    const col = i % chosenColumns;
    const row = Math.floor(i / chosenColumns);

    const leftPos = padding + col * (globalSquareSize + spacing);
    const topPos = padding + row * (globalSquareSize + spacing);

    square.style.left = leftPos + "px";
    square.style.top = topPos + "px";

    d3.select(square)
      .on("mouseover", function (event) {
        tooltip
          .style("opacity", 1)
          .html(
            `${mediumNames[mediumIndex]} - ${((i + 1) * 1000).toLocaleString()}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 28 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });

    container.appendChild(square);
  }
}

function layoutAllGrids() {
  const globalSquareSize = findGlobalSquareSize();
  const containers = document.querySelectorAll(".grid-container");
  activeMediums.forEach((mediumIndex) => {
    const container = containers[mediumIndex];
    layoutSquaresForContainer(
      container,
      squaresPerGridFull[mediumIndex],
      globalSquareSize,
      mediumIndex
    );
  });
}

function toggleMedium(mediumIndex) {
  const button = document.querySelector(
    `.toggle-button[data-medium="${mediumIndex + 1}"]`
  );

  if (activeMediums.includes(mediumIndex)) {
    const index = activeMediums.indexOf(mediumIndex);
    activeMediums.splice(index, 1);
    button.classList.remove("toggled");
  } else {
    activeMediums.push(mediumIndex);
    button.classList.add("toggled");
  }

  buildLayout();
}

document.querySelectorAll(".toggle-button").forEach((button, index) => {
  button.addEventListener("click", () => toggleMedium(index));
});

fetchData();

window.addEventListener("resize", layoutAllGrids);
