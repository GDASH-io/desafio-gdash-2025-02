import { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useAuth } from '../auth/AuthProvider';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface User {
  _id: string;
  email: string;
  roles: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export function UserManagement() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [newUserData, setNewUserData] = useState({ email: '', password: '', roles: 'user' });

  useEffect(() => {
    if (token) {
      fetchUsers();
    }
  }, [token]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await axios.post(`${API_BASE_URL}/api/users`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewUserData({ email: '', password: '', roles: 'user' });
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user.');
      console.error(err);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setError(null);
    try {
      await axios.put(`${API_BASE_URL}/api/users/${currentUser._id}`, newUserData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user.');
      console.error(err);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/api/users/${currentUser._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete user.');
      console.error(err);
    }
  };

  const openEditDialog = (user: User) => {
    setCurrentUser(user);
    setNewUserData({ email: user.email, password: '', roles: user.roles });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: User) => {
    setCurrentUser(user);
    setIsDeleteDialogOpen(true);
  };

  if (loading) return <p>Loading users...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!token) return <p>Please log in to manage users.</p>;
  if (user?.roles !== 'admin') return <p>You do not have permission to view this page.</p>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">User Management</h2>

      {/* Create User Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="new-email">Email</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-roles">Roles</Label>
              <select
                id="new-roles"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUserData.roles}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserData({ ...newUserData, roles: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" className="md:col-span-3">Add User</Button>
          </form>
        </CardContent>
      </Card>

      {/* Users Table */}
      <div>
        <h3 className="text-2xl font-bold mb-4">Existing Users</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Roles</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem._id}>
                <TableCell>{userItem.email}</TableCell>
                <TableCell>{userItem.roles}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(userItem)} className="mr-2">Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(userItem)}>Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={newUserData.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-password" className="text-right">New Password (optional)</Label>
              <Input
                id="edit-password"
                type="password"
                value={newUserData.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewUserData({ ...newUserData, password: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-roles" className="text-right">Roles</Label>
              <select
                id="edit-roles"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={newUserData.roles}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewUserData({ ...newUserData, roles: e.target.value })}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Alert Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user <span className="font-bold">{currentUser?.email}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
