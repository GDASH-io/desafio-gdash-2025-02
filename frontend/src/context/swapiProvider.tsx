import * as React from "react";
import axios from "axios";
import type {
  ISwapiContext,
  ISwapiPaginatedResponse,
  ISwapiPerson,
} from "../interfaces/swapi.interface";
import { SwapiContext } from "./swapiContextDefinition";

const SWAPI_URL = "https://swapi.dev/api/people/";
const ITEMS_PER_PAGE = 10;

export const SwapiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [people, setPeople] = React.useState<ISwapiPerson[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [totalCount, setTotalCount] = React.useState(0);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchPeople = React.useCallback(async (page: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get<ISwapiPaginatedResponse>(
        `${SWAPI_URL}?page=${page}`
      );
      const data = response.data;

      setPeople(data.results);
      setTotalCount(data.count);
      setCurrentPage(page);
    } catch (err) {
      console.error("Erro ao carregar dados da SWAPI:", err);
      setError("Falha ao carregar personagens de Star Wars. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchPeople(1);
  }, [fetchPeople]);

  const contextValue: ISwapiContext = {
    people,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchPeople,
  };

  return (
    <SwapiContext.Provider value={contextValue}>
      {children}
    </SwapiContext.Provider>
  );
};
