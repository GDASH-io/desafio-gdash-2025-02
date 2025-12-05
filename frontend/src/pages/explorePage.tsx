import * as React from "react";
import { useSwapi } from "../hooks/useSwapi";
import Navbar from "../components/navBar";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import PaginationControls from "../components/paginationControls";

const ExplorePage: React.FC = () => {
  const {
    people,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    fetchPeople,
  } = useSwapi();

  const changePageHandler = (page: number) => {
    fetchPeople(page);
  };

  return (
    <div className="min-h-screen bg-[#f8fbfe]">
      <Navbar />
      <main className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-[#28364F]">
          🌐 Exploração Intergaláctica (SWAPI)
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="mr-2 h-8 w-8 animate-spin text-[#28364F]" />
            <p className="text-[#28364F]">Carregando dados da Galáxia...</p>
          </div>
        ) : (
          <div className="rounded-md border bg-white shadow-md">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Altura</TableHead>
                  <TableHead>Massa</TableHead>
                  <TableHead>Cor do Cabelo</TableHead>
                  <TableHead>Ano de Nascimento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person, index) => (
                  <TableRow key={person.url || index}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.height} cm</TableCell>
                    <TableCell>{person.mass} kg</TableCell>
                    <TableCell>{person.hair_color}</TableCell>
                    <TableCell>{person.birth_year}</TableCell>
                  </TableRow>
                ))}
                {people.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-6 text-gray-500"
                    >
                      Nenhum personagem encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                changePage={changePageHandler}
                nameItem="Personagens"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ExplorePage;
