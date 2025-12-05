import {useLocation } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";
import { RouterLink } from "../RouterLink";

export function AppBreadcrumb() {
  const location = useLocation();
  const paths = location.pathname.split("/").filter(Boolean); 

  if (paths.length === 0 || (paths.length === 1 && paths[0] === "dashboard")) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  const nameMap: Record<string, string> = {
    dashboard: "dashboard",
    graphics: "gráficos",
    account: "conta",
    users: "usuários"
  };

  const segments = paths[0] === "dashboard" ? paths.slice(1) : paths;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <RouterLink url="/dashboard">dashboard</RouterLink>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {segments.map((segment, index) => {
          const path = `/dashboard/${segments.slice(0, index + 1).join("/")}`;
          const isLast = index === segments.length - 1;
          const name = nameMap[segment] || segment

          return (
            <Fragment key={path}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{name}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <RouterLink url={path}>{name}</RouterLink>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}