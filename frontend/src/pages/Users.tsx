import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UsersSkeleton } from '@/components/UsersSkeleton';

interface User {
  _id: string;
  email: string;
  createdAt: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/users`, {
        email,
        password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmail('');
      setPassword('');
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <UsersSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white">User Management</h1>
          <Button variant="outline" onClick={() => window.location.href = '/dashboard'} className="bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-100">
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader><CardTitle>Create User</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="flex flex-col gap-4">
                <Input 
                  placeholder="Email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                />
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-500"
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Create</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader><CardTitle>Existing Users</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {users.map((user: any) => (
                  <li key={user._id} className="p-3 border border-slate-800 rounded bg-slate-950/50 flex justify-between items-center">
                    <span className="font-medium">{user.email}</span>
                    <span className="text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Users;
