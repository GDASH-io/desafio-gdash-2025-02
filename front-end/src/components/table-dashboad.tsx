import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/button";
import { ButtonGroup } from "./ui/button-group";
import { ArrowLeftIcon, FileArrowDownIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { useClimates } from "../lib/use-query-climates";
import { ArrowRightIcon } from "lucide-react";
import { dateFormatter } from "../lib/date-formater";
import { handleExportCSV, handleExportXLSX } from "../lib/data-table";

export interface Climate {
  id: string;
  timeStamp: string;
  temperature: number;
  windSpeed: number;
  windDirection: string;
  weatherCode: string;
}

export interface ClimateResponse {
  climates: Climate[];
}

export function TableDashboard() {
  const [page, SetPage] = useState(1);

  const { data } = useClimates(page);

  const totalItems = data?.climates?.length ?? 0;

  if (data && totalItems === 0 && page > 1) {
    SetPage((p) => p - 1);
  }

  function handleNextPage() {
    if (totalItems > 0) {
      SetPage((p) => p + 1);
    }
  }

  function handlePreviousPage() {
    if (page > 1) {
      SetPage((p) => p - 1);
    }
  }
  return (
    <div className="grid gap-5">
      <div className="flex items-center justify-end">
        <ButtonGroup>
          <Button onClick={()=>handleExportCSV(page)} variant={"outline"}>
            Baixar arquivo CSV <FileArrowDownIcon size={32} />
          </Button>
          <Button onClick={()=>handleExportXLSX(page)} variant={"outline"}>
            Baixar arquivo XLSX <FileArrowDownIcon size={32} />
          </Button>
        </ButtonGroup>
      </div>
      <div className="grid gap-3 h-[250px]">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead className="w-[200px] text-center">Data</TableHead>
              <TableHead className="w-[200px] text-center">Temperatura</TableHead>
              <TableHead className="w-[200px] text-center">Velocidade do Vento</TableHead>
              <TableHead className="w-[200px] text-center">Direção do Vento</TableHead>
              <TableHead className="w-[200px] text-center ">Código meteorológico</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.climates.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-w-[200px] text-center">
                  {`${dateFormatter.format(new Date(item.timeStamp))}H`}
                </TableCell>
                <TableCell className="w-[200px] text-center">{`${item.temperature} (°C)`}</TableCell>
                <TableCell className="w-[200px] text-center">{`${item.windSpeed} km/h`}</TableCell>
                <TableCell className="w-[200px] text-center">{item.windDirection}</TableCell>
                <TableCell className="w-[200px] text-center">{item.weatherCode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end">
        <ButtonGroup>
          <Button onClick={handlePreviousPage} variant={"outline"}>
            <ArrowLeftIcon size={32} />
          </Button>
          <Button onClick={handleNextPage} variant={"outline"}>
            <ArrowRightIcon />
          </Button>
        </ButtonGroup>
      </div>
    </div>
  );
}
