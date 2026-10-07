import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Pill, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Medicine {
    id?: number;
    name: string;
    category: string;
    batchNumber: string;
    quantity: number;
    unitPrice: number;
    expiryDate: string;
    reorderLevel?: number;
}

export const Pharmacy: React.FC = () => {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const defaultForm = {
        name: '',
        category: 'Analgesic',
        batchNumber: '',
        quantity: 100,
        unitPrice: 15,
        expiryDate: '2028-12-31'
    };

    const [medicineForm, setMedicineForm] = useState(defaultForm);

    const loadMedicines = () => {
        // Fallback checks both potential routes
        api.get<Medicine[]>('/pharmacy/medicines')
            .then(res => setMedicines(res.data))
            .catch(() => {
                api.get<Medicine[]>('/medicines')
                    .then(res => setMedicines(res.data))
                    .catch(err => console.error('Failed to load medicines', err));
            });
    };

    useEffect(() => {
        loadMedicines();
    }, []);

    const handleSaveMedicine = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        const payload = {
            name: medicineForm.name.trim(),
            category: medicineForm.category.trim(),
            batchNumber: medicineForm.batchNumber.trim(),
            quantity: Number(medicineForm.quantity),
            unitPrice: Number(medicineForm.unitPrice),
            expiryDate: medicineForm.expiryDate, // Standard YYYY-MM-DD
            reorderLevel: 10
        };

        try {
            // Tries standard endpoint first, falls back to direct endpoint if 404
            try {
                await api.post('/pharmacy/medicines', payload);
            } catch (postErr: any) {
                if (postErr.response?.status === 404) {
                    await api.post('/medicines', payload);
                } else {
                    throw postErr;
                }
            }

            setSuccess(`Medicine "${payload.name}" added to stock successfully.`);
            setShowAddModal(false);
            setMedicineForm(defaultForm);
            loadMedicines();
        } catch (err: any) {
            console.error('Error saving medicine:', err);
            const serverMsg = err.response?.data?.message || err.message;
            setError(serverMsg || 'Failed to save medicine. Check backend logs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pharmacy & Medicines</h1>
                    <p className="text-sm text-gray-500">Track medicine inventory, batches, and unit prices.</p>
                </div>
                <button
                    onClick={() => {
                        setError('');
                        setMedicineForm(defaultForm);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer"
                >
                    <Plus size={16} /> Add Medicine
                </button>
            </div>

            {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
                    <button onClick={() => setSuccess('')} className="font-bold cursor-pointer">✕</button>
                </div>
            )}

            {error && !showAddModal && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    <button onClick={() => setError('')} className="font-bold cursor-pointer">✕</button>
                </div>
            )}

            {/* Medicines Inventory Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                        <tr>
                            <th className="px-6 py-4">Medicine Name</th>
                            <th className="px-6 py-4">Category</th>
                            <th className="px-6 py-4">Batch #</th>
                            <th className="px-6 py-4">In Stock</th>
                            <th className="px-6 py-4">Unit Price (Rs.)</th>
                            <th className="px-6 py-4">Expiry Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {medicines.map((m) => (
                            <tr key={m.id || m.batchNumber} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                                    <Pill size={16} className="text-sky-600" />
                                    {m.name}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-xs">
                                        {m.category}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{m.batchNumber}</td>
                                <td className="px-6 py-4">
                                    <span className={`font-semibold ${m.quantity <= 20 ? 'text-rose-600' : 'text-gray-800'}`}>
                                        {m.quantity}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-emerald-600 font-semibold">
                                    Rs. {Number(m.unitPrice).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">{m.expiryDate}</td>
                            </tr>
                        ))}
                        {medicines.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400">
                                    No medicines in inventory yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Dialog */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Medicine to Stock</h2>

                        {error && (
                            <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center gap-2">
                                <AlertCircle size={14} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSaveMedicine} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Medicine Name</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Paracetamol 500mg"
                                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={medicineForm.name}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Category</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Antibiotic"
                                        className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                        value={medicineForm.category}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, category: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Batch #</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. BTH-101"
                                        className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                        value={medicineForm.batchNumber}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, batchNumber: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Quantity</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                        value={medicineForm.quantity}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Unit Price (Rs.)</label>
                                    <input
                                        required
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                        value={medicineForm.unitPrice}
                                        onChange={(e) => setMedicineForm({ ...medicineForm, unitPrice: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Expiry Date</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={medicineForm.expiryDate}
                                    onChange={(e) => setMedicineForm({ ...medicineForm, expiryDate: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50 cursor-pointer"
                                >
                                    {loading ? 'Saving...' : 'Save Medicine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};