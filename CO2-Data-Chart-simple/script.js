// Initialize the tooltip element using D3.js
const tooltip = d3.select("#tooltip");

// Arrays to store data for grids and mediums
let squaresPerGridFull = []; // Number of squares per grid for each medium
let activeMediums = []; // Indices of mediums currently toggled on
let mediumNames = []; // Names of all mediums extracted from JSON
let mediumDescriptors = []; // Descriptors for each medium

// Layout spacing constants
const spacing = 2; // Space between squares
const padding = 5; // Padding within containers

// Fetch data from the JSON file and initialize the infographic
async function fetchData() {
  try {
    const response = await fetch("data.json"); // Load the data file
    const data = await response.json();

    // Extract medium names, descriptors, and corresponding values from JSON
    const jsonData = data[0]; // Assumes the first object contains relevant data
    mediumNames = Object.keys(jsonData).filter(
      (key) => key !== "emission" && !key.includes("descriptor")
    );
    mediumDescriptors = mediumNames.map(
      (name) => jsonData[`${name} descriptor`]
    );
    squaresPerGridFull = mediumNames.map((name) => jsonData[name]);

    // Generate buttons and initialize layout
    createButtons();
    buildLayout();
  } catch (error) {
    console.error("Failed to fetch or parse data.json:", error);
  }
}

// Create buttons dynamically for each medium
function createButtons() {
  const buttonsContainer = document.getElementById("buttons-container");
  buttonsContainer.innerHTML = ""; // Clear any existing buttons

  mediumNames.forEach((name, index) => {
    const button = document.createElement("button");
    button.className = "toggle-button"; // Assign button class
    button.dataset.medium = index + 1; // Set a data attribute for reference
    button.textContent = name; // Display medium name
    button.addEventListener("click", () => toggleMedium(index)); // Add toggle functionality
    buttonsContainer.appendChild(button); // Append button to container
  });
}

// Build the layout for the infographic grids
function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = ""; // Clear existing grids

  mediumNames.forEach((_, i) => {
    const grid = document.createElement("div");
    grid.classList.add("grid-container"); // Assign grid class
    outerContainer.appendChild(grid);
    grid.style.display = activeMediums.includes(i) ? "flex" : "none"; // Show only active grids
  });

  layoutAllGrids(); // Apply layout to all grids
}

// Calculate the maximum square size for a single grid
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

// Determine the global square size that fits all active grids
function findGlobalSquareSize() {
  const containers = document.querySelectorAll(".grid-container");
  const sizes = [];
  mediumNames.forEach((_, i) => {
    if (activeMediums.includes(i)) {
      const container = containers[i];
      const maxSize = findMaxSquareSizeForSingleGrid(
        container,
        squaresPerGridFull[i]
      );
      sizes.push(maxSize);
    }
  });
  return Math.max(14, Math.min(...sizes)); // Ensure a minimum size of 14px
}

// Layout squares within a container grid
function layoutSquaresForContainer(
  container,
  numSquares,
  globalSquareSize,
  mediumIndex
) {
  container.innerHTML = ""; // Clear existing squares

  const totalWidth = container.clientWidth;
  const innerWidth = totalWidth - 2 * padding;

  // Determine the number of columns based on square size
  let chosenColumns = Math.min(7, numSquares); // Maximum 7 columns
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
    padding + chosenRows * globalSquareSize + (chosenRows - 1) * spacing;
  container.style.height = requiredHeight + "px";

  // Create and position squares
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

    // Add interactivity with tooltips
    d3.select(square)
      .on("mouseover", function (event) {
        tooltip
          .style("opacity", 1)
          .html(
            `${mediumDescriptors[mediumIndex]}<br>${(i + 1).toLocaleString()}`
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

// Layout all active grids
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

// Toggle the visibility of a medium's grid
function toggleMedium(mediumIndex) {
  const button = document.querySelector(
    `.toggle-button[data-medium="${mediumIndex + 1}"]`
  );

  if (activeMediums.includes(mediumIndex)) {
    // Remove from active mediums
    const index = activeMediums.indexOf(mediumIndex);
    activeMediums.splice(index, 1);
    button.classList.remove("toggled");
  } else {
    // Add to active mediums
    activeMediums.push(mediumIndex);
    button.classList.add("toggled");
  }

  buildLayout(); // Rebuild the layout
}

// Fetch data and set up event listener for window resizing
fetchData();
window.addEventListener("resize", layoutAllGrids);
