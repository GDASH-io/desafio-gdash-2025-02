import { Button } from "../ui/button";
import { Download } from "lucide-react";
import weatherService from "../../services/weatherService";

interface Props {
  from?: string;
  to?: string;
  limit?: number;
}

export function ExportButtons({ from, to, limit }: Props) {
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleCsv = async () => {
    const blob = await weatherService.exportCsv({ from, to, limit });
    downloadBlob(blob, "weather_export.csv");
  };

  const handleXlsx = async () => {
    const blob = await weatherService.exportXlsx({ from, to, limit });
    downloadBlob(blob, "weather_export.xlsx");
  };

  return (
    <div className="flex gap-2">
      <Button variant="secondary" onClick={handleCsv}>
        <Download className="mr-2 h-4 w-4" /> CSV
      </Button>
      <Button onClick={handleXlsx}>
        <Download className="mr-2 h-4 w-4" /> XLSX
      </Button>
    </div>
  );
}
