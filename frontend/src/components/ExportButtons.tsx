import { Button } from "@/components/ui/button"
import { ButtonGroup, ButtonGroupSeparator } from "@/components/ui/button-group"
import { exportCSV, exportXLSX } from "@/services/export.service"
import { FileSpreadsheet, FileText } from "lucide-react"

export function ExportButtons() {
  return (
    <div className="flex gap-2">
        <ButtonGroup>
            <Button onClick={exportCSV} size='sm'>
                <FileText className="w-4 h-4 mr-2" />
                CSV
                </Button>
                <ButtonGroupSeparator/>
                <Button onClick={exportXLSX} size='sm'>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                XLSX
            </Button>
        </ButtonGroup>
    </div>
  );
}
