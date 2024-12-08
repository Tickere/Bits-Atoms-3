let numSquares = 7000; // Adjust as needed
const spacing = 2;
const padding = 20; // matches container padding in CSS

const container = document.getElementById("container");

function layoutSquares() {
  container.innerHTML = "";

  const totalWidth = container.clientWidth;
  const totalHeight = container.clientHeight;

  const innerWidth = totalWidth - 2 * padding;
  const innerHeight = totalHeight - 2 * padding;

  let bestConfig = {
    squareSize: 0,
    columns: 1,
    rows: numSquares,
  };

  // Find the best configuration that maximizes square size
  // and if there's a tie, choose the one with more columns
  for (let columns = 1; columns <= numSquares; columns++) {
    const rows = Math.ceil(numSquares / columns);

    const totalHorizontalSpacing = (columns - 1) * spacing;
    const totalVerticalSpacing = (rows - 1) * spacing;

    const possibleWidth = (innerWidth - totalHorizontalSpacing) / columns;
    const possibleHeight = (innerHeight - totalVerticalSpacing) / rows;

    const squareSize = Math.floor(Math.min(possibleWidth, possibleHeight));

    if (
      squareSize > bestConfig.squareSize ||
      (squareSize === bestConfig.squareSize && columns > bestConfig.columns)
    ) {
      bestConfig = { squareSize, columns, rows };
    }
  }

  const { squareSize, columns, rows } = bestConfig;

  // Place squares starting bottom-right, going right-to-left, bottom-to-top.
  //
  // Coordinate system for bottom alignment:
  // bottom row (row=0) should be at the bottom inside the padding.
  // topPos for a given row (0 at bottom):
  // topPos = totalHeight - padding - (row+1)*squareSize - (row)*spacing
  //
  // For columns (right to left):
  // col=0 is the rightmost column:
  // leftPos = padding + ((columns - 1 - col) * (squareSize + spacing))

  for (let i = 0; i < numSquares; i++) {
    const square = document.createElement("div");
    square.classList.add("square");
    square.style.width = squareSize + "px";
    square.style.height = squareSize + "px";

    const col = i % columns;
    const row = Math.floor(i / columns);

    const leftPos = padding + (columns - 1 - col) * (squareSize + spacing);
    const topPos =
      totalHeight - padding - (row + 1) * squareSize - row * spacing;

    square.style.left = leftPos + "px";
    square.style.top = topPos + "px";

    container.appendChild(square);
  }
}

layoutSquares();
window.addEventListener("resize", layoutSquares);
