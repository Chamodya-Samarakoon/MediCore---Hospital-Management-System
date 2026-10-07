import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, CreditCard, Receipt, FileText } from 'lucide-react';

interface Patient {
    id: number;
    firstName: string;
    lastName: string;
    patientNumber?: string;
    nic?: string;
}

interface Invoice {
    id: number;
    invoiceNumber?: string;
    patient: Patient;
    totalAmount: number;
    paidAmount: number;
    status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID';
    createdAt?: string;
}

interface Payment {
    id: number;
    invoice: Invoice;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
    paymentDate: string;
}

export const Billing: React.FC = () => {
    const [patientId, setPatientId] = useState('');
    const [totalAmount, setTotalAmount] = useState('');
    const [invoiceId, setInvoiceId] = useState('');
    const [payAmount, setPayAmount] = useState('');
    const [message, setMessage] = useState('');

    const [patients, setPatients] = useState<Patient[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);

    const loadBillingData = () => {
        // Fetch registered patients for the selection dropdown
        api.get<Patient[]>('/patients')
            .then(res => setPatients(res.data))
            .catch(err => console.error('Error fetching patients', err));

        // Fetch invoices
        api.get<Invoice[]>('/billing/invoices')
            .then(res => setInvoices(res.data))
            .catch(err => console.error('Error fetching invoices', err));

        // Fetch recorded payments
        api.get<Payment[]>('/billing/payments')
            .then(res => setPayments(res.data))
            .catch(err => console.error('Error fetching payments', err));
    };

    useEffect(() => {
        loadBillingData();
    }, []);

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!patientId) {
            setMessage('Please select a patient.');
            return;
        }

        const selectedPatient = patients.find(p => p.id === Number(patientId));
        const patientName = selectedPatient
            ? `${selectedPatient.firstName} ${selectedPatient.lastName}`
            : `Patient #${patientId}`;

        try {
            const res = await api.post('/billing/invoices', {
                patientId: Number(patientId),
                totalAmount: Number(totalAmount)
            });
            setMessage(`Invoice created with ID #${res.data.id} for ${patientName}`);
            setPatientId('');
            setTotalAmount('');
            loadBillingData();
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Error creating invoice.');
        }
    };

    const handleMakePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!invoiceId) {
            setMessage('Please select an invoice.');
            return;
        }

        try {
            const res = await api.post('/billing/payments', {
                invoiceId: Number(invoiceId),
                amount: Number(payAmount),
                paymentMethod: 'CASH'
            });
            setMessage(`Payment recorded! Receipt: ${res.data.receiptNumber}`);
            setInvoiceId('');
            setPayAmount('');
            loadBillingData();
        } catch (err: any) {
            setMessage(err.response?.data?.message || 'Error processing payment.');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded text-xs font-semibold">PAID</span>;
            case 'PARTIALLY_PAID':
                return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded text-xs font-semibold">PARTIALLY PAID</span>;
            default:
                return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded text-xs font-semibold">PENDING</span>;
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Billing & Payments</h1>
                <p className="text-sm text-gray-500">Invoices, revenue collection, and receipts.</p>
            </div>

            {message && (
                <div className="p-4 bg-sky-50 border border-sky-200 text-sky-800 text-sm rounded-xl flex items-center justify-between">
                    <span>{message}</span>
                    <button onClick={() => setMessage('')} className="font-bold ml-4 cursor-pointer">✕</button>
                </div>
            )}

            {/* Forms Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <Plus size={18} className="text-sky-600" />
                        <h2>Generate Patient Invoice</h2>
                    </div>
                    <form onSubmit={handleCreateInvoice} className="space-y-3">
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

                        <div>
                            <label className="text-xs font-semibold text-gray-700">Total Charge (Rs.)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="e.g. 500"
                                className="w-full mt-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                value={totalAmount}
                                onChange={e => setTotalAmount(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                        >
                            Generate Invoice
                        </button>
                    </form>
                </div>

                {/* Record Payment Card */}
                <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                        <CreditCard size={18} className="text-emerald-600" />
                        <h2>Record Bill Payment</h2>
                    </div>
                    <form onSubmit={handleMakePayment} className="space-y-3">
                        <div>
                            <label className="text-xs font-semibold text-gray-700">Invoice</label>
                            <select
                                required
                                value={invoiceId}
                                onChange={e => {
                                    setInvoiceId(e.target.value);
                                    const selected = invoices.find(inv => inv.id === Number(e.target.value));
                                    if (selected) {
                                        const due = (selected.totalAmount || 0) - (selected.paidAmount || 0);
                                        setPayAmount(due > 0 ? String(due) : '');
                                    }
                                }}
                                className="w-full mt-1 p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                            >
                                <option value="">Select Invoice to Pay</option>
                                {invoices
                                    .filter(inv => inv.status !== 'PAID')
                                    .map((inv) => {
                                        const due = ((inv.totalAmount || 0) - (inv.paidAmount || 0)).toFixed(2);
                                        return (
                                            <option key={inv.id} value={inv.id}>
                                                {inv.invoiceNumber || `INV-${inv.id}`} • {inv.patient?.firstName} {inv.patient?.lastName} (Due: Rs. {due})
                                            </option>
                                        );
                                    })}
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-gray-700">Paid Amount (Rs.)</label>
                            <input
                                required
                                type="number"
                                step="0.01"
                                placeholder="e.g. 500"
                                className="w-full mt-1 p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                                value={payAmount}
                                onChange={e => setPayAmount(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition cursor-pointer"
                        >
                            Process Payment
                        </button>
                    </form>
                </div>
            </div>

            {/* Invoices List Table */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                    <FileText size={20} className="text-sky-600" />
                    <h3>All Invoices</h3>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                            <tr>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Total Amount (Rs.)</th>
                                <th className="px-6 py-4">Paid Amount (Rs.)</th>
                                <th className="px-6 py-4">Due Balance (Rs.)</th>
                                <th className="px-6 py-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-medium text-gray-900">
                                        {inv.invoiceNumber || `INV-${inv.id}`}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {inv.patient?.firstName} {inv.patient?.lastName}
                                        <span className="text-xs text-gray-400 block font-normal">
                                            {inv.patient?.patientNumber || `Patient #${inv.patient?.id}`}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{inv.totalAmount?.toFixed(2)}</td>
                                    <td className="px-6 py-4 font-semibold text-emerald-600">{inv.paidAmount?.toFixed(2) || '0.00'}</td>
                                    <td className="px-6 py-4 font-semibold text-rose-600">
                                        {((inv.totalAmount || 0) - (inv.paidAmount || 0)).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                                </tr>
                            ))}
                            {invoices.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-400">No invoices generated yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payments History Table */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                    <Receipt size={20} className="text-emerald-600" />
                    <h3>Payment History & Receipts</h3>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                            <tr>
                                <th className="px-6 py-4">Receipt #</th>
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Patient Name</th>
                                <th className="px-6 py-4">Amount Paid (Rs.)</th>
                                <th className="px-6 py-4">Payment Method</th>
                                <th className="px-6 py-4">Date & Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                                    <td className="px-6 py-4 font-mono text-gray-700">
                                        {p.invoice?.invoiceNumber || `INV-${p.invoice?.id}`}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {p.invoice?.patient?.firstName} {p.invoice?.patient?.lastName}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-emerald-600">{p.amount?.toFixed(2)}</td>
                                    <td className="px-6 py-4">{p.paymentMethod}</td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {p.paymentDate ? new Date(p.paymentDate).toLocaleString() : 'N/A'}
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-6 text-gray-400">No payments recorded yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};