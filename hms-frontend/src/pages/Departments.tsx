import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Department } from '../types';
import { Plus } from 'lucide-react';

export const Departments: React.FC = () => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const userRole = localStorage.getItem('role');
    const canManageDepartments = userRole === 'ADMIN';

    const loadDepartments = () => {
        api.get('/departments').then(res => setDepartments(res.data));
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await api.post('/departments', { name, description });
        setName('');
        setDescription('');
        setShowModal(false);
        loadDepartments();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
                    <p className="text-sm text-gray-500">Hospital administrative and clinical units.</p>
                </div>

                {canManageDepartments && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer"
                    >
                        <Plus size={16} /> Add Department
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {departments.map((d) => (
                    <div key={d.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-2">
                        <h3 className="font-bold text-lg text-gray-900">{d.name}</h3>
                        <p className="text-xs text-gray-500">{d.description || 'No description provided.'}</p>
                    </div>
                ))}
            </div>

            {showModal && canManageDepartments && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Department</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Department Name</label>
                                <input
                                    required
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Description</label>
                                <textarea
                                    rows={3}
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};