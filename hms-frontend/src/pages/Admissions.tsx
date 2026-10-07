import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Bed, ArrowUpDown, Filter, CheckCircle2, UserCheck, RotateCw, AlertCircle } from 'lucide-react';

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    patientNumber?: string;
    phone?: string;
    nic?: string;
}

interface Admission {
    id: number;
    patient: Patient;
    wardNumber: string;
    bedNumber: string;
    admissionDate: string;
    dischargeDate?: string;
    status: 'ADMITTED' | 'DISCHARGED';
}

type SortField = 'name' | 'ward' | 'date';

export const Admissions: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const [wardNumber, setWardNumber] = useState('Ward-A');
    const [bedNumber, setBedNumber] = useState('Bed-01');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [admissions, setAdmissions] = useState<Admission[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);

    // Role-based permissions: Only ADMIN, NURSE, RECEPTIONIST can admit/discharge.
    // ACCOUNTANT and DOCTOR are view-only.
    const userRole = localStorage.getItem('role') || '';
    const canManageAdmissions = userRole === 'ADMIN' || userRole === 'NURSE' || userRole === 'RECEPTIONIST';

    // Sorting and Filtering State
    const [sortBy, setSortBy] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'ADMITTED' | 'DISCHARGED'>('ALL');

    const loadData = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await api.get<Admission[]>('/admissions');
            setAdmissions(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to load admissions', err);
            setError(err.response?.data?.message || 'Failed to load inpatient admissions directory.');
        } finally {
            setLoading(false);
        }

        // Only load patient dropdown if user has permissions to admit
        if (canManageAdmissions) {
            try {
                const res = await api.get<Patient[]>('/patients');
                setPatients(Array.isArray(res.data) ? res.data : []);
            } catch (err: any) {
                console.error('Failed to load patients', err);
            }
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!canManageAdmissions) return;

        if (!patientId) {
            setError('Please select a patient to admit.');
            return;
        }

        const selectedPatient = patients.find(p => p.id === Number(patientId));
        const patientDisplayName = selectedPatient
            ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
            : `ID #${patientId}`;

        try {
            await api.post('/admissions', {
                patient: { id: Number(patientId) },
                wardNumber,
                bedNumber
            });
            setMessage(`Patient "${patientDisplayName}" admitted successfully to ${wardNumber}, ${bedNumber}`);
            setPatientId('');
            setWardNumber('Ward-A');
            setBedNumber('Bed-01');
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error admitting patient.');
        }
    };

    const handleDischarge = async (id: number) => {
        if (!canManageAdmissions) return;

        try {
            await api.put(`/admissions/${id}/discharge`);
            setMessage(`Admission #${id} marked as discharged.`);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error discharging patient.');
        }
    };

    // Filter & Sort Logic
    const filteredAndSortedAdmissions = [...admissions]
        .filter(a => {
            if (filterStatus === 'ALL') return true;
            return a.status === filterStatus;
        })
        .sort((a, b) => {
            let comparison = 0;
            if (sortBy === 'name') {
                const nameA = `${a.patient?.firstName || ''} ${a.patient?.lastName || ''}`.toLowerCase();
                const nameB = `${b.patient?.firstName || ''} ${b.patient?.lastName || ''}`.toLowerCase();
                comparison = nameA.localeCompare(nameB);
            } else if (sortBy === 'ward') {
                const wardA = (a.wardNumber || '').toLowerCase();
                const wardB = (b.wardNumber || '').toLowerCase();
                comparison = wardA.localeCompare(wardB);
            } else if (sortBy === 'date') {
                const dateA = new Date(a.admissionDate || 0).getTime();
                const dateB = new Date(b.admissionDate || 0).getTime();
                comparison = dateA - dateB;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Inpatient Admissions</h1>
                    <p className="text-sm text-gray-500">Manage inpatient wards, bed allocations, and admissions directory.</p>
                </div>
                <button
                    onClick={loadData}
                    title="Refresh"
                    className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                >
                    <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            {message && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {message}</span>
                    <button onClick={() => setMessage('')} className="text-emerald-700 font-bold ml-4 cursor-pointer">✕</button>
                </div>
            )}

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-sm rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    <button onClick={() => setError('')} className="text-rose-700 font-bold ml-4 cursor-pointer">✕</button>
                </div>
            )}

            {/* Admission Form Card - Only visible to ADMIN, NURSE, RECEPTIONIST */}
            {canManageAdmissions && (
                <div className="max-w-xl bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Bed size={18} className="text-sky-600" /> Admit New Patient
                    </h2>
                    <form onSubmit={handleAdmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-700">Patient</label>
                            <select
                                required
                                value={patientId}
                                onChange={e => setPatientId(e.target.value)}
                                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                            >
                                <option value="">Select Patient</option>
                                {patients.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName} {p.patientNumber ? `(${p.patientNumber})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Ward Number</label>
                                <input
                                    required
                                    className="w-full mt-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={wardNumber}
                                    onChange={e => setWardNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Bed Number</label>
                                <input
                                    required
                                    className="w-full mt-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                    value={bedNumber}
                                    onChange={e => setBedNumber(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-lg text-sm transition cursor-pointer"
                        >
                            Admit Patient
                        </button>
                    </form>
                </div>
            )}

            {/* Admissions Table with Controls */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                        <UserCheck size={20} className="text-sky-600" />
                        <h3>Admitted Patients Directory</h3>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold">
                            {filteredAndSortedAdmissions.length}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700">
                            <Filter size={14} className="text-gray-400" />
                            <label className="font-semibold text-gray-500">Status:</label>
                            <select
                                className="outline-none bg-transparent font-medium cursor-pointer"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as any)}
                            >
                                <option value="ALL">All</option>
                                <option value="ADMITTED">Admitted</option>
                                <option value="DISCHARGED">Discharged</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700">
                            <ArrowUpDown size={14} className="text-gray-400" />
                            <label className="font-semibold text-gray-500">Sort by:</label>
                            <select
                                className="outline-none bg-transparent font-medium cursor-pointer"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortField)}
                            >
                                <option value="date">Date Admitted</option>
                                <option value="ward">Ward / Bed</option>
                                <option value="name">Patient Name</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                            className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 transition cursor-pointer"
                        >
                            {sortOrder === 'asc' ? 'Ascending ↑' : 'Descending ↓'}
                        </button>
                    </div>
                </div>

                {/* Directory Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                            <tr>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Ward</th>
                                <th className="px-6 py-4">Bed Number</th>
                                <th className="px-6 py-4">Admission Date</th>
                                <th className="px-6 py-4">Status</th>
                                {canManageAdmissions && <th className="px-6 py-4 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedAdmissions.map((a) => (
                                <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {a.patient?.firstName} {a.patient?.lastName}
                                        <span className="text-xs text-gray-400 block font-normal">
                                            {a.patient?.patientNumber || `Patient #${a.patient?.id}`} {a.patient?.phone ? `• ${a.patient.phone}` : ''}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-800">
                                        <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2.5 py-0.5 rounded text-xs">
                                            {a.wardNumber}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-800">{a.bedNumber}</td>
                                    <td className="px-6 py-4 text-xs text-gray-600">
                                        {a.admissionDate ? new Date(a.admissionDate).toLocaleString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {a.status === 'ADMITTED' ? (
                                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold inline-flex items-center gap-1">
                                                <CheckCircle2 size={12} /> Admitted
                                            </span>
                                        ) : (
                                            <span className="bg-gray-100 text-gray-600 border border-gray-300 px-2.5 py-0.5 rounded text-xs font-semibold">
                                                Discharged
                                            </span>
                                        )}
                                    </td>
                                    {canManageAdmissions && (
                                        <td className="px-6 py-4 text-right">
                                            {a.status === 'ADMITTED' && (
                                                <button
                                                    onClick={() => handleDischarge(a.id)}
                                                    className="px-3 py-1 text-xs font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                                                >
                                                    Discharge
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {filteredAndSortedAdmissions.length === 0 && (
                                <tr>
                                    <td colSpan={canManageAdmissions ? 6 : 5} className="text-center py-8 text-gray-400">
                                        {loading ? 'Loading admissions...' : 'No admission records matching the selected criteria.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};