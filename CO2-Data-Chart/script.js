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

  // Always create 8 grid containers, one for each possible country
  for (let i = 0; i < 8; i++) {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
    grid.dataset.country = i; // Assign a data attribute to identify the country

    if (activeCountries.includes(i)) {
      grid.classList.add("active"); // Mark as active if it's toggled
    } else {
      grid.classList.add("inactive"); // Mark as inactive otherwise
    }

    outerContainer.appendChild(grid);
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
  activeCountries.forEach((countryIndex, index) => {
    const container = containers[index];
    const maxSize = findMaxSquareSizeForSingleGrid(
      container,
      squaresPerGridFull[countryIndex]
    );
    sizes.push(maxSize);
  });
  return Math.max(14, Math.min(...sizes)); // Enforce minimum size of 14
}

function layoutSquaresForContainer(
  container,
  numSquares,
  globalSquareSize,
  countryIndex
) {
  container.innerHTML = "";

  const totalWidth = container.clientWidth;
  const innerWidth = totalWidth - 2 * padding;

  let chosenColumns = 1;
  for (let cols = numSquares; cols >= 1; cols--) {
    const rows = Math.ceil(numSquares / cols);
    const totalHorizontalSpacing = (cols - 1) * spacing;
    const totalVerticalSpacing = (rows - 1) * spacing;

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
    container.scrollTop = container.scrollHeight; // Scroll to the bottom
  }

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.width = globalSquareSize + "px";
    square.style.height = globalSquareSize + "px";

    const col = i % chosenColumns;
    const row = Math.floor(i / chosenColumns);

    const leftPos = padding + col * (globalSquareSize + spacing); // Columns are left-aligned
    const topPos = padding + row * (globalSquareSize + spacing); // Rows are top-aligned

    square.style.left = leftPos + "px";
    square.style.top = topPos + "px";

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
  const containers = document.querySelectorAll(".grid-container");

  containers.forEach((container) => {
    const countryIndex = parseInt(container.dataset.country, 10);

    if (activeCountries.includes(countryIndex)) {
      const numSquares = squaresPerGridFull[countryIndex];
      const globalSquareSize = findGlobalSquareSize();
      layoutSquaresForContainer(
        container,
        numSquares,
        globalSquareSize,
        countryIndex
      );
      container.style.display = "block"; // Ensure active grids are visible
    } else {
      container.style.display = "none"; // Hide inactive grids
    }
  });
}

function toggleCountry(countryIndex) {
  const button = document.querySelector(
    `.toggle-button[data-country="${countryIndex + 1}"]`
  );

  if (activeCountries.includes(countryIndex)) {
    activeCountries = activeCountries.filter((index) => index !== countryIndex);
    button.classList.remove("toggled");
  } else {
    activeCountries.push(countryIndex);
    button.classList.add("toggled");
  }

  buildLayout();
}

document.querySelectorAll(".toggle-button").forEach((button, index) => {
  button.addEventListener("click", () => toggleCountry(index));
});

buildLayout();
window.addEventListener("resize", layoutAllGrids);
