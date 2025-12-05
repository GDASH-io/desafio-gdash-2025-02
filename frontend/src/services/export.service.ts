export async function exportCSV() {
  const res = await fetch("http://localhost:3000/api/weather/export/csv"); 
  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weather.csv";
  a.click();
  a.remove();
}

export async function exportXLSX() {
  const res = await fetch("http://localhost:3000/api/weather/export/xlsx"); 
  const blob = await res.blob();

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "weather.xlsx";
  a.click();
  a.remove();
}
