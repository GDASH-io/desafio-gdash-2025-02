import * as XLSX from 'xlsx';

export function jsonToXLSX(jsonData: object[], fileName: string = "data.xlsx"): string {
  
  const mapped = jsonData.map(row => ({
    "Cidade": row["cityName"],
    "Data": new Date(row["date"]).toLocaleDateString("pt-br"),
    "Horário": row["time"] ,
    "Temperatura (°C)": Math.round(row["temperature"]),
    "Sensação térmica (°C)": Math.round(row["apparentTemperature"]),
    "Umidade (%)": row["humidity"],
    "Chuva (mm)": row["rain"],
    "Nuvens (%)": row["cloudCover"],
    "Precipitação (mm)": row["precipitation"],
    "Velocidade do vento (km/h)": row["windSpeed"],
  }));

  const worksheet = XLSX.utils.json_to_sheet(mapped)
  
  const columns = Object.keys(mapped[0]);

  worksheet["!cols"] = columns.map(col => {
    const maxLength = Math.max(
      col.length,
      ...mapped.map(row => String(row[col] || '').length)
    )
    return { wch: maxLength + 2 }
  })

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Dados');

  const base64 = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' })
  return base64

}