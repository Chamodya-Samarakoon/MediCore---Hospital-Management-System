import React, { useState, useEffect } from 'react';
// If your axios client is under src/api/client.ts, use '../api/client'
// If under src/services/api.ts, keep '../services/api'
import api from '../services/api';
import {
    FileText,
    Users,
    Calendar,
    CreditCard,
    Pill,
    FlaskConical,
    UserCog,
    Printer,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

export const Reports: React.FC = () => {
    const role = localStorage.getItem('role') || '';
    const [activeTab, setActiveTab] = useState<string>('PATIENTS');
    const [loading, setLoading] = useState(false);
    const [reportData, setReportData] = useState<any>(null);

    const fetchReport = async (tab: string) => {
        setLoading(true);
        try {
            let endpoint = '/reports/patients';
            if (tab === 'APPOINTMENTS') endpoint = '/reports/appointments';
            if (tab === 'REVENUE') endpoint = '/reports/revenue';
            if (tab === 'PHARMACY') endpoint = '/reports/pharmacy';
            if (tab === 'LABORATORY') endpoint = '/reports/laboratory';
            if (tab === 'STAFF') endpoint = '/reports/staff';

            const res = await api.get(endpoint);
            setReportData(res.data);
        } catch (err) {
            console.error('Failed to load report', err);
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport(activeTab);
    }, [activeTab]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Hospital Analytics & Reports</h1>
                    <p className="text-sm text-gray-500">Live operational, financial, and clinical reporting digests.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchReport(activeTab)}
                        className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition cursor-pointer"
                        title="Refresh Report"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer"
                    >
                        <Printer size={16} /> Print / Export PDF
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('PATIENTS')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'PATIENTS' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={16} /> Patient Reports
                </button>
                <button
                    onClick={() => setActiveTab('APPOINTMENTS')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'APPOINTMENTS' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Calendar size={16} /> Appointments
                </button>
                {['ADMIN', 'ACCOUNTANT'].includes(role) && (
                    <button
                        onClick={() => setActiveTab('REVENUE')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'REVENUE' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <CreditCard size={16} /> Revenue & Billing
                    </button>
                )}
                {['ADMIN', 'PHARMACIST', 'DOCTOR'].includes(role) && (
                    <button
                        onClick={() => setActiveTab('PHARMACY')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'PHARMACY' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Pill size={16} /> Pharmacy & Stock
                    </button>
                )}
                {['ADMIN', 'LAB_STAFF', 'DOCTOR'].includes(role) && (
                    <button
                        onClick={() => setActiveTab('LABORATORY')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'LABORATORY' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FlaskConical size={16} /> Laboratory
                    </button>
                )}
                {['ADMIN'].includes(role) && (
                    <button
                        onClick={() => setActiveTab('STAFF')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'STAFF' ? 'border-sky-600 text-sky-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UserCog size={16} /> Staff Attendance
                    </button>
                )}
            </div>

            {/* Report Body */}
            {loading ? (
                <div className="p-12 text-center text-gray-400 font-medium">Generating report data...</div>
            ) : !reportData ? (
                <div className="p-12 text-center text-gray-400">No report metrics available for this section.</div>
            ) : (
                <div className="space-y-6">
                    {activeTab === 'PATIENTS' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Patients</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-2">{reportData.totalRegistered}</div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Active Inpatients</div>
                                    <div className="text-2xl font-bold text-sky-600 mt-2">{reportData.totalAdmittedNow}</div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
                                <h3 className="font-bold text-gray-900 mb-4 text-base">Recent Patient Admissions & Registrations</h3>
                                <table className="w-full text-left text-sm text-gray-600">
                                    <thead className="bg-gray-50 text-xs font-semibold text-gray-700">
                                        <tr>
                                            <th className="px-4 py-2.5">Code</th>
                                            <th className="px-4 py-2.5">Patient Name</th>
                                            <th className="px-4 py-2.5">Gender</th>
                                            <th className="px-4 py-2.5">Blood Group</th>
                                            <th className="px-4 py-2.5">Registered</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {reportData.recentRegistrations?.map((p: any) => (
                                            <tr key={p.patientNumber}>
                                                <td className="px-4 py-2 font-bold text-sky-700">{p.patientNumber}</td>
                                                <td className="px-4 py-2 font-medium text-gray-900">{p.fullName}</td>
                                                <td className="px-4 py-2">{p.gender}</td>
                                                <td className="px-4 py-2 font-semibold text-rose-600">{p.bloodGroup}</td>
                                                <td className="px-4 py-2 text-xs">{p.registrationDate}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'REVENUE' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total Invoiced</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">
                                    Rs. {Number(reportData.totalBilled || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total Collected</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">
                                    Rs. {Number(reportData.totalCollected || 0).toLocaleString()}
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Outstanding Balance</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">
                                    Rs. {Number(reportData.outstandingBalance || 0).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'PHARMACY' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Medicines</div>
                                    <div className="text-2xl font-bold text-gray-900 mt-2">{reportData.totalMedicines}</div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Low Stock Threshold (&lt; 20)</div>
                                    <div className="text-2xl font-bold text-amber-600 mt-2">{reportData.lowStockCount}</div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-gray-200">
                                    <div className="text-xs text-gray-500 uppercase font-semibold">Dispensed Orders</div>
                                    <div className="text-2xl font-bold text-emerald-600 mt-2">{reportData.totalDispensedPrescriptions}</div>
                                </div>
                            </div>

                            {reportData.lowStockAlerts?.length > 0 && (
                                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden p-6">
                                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-rose-600">
                                        <AlertCircle size={18} /> Critical Low Stock Items
                                    </h3>
                                    <table className="w-full text-left text-sm text-gray-600">
                                        <thead className="bg-gray-50 text-xs font-semibold text-gray-700">
                                            <tr>
                                                <th className="px-4 py-2.5">Medicine Name</th>
                                                <th className="px-4 py-2.5">Remaining Stock</th>
                                                <th className="px-4 py-2.5">Expiry Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {reportData.lowStockAlerts.map((med: any) => (
                                                <tr key={med.medicineName}>
                                                    <td className="px-4 py-2 font-medium text-gray-900">{med.medicineName}</td>
                                                    <td className="px-4 py-2 font-bold text-rose-600">{med.currentStock} units</td>
                                                    <td className="px-4 py-2 text-xs">{med.expiryDate}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'APPOINTMENTS' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total Scheduled</div>
                                <div className="text-2xl font-bold text-sky-600 mt-2">{reportData.scheduledCount}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Completed Visits</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">{reportData.completedCount}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Cancellations</div>
                                <div className="text-2xl font-bold text-rose-600 mt-2">{reportData.cancelledCount}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'LABORATORY' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total Tests Run</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">{reportData.totalTestsConducted}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Pending Analysis</div>
                                <div className="text-2xl font-bold text-amber-600 mt-2">{reportData.pendingResultsCount}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Completed Reports</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">{reportData.completedResultsCount}</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'STAFF' && (
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Total Roster</div>
                                <div className="text-2xl font-bold text-gray-900 mt-2">{reportData.totalEmployees}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Checked-In Today</div>
                                <div className="text-2xl font-bold text-emerald-600 mt-2">{reportData.presentTodayCount}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">On Approved Leave</div>
                                <div className="text-2xl font-bold text-amber-600 mt-2">{reportData.onLeaveCount}</div>
                            </div>
                            <div className="bg-white p-5 rounded-xl border border-gray-200">
                                <div className="text-xs text-gray-500 uppercase font-semibold">Active Status</div>
                                <div className="text-2xl font-bold text-sky-600 mt-2">{reportData.activeCount}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};