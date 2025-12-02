import React from "react";
import api from "../api"; // seu axios configurado
import { Download } from "lucide-react";

export function ExportButtons() {
  const token = localStorage.getItem("token");

  const handleDownload = async (type: "csv" | "xlsx") => {
    try {
      const response = await api.get(`/weather/export/${type}`, {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const blob = new Blob([response.data]);

      const filename =
        type === "csv" ? "weather.csv" : "weather.xlsx";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = filename;
      a.click();

      // limpar
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Erro ao baixar arquivo", err);
    }
  };

  return (
    <div className="flex gap-4 mt-6">
      <button
        onClick={() => handleDownload("csv")}
        className="px-4 py-2 bg-green-600 text-white rounded shadow flex items-center gap-2 hover:bg-green-700 transition"
      >
        <Download size={16} /> CSV
      </button>

      <button
        onClick={() => handleDownload("xlsx")}
        className="px-4 py-2 bg-blue-600 text-white rounded shadow flex items-center gap-2 hover:bg-blue-700 transition"
      >
        <Download size={16} /> XLSX
      </button>
    </div>
  );
}
