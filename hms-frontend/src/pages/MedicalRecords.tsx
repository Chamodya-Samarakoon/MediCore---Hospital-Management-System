import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { MedicalRecord, Patient, Doctor } from '../types';
import { Search, Plus } from 'lucide-react';

export const MedicalRecords: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const [records, setRecords] = useState<MedicalRecord[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [pageMessage, setPageMessage] = useState('');
    const [modalError, setModalError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        patientId: '',
        doctorId: '',
        symptoms: '',
        diagnosis: '',
        treatment: ''
    });

    const loadPatientsAndDoctors = () => {
        api.get<Patient[]>('/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error('Failed to load patients', err));

        api.get<Doctor[]>('/doctors')
            .then(res => setDoctors(res.data))
            .catch(err => console.error('Failed to load doctors', err));
    };

    useEffect(() => {
        loadPatientsAndDoctors();
    }, []);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) return;
        try {
            const res = await api.get(`/medical-records/patient/${patientId}`);
            setRecords(res.data);
        } catch (err: any) {
            console.error('Failed to fetch records', err);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setModalError('');
        setSubmitting(true);

        try {
            await api.post('/medical-records', {
                patientId: Number(form.patientId),
                doctorId: Number(form.doctorId),
                symptoms: form.symptoms,
                diagnosis: form.diagnosis,
                treatment: form.treatment
            });

            setPageMessage('Medical record created successfully.');
            setShowModal(false);

            const savedPatientId = form.patientId;
            setForm({ patientId: '', doctorId: '', symptoms: '', diagnosis: '', treatment: '' });

            // Automatically switch to and load records for the saved patient
            setPatientId(savedPatientId);
            const res = await api.get(`/medical-records/patient/${savedPatientId}`);
            setRecords(res.data);
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to save medical record.';
            setModalError(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setSubmitting(false);
        }
    };

    const getDoctorDisplayName = (doc?: Doctor): string => {
        if (!doc) return 'Doctor';
        const d = doc as any;
        if (d.name) return d.name;
        if (d.full_name) return d.full_name;
        if (d.fullName) return d.fullName;
        if (d.firstName || d.lastName) {
            return `Dr. ${d.firstName || ''} ${d.lastName || ''}`.trim();
        }
        if (d.first_name || d.last_name) {
            return `Dr. ${d.first_name || ''} ${d.last_name || ''}`.trim();
        }
        return 'Doctor';
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Electronic Medical Records</h1>
                    <p className="text-sm text-gray-500">Patient clinical diagnoses, treatments, and histories.</p>
                </div>
                <button
                    onClick={() => {
                        setModalError('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition"
                >
                    <Plus size={16} /> New Clinical Record
                </button>
            </div>

            {pageMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                    <span>{pageMessage}</span>
                    <button onClick={() => setPageMessage('')} className="font-bold ml-4">✕</button>
                </div>
            )}

            {/* Patient Search Selector */}
            <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
                <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                >
                    <option value="">Select Patient to view records...</option>
                    {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.patientNumber || `ID #${p.id}`})
                        </option>
                    ))}
                </select>
                <button
                    type="submit"
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-sm font-semibold border border-gray-300 rounded-lg flex items-center gap-2"
                >
                    <Search size={16} /> Fetch Records
                </button>
            </form>

            {/* Records History View */}
            <div className="space-y-4">
                {records.map((r) => (
                    <div key={r.id} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-3">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3">
                            <div>
                                <p className="font-bold text-gray-900">
                                    Patient: {r.patient?.firstName} {r.patient?.lastName} ({r.patient?.patientNumber || `ID #${r.patient?.id}`})
                                </p>
                                <p className="text-xs text-gray-500">
                                    Consulting Doctor: {getDoctorDisplayName(r.doctor)} ({r.doctor?.specialization})
                                </p>
                            </div>
                            <span className="text-xs bg-slate-100 px-2.5 py-1 rounded text-slate-600 font-medium">
                                {r.visitDate ? new Date(r.visitDate).toLocaleDateString() : 'Recent Visit'}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                                <span className="font-bold text-gray-700 block">Symptoms:</span>
                                <p className="text-gray-600 mt-1">{r.symptoms}</p>
                            </div>
                            <div>
                                <span className="font-bold text-gray-700 block">Diagnosis:</span>
                                <p className="text-sky-700 font-semibold mt-1">{r.diagnosis}</p>
                            </div>
                            <div>
                                <span className="font-bold text-gray-700 block">Treatment Plan:</span>
                                <p className="text-gray-600 mt-1">{r.treatment}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {records.length === 0 && (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-sm text-gray-400">
                        Select a patient above to display past consultation records.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Add Consultation Record</h2>

                        {modalError && (
                            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
                                {modalError}
                            </div>
                        )}

                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Patient Name</label>
                                <select
                                    required
                                    className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-white"
                                    value={form.patientId}
                                    onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                                >
                                    <option value="">Select Patient</option>
                                    {patients.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.firstName} {p.lastName} ({p.patientNumber || `ID #${p.id}`})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Doctor Name</label>
                                <select
                                    required
                                    className="w-full mt-1 p-2.5 border rounded-lg text-sm bg-white"
                                    value={form.doctorId}
                                    onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                                >
                                    <option value="">Select Doctor</option>
                                    {doctors.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {getDoctorDisplayName(d)} - {d.specialization}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Symptoms</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="e.g. Fever, persistent cough"
                                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                                    value={form.symptoms}
                                    onChange={(e) => setForm({ ...form, symptoms: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Diagnosis</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="e.g. Acute Bronchitis"
                                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                                    value={form.diagnosis}
                                    onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Treatment</label>
                                <textarea
                                    required
                                    rows={2}
                                    placeholder="e.g. Prescribed Amoxicillin 500mg, rest for 3 days"
                                    className="w-full mt-1 p-2 border rounded-lg text-sm"
                                    value={form.treatment}
                                    onChange={(e) => setForm({ ...form, treatment: e.target.value })}
                                />
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
                                    disabled={submitting}
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {submitting ? 'Saving...' : 'Save Record'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};