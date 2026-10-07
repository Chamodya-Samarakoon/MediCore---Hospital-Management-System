import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LaboratoryTest, Patient } from '../types';
import { Plus, FileEdit, CheckCircle2 } from 'lucide-react';

export const Laboratory: React.FC = () => {
    const [tests, setTests] = useState<LaboratoryTest[]>([]);
    const [patients, setPatients] = useState<Patient[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showResultModal, setShowResultModal] = useState<boolean>(false);
    const [selectedTest, setSelectedTest] = useState<LaboratoryTest | null>(null);
    const [resultText, setResultText] = useState<string>('');

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [form, setForm] = useState({
        patientId: '',
        testName: ''
    });

    const loadData = () => {
        api.get<LaboratoryTest[]>('/laboratory/tests')
            .then((res) => setTests(res.data))
            .catch((err) => console.error('Failed to load lab tests', err));

        api.get<Patient[]>('/patients')
            .then((res) => setPatients(res.data))
            .catch((err) => console.error('Failed to load patients', err));
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRequestSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await api.post('/laboratory/tests', {
                patient: { id: Number(form.patientId) },
                testName: form.testName
            });

            setSuccessMessage('Lab test requested successfully!');
            setShowModal(false);
            setForm({ patientId: '', testName: '' });
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to request lab test';
            setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const handleOpenResultModal = (test: LaboratoryTest) => {
        setSelectedTest(test);
        setResultText(test.resultDetails || '');
        setShowResultModal(true);
    };

    const handleResultSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTest?.id) return;

        setErrorMessage('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await api.patch(`/laboratory/tests/${selectedTest.id}/result`, {
                resultDetails: resultText
            });

            setSuccessMessage(`Results recorded for ${selectedTest.testName}!`);
            setShowResultModal(false);
            setSelectedTest(null);
            setResultText('');
            loadData();
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data || err.message || 'Failed to update results';
            setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'bg-emerald-50 text-emerald-700 border-emerald-300';
            case 'SAMPLE_COLLECTED':
                return 'bg-blue-50 text-blue-700 border-blue-300';
            case 'CANCELLED':
                return 'bg-rose-50 text-rose-700 border-rose-300';
            default:
                return 'bg-amber-50 text-amber-700 border-amber-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Laboratory Operations</h1>
                    <p className="text-sm text-gray-500">Diagnostic test orders, sample collection, and reports.</p>
                </div>
                <button
                    onClick={() => {
                        setErrorMessage('');
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition"
                >
                    <Plus size={16} /> Request Test
                </button>
            </div>

            {successMessage && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                    <span>{successMessage}</span>
                    <button onClick={() => setSuccessMessage('')} className="font-bold ml-4">✕</button>
                </div>
            )}

            {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage('')} className="font-bold ml-4">✕</button>
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                        <tr>
                            <th className="px-6 py-4">Test Name</th>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Requested Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Results</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {tests.map((test) => (
                            <tr key={test.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-900">{test.testName}</td>
                                <td className="px-6 py-4">
                                    {test.patient ? `${test.patient.firstName} ${test.patient.lastName}` : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-500">
                                    {test.requestedDate ? new Date(test.requestedDate).toLocaleString() : 'Just now'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusBadgeStyle(test.status)}`}>
                                        {test.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 max-w-xs text-gray-700 font-medium">
                                    {test.resultDetails ? (
                                        <span className="text-gray-900">{test.resultDetails}</span>
                                    ) : (
                                        <span className="text-gray-400 italic">Pending analysis</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleOpenResultModal(test)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-lg text-xs font-semibold transition"
                                    >
                                        <FileEdit size={14} />
                                        {test.resultDetails ? 'Edit Result' : 'Enter Result'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {tests.length === 0 && (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-gray-400">
                                    No laboratory tests found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Request Lab Test</h2>

                        <form onSubmit={handleRequestSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Patient Name</label>
                                <select
                                    required
                                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                                <label className="text-xs font-semibold text-gray-700">Test Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Full Blood Count (FBC)"
                                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={form.testName}
                                    onChange={(e) => setForm({ ...form, testName: e.target.value })}
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
                                    disabled={loading}
                                    className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showResultModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Enter Test Results</h2>
                        <p className="text-xs text-gray-500 mb-4">
                            Recording findings for <span className="font-semibold text-gray-700">{selectedTest?.testName}</span> (Patient: {selectedTest?.patient?.firstName} {selectedTest?.patient?.lastName})
                        </p>

                        <form onSubmit={handleResultSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Lab Findings / Diagnosis Values</label>
                                <textarea
                                    required
                                    rows={4}
                                    placeholder="e.g. Hemoglobin: 13.5 g/dL, WBC: 6,800/mcL, Platelets: 240,000/mcL. Normal profile."
                                    className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                                    value={resultText}
                                    onChange={(e) => setResultText(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResultModal(false);
                                        setSelectedTest(null);
                                    }}
                                    className="px-4 py-2 border rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition disabled:opacity-50"
                                >
                                    <CheckCircle2 size={16} />
                                    {loading ? 'Saving...' : 'Save & Complete'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};