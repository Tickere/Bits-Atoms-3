// Initialize Tooltip using D3.js
const tooltip = d3.select("#tooltip");

// Placeholder for dynamically computed square data
let squaresPerGridFull = [];
let activeMediums = [];
let currentCountry = "Berlin"; // Default country

const spacing = 2;
const padding = 5;

// Fetch the data and initialize
async function fetchData() {
  const response = await fetch("data.json"); // Load the JSON file
  const data = await response.json();

  // Store the full data
  window.fullData = data;

  // Initialize squares based on the default country
  updateSquaresFromCountry(currentCountry);

  // Build the initial layout
  buildLayout();
}

function updateSquaresFromCountry(countryName) {
  const countryData = window.fullData.find(
    (item) => item.country === countryName
  );

  if (!countryData) return;

  squaresPerGridFull = [
    Math.max(1, Math.round(countryData["Video conference"] / 1000)),
    Math.max(1, Math.round(countryData["Streaming"] / 1000)),
    Math.max(1, Math.round(countryData["E-Mail attachment"] / 1000)),
    Math.max(1, Math.round(countryData["AI prompt"] / 1000)),
    Math.max(1, Math.round(countryData["E-Mail"] / 1000)),
    Math.max(1, Math.round(countryData["Spam"] / 1000)),
    Math.max(1, Math.round(countryData["Tweet"] / 1000)),
    Math.max(1, Math.round(countryData["Google search"] / 1000)),
  ];
}

function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = "";

  for (let i = 0; i < 8; i++) {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
    if (activeMediums.includes(i)) {
      outerContainer.appendChild(grid);
    } else {
      outerContainer.appendChild(grid);
      grid.style.display = "none";
    }
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
    const totalVerticalSpacing = (rows - 1) * spacing;

    const possibleWidth = (innerWidth - totalHorizontalSpacing) / columns;
    const possibleHeight = (innerHeight - totalVerticalSpacing) / rows;
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
  activeMediums.forEach((mediumIndex, index) => {
    const container = containers[mediumIndex];
    const maxSize = findMaxSquareSizeForSingleGrid(
      container,
      squaresPerGridFull[mediumIndex]
    );
    sizes.push(maxSize);
  });
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
  if (requiredHeight > container.clientHeight) {
    container.style.height = requiredHeight + "px";
  }

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
          .html(`Medium ${mediumIndex + 1} - Square ${i + 1}`)
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
  if (activeMediums.length === 0) return;

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
    activeMediums = activeMediums.filter((index) => index !== mediumIndex);
    button.classList.remove("toggled");
  } else {
    activeMediums.push(mediumIndex);
    activeMediums.sort((a, b) => a - b);
    button.classList.add("toggled");
  }

  buildLayout();
}

function toggleCountry(countryName) {
  const buttons = document.querySelectorAll(".country-toggle-button");
  buttons.forEach((button) => {
    if (button.dataset.country === countryName) {
      button.classList.add("toggled");
    } else {
      button.classList.remove("toggled");
    }
  });

  currentCountry = countryName;
  updateSquaresFromCountry(currentCountry);
  buildLayout();
}

document.querySelectorAll(".toggle-button").forEach((button, index) => {
  button.addEventListener("click", () => toggleMedium(index));
});

document.querySelectorAll(".country-toggle-button").forEach((button) => {
  button.addEventListener("click", () => toggleCountry(button.dataset.country));
});

fetchData();

window.addEventListener("resize", layoutAllGrids);
