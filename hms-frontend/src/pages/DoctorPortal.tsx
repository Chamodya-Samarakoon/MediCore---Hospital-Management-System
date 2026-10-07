import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Appointment, Patient, LaboratoryTest, Doctor } from '../types';
import { Calendar, Users, FlaskConical, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoctorPortal: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'appointments' | 'patients' | 'labs'>('appointments');
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [labTests, setLabTests] = useState<LaboratoryTest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        loadDoctorData();
    }, []);

    const loadDoctorData = async () => {
        setLoading(true);
        setError('');
        try {
            const [docRes, apptRes, ptsRes, labRes] = await Promise.all([
                api.get<Doctor>('/doctor/me'),
                api.get<Appointment[]>('/doctor/appointments'),
                api.get<Patient[]>('/doctor/patients'),
                api.get<LaboratoryTest[]>('/doctor/lab-results'),
            ]);

            setDoctor(docRes.data);
            setAppointments(apptRes.data);
            setPatients(ptsRes.data);
            setLabTests(labRes.data);
        } catch (err: any) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                'Could not load doctor records. Verify this account is linked to a doctor in the database.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (appointmentId?: number, newStatus?: string) => {
        if (!appointmentId || !newStatus) return;
        try {
            await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
            loadDoctorData();
        } catch (err: any) {
            alert('Failed to update appointment status');
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <span className="text-xs font-semibold px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full">
                        Clinical Workspace
                    </span>
                    <h1 className="text-2xl font-bold text-slate-900 mt-2">
                        Welcome, Dr. {doctor?.first_name || ''} {doctor?.last_name || doctor?.full_name || 'Doctor'}
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">
                        Specialization: <span className="font-semibold text-slate-700">{doctor?.specialization || 'General Practice'}</span> |
                        Department: <span className="font-semibold text-slate-700">{doctor?.department?.name || 'General'}</span>
                    </p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                        onClick={() => setActiveTab('appointments')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'appointments' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Calendar size={15} /> Appointments ({appointments.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('patients')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'patients' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <Users size={15} /> My Patients ({patients.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('labs')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${activeTab === 'labs' ? 'bg-white text-sky-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <FlaskConical size={15} /> Lab Results ({labTests.length})
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    <span>{error}</span>
                </div>
            )}

            {activeTab === 'appointments' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Scheduled Time</th>
                                <th className="px-6 py-4">Reason / Complaint</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {appointments.map((a) => (
                                <tr key={a.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-900">
                                        {a.patient?.firstName} {a.patient?.lastName}
                                        <span className="block text-[11px] font-normal text-slate-400">
                                            ID: #{a.patient?.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-600">
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={13} className="text-slate-400" />
                                            {a.appointmentTime ? new Date(a.appointmentTime).toLocaleString() : 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-xs max-w-sm">{a.reason || 'General Checkup'}</td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-0.5 rounded text-xs font-semibold border bg-sky-50 text-sky-700 border-sky-300">
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {a.status !== 'COMPLETED' ? (
                                            <button
                                                onClick={() => handleStatusChange(a.id, 'COMPLETED')}
                                                className="inline-flex items-center gap-1 text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                                            >
                                                <CheckCircle2 size={13} /> Mark Completed
                                            </button>
                                        ) : (
                                            <span className="text-xs font-medium text-emerald-600">Done</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {appointments.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                                        No scheduled consultations found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'patients' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {patients.map((p) => (
                        <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-slate-900 text-base">{p.firstName} {p.lastName}</h3>
                                    <p className="text-xs text-slate-400">NIC: {p.nic || 'N/A'}</p>
                                </div>
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-bold">
                                    {p.bloodGroup || 'Blood: N/A'}
                                </span>
                            </div>
                            <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p><span className="text-slate-400">Phone:</span> {p.phone}</p>
                                <p><span className="text-slate-400">Gender:</span> {p.gender}</p>
                                <p><span className="text-slate-400">Summary:</span> {p.conditionSummary || 'No conditions noted'}</p>
                            </div>
                        </div>
                    ))}
                    {patients.length === 0 && !loading && (
                        <div className="col-span-3 text-center py-12 text-slate-400 text-xs">
                            No patients currently assigned.
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'labs' && (
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                            <tr>
                                <th className="px-6 py-4">Test Name</th>
                                <th className="px-6 py-4">Patient</th>
                                <th className="px-6 py-4">Requested On</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Diagnostic Findings</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {labTests.map((t) => (
                                <tr key={t.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-semibold text-slate-900">{t.testName}</td>
                                    <td className="px-6 py-4">
                                        {t.patient ? `${t.patient.firstName} ${t.patient.lastName}` : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {t.requestedDate ? new Date(t.requestedDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${t.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                                            }`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm text-xs font-medium">
                                        {t.resultDetails ? (
                                            <span className="text-slate-800 bg-slate-50 p-2 rounded border border-slate-200 block">
                                                {t.resultDetails}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 italic">Analysis Pending</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {labTests.length === 0 && !loading && (
                                <tr>
                                    <td colSpan={5} className="text-center py-10 text-slate-400 text-xs">
                                        No lab tests on file for your patients.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};