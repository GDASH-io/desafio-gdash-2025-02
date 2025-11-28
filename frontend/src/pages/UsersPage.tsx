import { UserManagement } from '../components/sections/UserManagement';
import { useUsers } from '../hooks/useUsers';

export function UsersPage({ token }: { token: string | null }) {
    const usersState = useUsers(token);
    return (
        <div className="space-y-4">
            <UserManagement {...usersState} />
        </div>
    );
}
