let activeMediums = []; // Keeps track of active mediums
let selectedCountry = "Berlin"; // Default country
const spacing = 2;
const padding = 5;
let squaresPerGridFull = []; // Placeholder for square counts

// Initialize Tooltip using D3.js
const tooltip = d3.select("#tooltip");

// Load data from data.json
async function loadData() {
  const response = await fetch("data.json");
  const data = await response.json();

  console.log(data); // Debug: Log the fetched data

  // Update the grid data based on the selected country
  updateGridData(data, selectedCountry);

  // Build the initial layout after loading data
  buildLayout();

  // Attach event listeners for country buttons
  document.querySelectorAll(".country-toggle-button").forEach((button) => {
    button.addEventListener("click", () => {
      console.log(`Clicked country: ${button.dataset.country}`); // Debug
      selectCountry(data, button.dataset.country);
    });
  });
}

function updateGridData(data, country) {
  const countryData = data.find((item) => item.country === country);

  if (!countryData) {
    console.error(`Country data not found for: ${country}`); // Debugging
    return;
  }

  squaresPerGridFull = [
    Math.ceil(countryData["Video conference"] / 1000),
    Math.ceil(countryData["Streaming"] / 1000),
    Math.ceil(countryData["E-Mail attachment"] / 1000),
    Math.ceil(countryData["AI prompt"] / 1000),
    Math.ceil(countryData["E-Mail"] / 1000),
    Math.ceil(countryData["Spam"] / 1000),
    Math.ceil(countryData["Tweet"] / 1000),
    Math.ceil(countryData["Google search"] / 1000),
  ];
}

function selectCountry(data, country) {
  selectedCountry = country;
  updateGridData(data, country);

  // Debugging: Log the selected country
  console.log(`Selected country: ${country}`);

  // Update toggled state for country buttons
  document.querySelectorAll(".country-toggle-button").forEach((button) => {
    // Match the button's `data-country` attribute to the selected country
    button.classList.toggle("toggled", button.dataset.country === country);
  });

  // Rebuild layout to reflect new country data
  buildLayout();
}

// Build the layout based on active mediums
function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = ""; // Clear existing grids

  for (let i = 0; i < 8; i++) {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
    grid.dataset.medium = i;

    if (activeMediums.includes(i)) {
      grid.classList.add("active");
    } else {
      grid.classList.add("inactive");
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
  activeMediums.forEach((mediumIndex, index) => {
    const container = containers[index];
    const maxSize = findMaxSquareSizeForSingleGrid(
      container,
      squaresPerGridFull[mediumIndex]
    );
    sizes.push(maxSize);
  });
  return Math.max(14, Math.min(...sizes)); // Enforce minimum size of 14
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
  const containers = document.querySelectorAll(".grid-container");

  containers.forEach((container) => {
    const mediumIndex = parseInt(container.dataset.medium, 10);

    if (activeMediums.includes(mediumIndex)) {
      const numSquares = squaresPerGridFull[mediumIndex];
      const globalSquareSize = findGlobalSquareSize();
      layoutSquaresForContainer(
        container,
        numSquares,
        globalSquareSize,
        mediumIndex
      );
      container.style.display = "block";
    } else {
      container.style.display = "none";
    }
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
    button.classList.add("toggled");
  }

  buildLayout();
}

document.querySelectorAll(".toggle-button").forEach((button, index) => {
  button.addEventListener("click", () => toggleMedium(index));
});

loadData();
window.addEventListener("resize", layoutAllGrids);
