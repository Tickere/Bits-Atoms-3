// Up to 8 columns, each can have a different number of squares
const squaresPerGridFull = [30, 405, 10, 60, 25, 40, 15, 5];

let numColumns = 4; // Default number of columns, can be changed from 1 to 8

const spacing = 2;
const padding = 0; // Matches .grid-container padding in CSS

function buildLayout() {
  const outerContainer = document.getElementById("outer-container");
  outerContainer.innerHTML = ""; // Clear existing grids

  // Create the specified number of columns
  for (let i = 0; i < numColumns; i++) {
    const grid = document.createElement("div");
    grid.classList.add("grid-container");
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
  const squaresPerGrid = squaresPerGridFull.slice(0, numColumns); // Use only as many as needed

  containers.forEach((container, index) => {
    const maxSize = findMaxSquareSizeForSingleGrid(
      container,
      squaresPerGrid[index]
    );
    sizes.push(maxSize);
  });
  return Math.min(...sizes);
}

function layoutSquaresForContainer(container, numSquares, globalSquareSize) {
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

    container.appendChild(square);
  }
}

function layoutAllGrids() {
  const globalSquareSize = findGlobalSquareSize();
  const containers = document.querySelectorAll(".grid-container");
  const squaresPerGrid = squaresPerGridFull.slice(0, numColumns);

  containers.forEach((container, index) => {
    layoutSquaresForContainer(
      container,
      squaresPerGrid[index],
      globalSquareSize
    );
  });
}

function changeColumns(newCount) {
  if (newCount >= 1 && newCount <= 8) {
    numColumns = newCount;
    buildLayout();
  }
}

// Initial layout
buildLayout();

// Re-layout on window resize
window.addEventListener("resize", layoutAllGrids);
