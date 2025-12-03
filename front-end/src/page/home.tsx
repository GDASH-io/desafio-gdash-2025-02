import { useState } from "react";
import { CardLogin } from "../components/card-login";
import { CardUser } from "../components/card-user";
import { ChartDashboard } from "../components/chart-area-stacked";
import { TableDashboard } from "../components/table-dashboad";
import Cookie from "js-cookie";
export function Home() {
  const [token] = useState<string | undefined>(() =>
    Cookie.get("token")
  );
  return (
    <>
      {token ? (
        <div className="grid gap-5 p-5 items-center align-middle justify-center">
          <div className="md:flex gap-5 md:items-center grid justify-center items-center">
            <div className="flex-1 h-full w-full">
              <CardUser />
            </div>
            <div className="md:flex-2 h-full md:w-2xl">
              <ChartDashboard />
            </div>
          </div>
          <div className="h-full md:w-full ">
            <TableDashboard />
          </div>
        </div>
      ) : (
        <>
          <CardLogin />
          <div className="grid gap-5 p-5 items-center align-middle justify-center">
            <div className="md:flex gap-5 md:items-center grid justify-center items-center">
              <div className="flex-1 h-full w-full">
                <CardUser />
              </div>
              <div className="md:flex-2 h-full md:w-2xl">
                <ChartDashboard />
              </div>
            </div>
            <div className="h-full md:w-full ">
              <TableDashboard />
            </div>
          </div>
        </>
      )}
    </>
  );
}
