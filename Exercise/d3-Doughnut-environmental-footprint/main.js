function drawChart(data) {
  console.log("Fetched data: ", data); // Log data to verify structure

  const productData = data.find((item) => item.product === "Dairy milk");
  if (!productData) {
    console.error("Dairy milk data not found!");
    return;
  }

  const values = [
    productData["value 1"],
    productData["value 2"],
    productData["value 3"],
    productData["value 4"],
  ];
  const labels = [
    productData["untergruppe 1"],
    productData["untergruppe 2"],
    productData["untergruppe 3"],
    productData["untergruppe 4"],
  ];

  console.log("Values: ", values);
  console.log("Labels: ", labels);

  // Simplify rendering: Add a simple div for now.
  const container = document.getElementById("container");
  container.innerHTML = `
    <h2>Data for Dairy Milk</h2>
    <p>Labels: ${labels.join(", ")}</p>
    <p>Values: ${values.join(", ")}</p>
  `;
}
