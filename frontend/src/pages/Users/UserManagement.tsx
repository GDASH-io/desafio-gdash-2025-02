import { useUsers } from "./hooks/useUsers";
import { UserFormDialog } from "./components/UserFormDialog";
import { UsersTable } from "./components/TableUsers";
import { UserDeleteDialog } from "./components/UserDeleteDialog";
import { UsersFilterBar } from "./components/UsersFilterBar";
import { UsersHeader } from "./components/UsersHeader";

export default function UsersManager() {
  const { data, ui, actions } = useUsers();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/*  HEADER  */}
      <UsersHeader onCreate={actions.openCreateModal} />

      {/*  BARRA DE FILTROS  */}
      <UsersFilterBar
        filters={ui.filters}
        hasActiveFilters={ui.hasActiveFilters}
        onFilterChange={actions.setFilter}
        onClearFilters={actions.clearFilters}
      />

      {/*  Tabela   */}
      <UsersTable
        users={data.users}
        loading={ui.loading}
        onEdit={actions.openEditModal}
        onDelete={actions.openDeleteModal}
      />

      {/*  Modal edit ou add user (Controlados pelo Hook)  */}
      <UserFormDialog
        open={ui.modals.form}
        onOpenChange={(isOpen) => !isOpen && actions.closeModals()}
        userToEdit={data.selectedUser}
        onSubmit={actions.handleFormSubmit}
      />

      {/* Modal de Exclusão*/}
      <UserDeleteDialog
        open={ui.modals.delete}
        onOpenChange={(isOpen) => !isOpen && actions.closeModals()}
        onConfirm={actions.handleDeleteConfirm}
        userEmail={data.selectedUser?.email}
      />
    </div>
  );
}
