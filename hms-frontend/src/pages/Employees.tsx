import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Role } from '../types';
import { UserPlus, Shield, Mail, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface Employee {
    id: number;
    username: string;
    fullName?: string;
    email: string;
    role: Role;
    active?: boolean;
}

const ROLES: Role[] = [
    'ADMIN',
    'DOCTOR',
    'NURSE',
    'RECEPTIONIST',
    'LAB_STAFF',
    'PHARMACIST',
    'ACCOUNTANT'
];

export const Employees: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const currentUsername = localStorage.getItem('username');

    const [form, setForm] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        role: 'RECEPTIONIST' as Role
    });

    const loadEmployees = () => {
        api.get<Employee[]>('/users')
            .then((res) => setEmployees(res.data))
            .catch((err) => console.error(err));
    };

    useEffect(() => {
        loadEmployees();
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await api.post('/users', form);
            setSuccess(`Account created for ${form.username} (${form.role})`);
            setShowModal(false);
            setForm({ username: '', fullName: '', email: '', password: '', role: 'RECEPTIONIST' });
            loadEmployees();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user account');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (emp: Employee) => {
        if (emp.username === currentUsername) {
            setError('You cannot delete your own logged-in account.');
            return;
        }

        const confirmDelete = window.confirm(
            `Are you sure you want to remove ${emp.fullName || emp.username} (@${emp.username})? This action cannot be undone.`
        );
        if (!confirmDelete) return;

        setError('');
        setSuccess('');
        setDeletingId(emp.id);

        try {
            await api.delete(`/users/${emp.id}`);
            setSuccess(`Account @${emp.username} deleted successfully.`);
            loadEmployees();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete staff member.');
        } finally {
            setDeletingId(null);
        }
    };

    const getBadgeStyle = (role: Role) => {
        switch (role) {
            case 'ADMIN': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'DOCTOR': return 'bg-sky-50 text-sky-700 border-sky-200';
            case 'NURSE': return 'bg-teal-50 text-teal-700 border-teal-200';
            case 'LAB_STAFF': return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'PHARMACIST': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'ACCOUNTANT': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff & Access Management</h1>
                    <p className="text-sm text-gray-500">Add hospital staff, provision roles, and issue system credentials.</p>
                </div>
                <button
                    onClick={() => {
                        setError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition"
                >
                    <UserPlus size={16} /> Add Staff Account
                </button>
            </div>

            {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
                    <button onClick={() => setSuccess('')} className="font-bold">✕</button>
                </div>
            )}

            {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    <button onClick={() => setError('')} className="font-bold">✕</button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Staff Member</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">Assigned Role</th>
                            <th className="px-6 py-4">Account Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {employees.map((emp) => (
                            <tr key={emp.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 text-xs text-gray-400">#{emp.id}</td>
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-gray-900 block">{emp.fullName || emp.username}</span>
                                    <span className="text-xs text-gray-400 font-mono">@{emp.username}</span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    <span className="flex items-center gap-1.5"><Mail size={13} /> {emp.email}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border inline-flex items-center gap-1 ${getBadgeStyle(emp.role)}`}>
                                        <Shield size={12} /> {emp.role.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                                        ACTIVE
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {emp.username !== currentUsername ? (
                                        <button
                                            onClick={() => handleDeleteUser(emp)}
                                            disabled={deletingId === emp.id}
                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-lg transition disabled:opacity-50"
                                            title="Remove Account"
                                        >
                                            <Trash2 size={14} />
                                            {deletingId === emp.id ? 'Deleting...' : 'Delete'}
                                        </button>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Current User</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {employees.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400 text-xs">
                                    No staff accounts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Provision Staff Account</h2>
                        <p className="text-xs text-gray-500 mb-4">Set up system access and credentials for a staff member.</p>

                        <form onSubmit={handleCreateUser} className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Username</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. dr_perera"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Dr. Sarath Perera"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                                    value={form.fullName}
                                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="e.g. staff@medicore.com"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="Temporary password"
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm"
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Role</label>
                                <select
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    value={form.role}
                                    onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                                >
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>
                                            {r.replace('_', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Create Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};