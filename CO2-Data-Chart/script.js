// Define the square data for up to 8 grids
const squaresPerGridFull = [1, 600, 10, 60, 25, 40, 15, 5];

let activeCountries = []; // Keeps track of active grids

const spacing = 2;
const padding = 5; // Matches .grid-container padding in CSS

// Initialize Tooltip using D3.js
const tooltip = d3.select("#tooltip");

// Build the layout based on active countries
function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = ""; // Clear existing grids

  activeCountries.forEach((countryIndex) => {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
    outerContainer.appendChild(grid);
  });

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
  activeCountries.forEach((countryIndex, index) => {
    const container = containers[index];
    const maxSize = findMaxSquareSizeForSingleGrid(
      container,
      squaresPerGridFull[countryIndex]
    );
    sizes.push(maxSize);
  });
  return Math.min(...sizes);
}

function layoutSquaresForContainer(
  container,
  numSquares,
  globalSquareSize,
  countryIndex
) {
  container.innerHTML = "";

  const totalWidth = container.clientWidth;
  const totalHeight = container.clientHeight;
  const innerWidth = totalWidth - 2 * padding;
  const innerHeight = totalHeight - 2 * padding;

  let chosenColumns = 1;
  // Try to fit as many columns as possible at the given globalSquareSize
  for (let cols = numSquares; cols >= 1; cols--) {
    const rows = Math.ceil(numSquares / cols);
    const totalHorizontalSpacing = (cols - 1) * spacing;
    const totalVerticalSpacing = (rows - 1) * spacing;

    const requiredWidth = cols * globalSquareSize + totalHorizontalSpacing;
    const requiredHeight = rows * globalSquareSize + totalVerticalSpacing;

    if (requiredWidth <= innerWidth && requiredHeight <= innerHeight) {
      chosenColumns = cols;
      break;
    }
  }

  const chosenRows = Math.ceil(numSquares / chosenColumns);

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.width = globalSquareSize + "px";
    square.style.height = globalSquareSize + "px";

    const col = i % chosenColumns;
    const row = Math.floor(i / chosenColumns);

    const leftPos =
      padding + (chosenColumns - 1 - col) * (globalSquareSize + spacing);
    const topPos =
      totalHeight - padding - (row + 1) * globalSquareSize - row * spacing;

    square.style.left = leftPos + "px";
    square.style.top = topPos + "px";

    // Add tooltip event listeners using D3.js
    d3.select(square)
      .on("mouseover", function (event) {
        tooltip
          .style("opacity", 1)
          .html(`Country ${countryIndex + 1} - Square ${i + 1}`)
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
  if (activeCountries.length === 0) return; // No active grids to layout

  const globalSquareSize = findGlobalSquareSize();
  const containers = document.querySelectorAll(".grid-container");
  activeCountries.forEach((countryIndex, index) => {
    const container = containers[index];
    layoutSquaresForContainer(
      container,
      squaresPerGridFull[countryIndex],
      globalSquareSize,
      countryIndex
    );
  });
}

// Toggle button state
function toggleCountry(countryIndex) {
  const button = document.querySelector(
    `.toggle-button[data-country="${countryIndex + 1}"]`
  );

  if (activeCountries.includes(countryIndex)) {
    // Remove the country if already active
    activeCountries = activeCountries.filter((index) => index !== countryIndex);
    button.classList.remove("toggled");
  } else {
    // Add the country if not active
    activeCountries.push(countryIndex);
    button.classList.add("toggled");
  }

  buildLayout();
}

// Attach event listeners to all buttons
document.querySelectorAll(".toggle-button").forEach((button, index) => {
  button.addEventListener("click", () => toggleCountry(index));
});

// Initial empty layout
buildLayout();

// Re-layout on window resize
window.addEventListener("resize", layoutAllGrids);
