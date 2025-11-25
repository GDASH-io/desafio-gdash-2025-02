import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersAPI } from "../api";
import { Trash2, Edit } from "lucide-react";
import "./Users.css";

export default function Users() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersAPI.getAll(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleDelete = (id: string) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div className="loading">Carregando...</div>;
  }

  return (
    <div className="container">
      <div className="users-header">
        <h1>Gerenciamento de Usuários</h1>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Função</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users?.data.map((user: any) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className="badge">{user.role}</span>
                </td>
                <td>
                  <span
                    className={`status ${
                      user.isActive ? "active" : "inactive"
                    }`}
                  >
                    {user.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-icon" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDelete(user._id)}
                      title="Deletar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
