import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Users,
    UserPlus,
    Clock,
    CalendarDays,
    CheckCircle2,
    AlertCircle,
    RotateCw,
    LogIn,
    LogOut,
    Building2,
    KeyRound,
    CalendarPlus,
    Trash2
} from 'lucide-react';

interface Department {
    id: number;
    name: string;
}

export const StaffManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'ATTENDANCE' | 'LEAVES'>('EMPLOYEES');
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [attendance, setAttendance] = useState<any[]>([]);
    const [leaves, setLeaves] = useState<any[]>([]);

    // Modal state
    const [showAddEmp, setShowAddEmp] = useState(false);
    const [showApplyLeave, setShowApplyLeave] = useState(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');

    const userRole = localStorage.getItem('role') || '';
    const isAdmin = userRole === 'ADMIN';

    // Form states
    const [empForm, setEmpForm] = useState({
        employeeCode: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        designation: '',
        departmentId: '',
        username: '',
        password: '',
        role: 'NURSE'
    });

    const [leaveForm, setLeaveForm] = useState({
        employeeId: '',
        leaveType: 'CASUAL',
        startDate: '',
        endDate: '',
        reason: ''
    });

    const loadData = async () => {
        setLoading(true);
        setError('');
        try {
            const [empRes, deptRes, attRes, leaveRes] = await Promise.all([
                api.get('/staff/employees'),
                api.get('/departments').catch(() => ({ data: [] })),
                api.get('/staff/attendance').catch(() => ({ data: [] })),
                api.get('/staff/leaves').catch(() => ({ data: [] }))
            ]);

            setEmployees(Array.isArray(empRes.data) ? empRes.data : []);
            setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
            setAttendance(Array.isArray(attRes.data) ? attRes.data : []);
            setLeaves(Array.isArray(leaveRes.data) ? leaveRes.data : []);
        } catch (err: any) {
            console.error('Error fetching staff data', err);
            setError(err.response?.data?.message || 'Failed to load staff management records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleRegisterEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/staff/employees', {
                ...empForm,
                departmentId: empForm.departmentId ? Number(empForm.departmentId) : null
            });
            setSuccess(`Employee ${empForm.firstName} ${empForm.lastName} registered successfully.`);
            setShowAddEmp(false);
            setEmpForm({
                employeeCode: '',
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                designation: '',
                departmentId: '',
                username: '',
                password: '',
                role: 'NURSE'
            });
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to register employee');
        }
    };

    const handleDeleteEmployee = async (employeeId: number, name: string) => {
        if (!window.confirm(`Are you sure you want to permanently delete employee "${name}"?`)) {
            return;
        }

        setError('');
        setSuccess('');
        try {
            await api.delete(`/staff/employees/${employeeId}`);
            setSuccess(`Employee ${name} deleted successfully.`);
            loadData();
        } catch (err: any) {
            console.error('Error deleting employee', err);
            setError(err.response?.data?.message || 'Failed to delete employee.');
        }
    };

    const handleApplyLeave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await api.post('/staff/leaves', {
                ...leaveForm,
                employeeId: Number(leaveForm.employeeId)
            });
            setSuccess('Leave request submitted successfully.');
            setShowApplyLeave(false);
            setLeaveForm({
                employeeId: '',
                leaveType: 'CASUAL',
                startDate: '',
                endDate: '',
                reason: ''
            });
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit leave request');
        }
    };

    const handleClockIn = async (employeeId: number) => {
        try {
            await api.post('/staff/attendance/clock-in', { employeeId });
            setSuccess('Attendance marked: Checked In');
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to record check-in');
        }
    };

    const handleClockOut = async (attendanceId: number) => {
        try {
            await api.put(`/staff/attendance/clock-out/${attendanceId}`);
            setSuccess('Attendance marked: Checked Out');
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to record check-out');
        }
    };

    const handleLeaveApproval = async (id: number, status: 'APPROVED' | 'REJECTED') => {
        try {
            await api.put(`/staff/leaves/${id}/status`, { status });
            setSuccess(`Leave application #${id} marked as ${status}.`);
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update leave status');
        }
    };

    const handleDepartmentChange = async (employeeId: number, departmentId: string) => {
        if (!departmentId) return;
        try {
            await api.put(`/staff/employees/${employeeId}/department`, {
                departmentId: Number(departmentId)
            });
            setSuccess('Department updated successfully');
            loadData();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update department');
        }
    };

    const renderDepartment = (emp: any) => {
        if (typeof emp.department === 'string') {
            return emp.department;
        }
        if (emp.department?.name) {
            return emp.department.name;
        }
        return <span className="text-amber-500 italic">Unassigned</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Staff Management</h1>
                    <p className="text-sm text-gray-500">Employee records, department allocations, daily attendance, and leave requests.</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        title="Refresh"
                        className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                    >
                        <RotateCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>

                    {isAdmin && activeTab === 'EMPLOYEES' && (
                        <button
                            onClick={() => {
                                setError('');
                                setShowAddEmp(true);
                            }}
                            className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
                        >
                            <UserPlus size={16} /> Register Employee
                        </button>
                    )}

                    {isAdmin && activeTab === 'LEAVES' && (
                        <button
                            onClick={() => {
                                setError('');
                                setShowApplyLeave(true);
                            }}
                            className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer shadow-sm"
                        >
                            <CalendarPlus size={16} /> Apply Leave
                        </button>
                    )}
                </div>
            </div>

            {success && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><CheckCircle2 size={16} /> {success}</span>
                    <button onClick={() => setSuccess('')} className="font-bold cursor-pointer">✕</button>
                </div>
            )}

            {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center justify-between">
                    <span className="flex items-center gap-2"><AlertCircle size={16} /> {error}</span>
                    <button onClick={() => setError('')} className="font-bold cursor-pointer">✕</button>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('EMPLOYEES')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'EMPLOYEES' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users size={16} /> Employees ({employees.length})
                </button>
                <button
                    onClick={() => setActiveTab('ATTENDANCE')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'ATTENDANCE' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Clock size={16} /> Attendance Today ({attendance.length})
                </button>
                <button
                    onClick={() => setActiveTab('LEAVES')}
                    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition cursor-pointer ${activeTab === 'LEAVES' ? 'border-[#0284c7] text-[#0284c7]' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <CalendarDays size={16} /> Leave Applications ({leaves.length})
                </button>
            </div>

            {/* Tab 1: Employees List */}
            {activeTab === 'EMPLOYEES' && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                            <tr>
                                <th className="px-6 py-3">Code</th>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Designation</th>
                                <th className="px-6 py-3">Department</th>
                                <th className="px-6 py-3">Contact</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Quick Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {employees.map((emp) => (
                                <tr key={`${emp.employeeCode}-${emp.id}`} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3.5 font-bold text-sky-700">{emp.employeeCode}</td>
                                    <td className="px-6 py-3.5 font-medium text-gray-900">{emp.firstName} {emp.lastName}</td>
                                    <td className="px-6 py-3.5 font-medium text-slate-700">{emp.designation}</td>
                                    <td className="px-6 py-3.5 font-semibold text-slate-700">
                                        {isAdmin ? (
                                            <select
                                                className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-slate-700 outline-none hover:border-sky-400 focus:ring-1 focus:ring-sky-500 cursor-pointer"
                                                value={
                                                    departments.find(d => d.name === (typeof emp.department === 'string' ? emp.department : emp.department?.name))?.id || ''
                                                }
                                                onChange={(e) => handleDepartmentChange(emp.id, e.target.value)}
                                            >
                                                <option value="">-- Assign Department --</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <Building2 size={13} className="text-gray-400" />
                                                <span>{renderDepartment(emp)}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-3.5 text-xs text-gray-500">
                                        <div>{emp.email}</div>
                                        <div className="text-[11px] text-gray-400">{emp.phone}</div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            {emp.status || 'ACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleClockIn(emp.id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-sky-600 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded border border-sky-200 hover:bg-sky-100 transition cursor-pointer"
                                                title="Mark Present Today"
                                            >
                                                <LogIn size={12} /> Check-In
                                            </button>

                                            {isAdmin && (
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id, `${emp.firstName} ${emp.lastName}`)}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded border border-rose-200 transition cursor-pointer"
                                                    title="Delete Employee"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {employees.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center py-12 text-gray-400">
                                        {loading ? 'Loading staff roster...' : 'No employee records found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 2: Attendance */}
            {activeTab === 'ATTENDANCE' && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Check-In</th>
                                <th className="px-6 py-3">Check-Out</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {attendance.map((att) => (
                                <tr key={att.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3.5 font-medium text-gray-900">
                                        {att.employee?.firstName} {att.employee?.lastName}
                                        <span className="text-xs text-gray-400 block font-normal">
                                            {att.employee?.employeeCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">{att.attendanceDate}</td>
                                    <td className="px-6 py-3.5 text-xs font-semibold text-emerald-700">
                                        {att.checkInTime ? att.checkInTime.slice(0, 8) : '—'}
                                    </td>
                                    <td className="px-6 py-3.5 text-xs font-semibold text-rose-700">
                                        {att.checkOutTime ? att.checkOutTime.slice(0, 8) : '—'}
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200">
                                            {att.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        {!att.checkOutTime && (
                                            <button
                                                onClick={() => handleClockOut(att.id)}
                                                className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded transition cursor-pointer"
                                            >
                                                <LogOut size={12} /> Check-Out
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {attendance.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-gray-400">
                                        No attendance logs recorded for today.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Tab 3: Leave Records */}
            {activeTab === 'LEAVES' && (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-700">
                            <tr>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Duration</th>
                                <th className="px-6 py-3">Reason</th>
                                <th className="px-6 py-3">Status</th>
                                {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {leaves.map((l) => (
                                <tr key={l.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3.5 font-medium text-gray-900">
                                        {l.employee?.firstName} {l.employee?.lastName}
                                        <span className="text-xs text-gray-400 block font-normal">
                                            {l.employee?.employeeCode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 font-semibold text-slate-700">{l.leaveType}</td>
                                    <td className="px-6 py-3.5 text-xs text-gray-500">{l.startDate} to {l.endDate}</td>
                                    <td className="px-6 py-3.5 text-xs">{l.reason}</td>
                                    <td className="px-6 py-3.5">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                            l.status === 'REJECTED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                'bg-amber-50 text-amber-700 border-amber-200'
                                            }`}>
                                            {l.status}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td className="px-6 py-3.5 text-right space-x-2">
                                            {l.status === 'PENDING' && (
                                                <>
                                                    <button
                                                        onClick={() => handleLeaveApproval(l.id, 'APPROVED')}
                                                        className="text-emerald-600 hover:text-emerald-800 p-1 cursor-pointer"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle2 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleLeaveApproval(l.id, 'REJECTED')}
                                                        className="text-rose-600 hover:text-rose-800 p-1 cursor-pointer"
                                                        title="Reject"
                                                    >
                                                        <AlertCircle size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {leaves.length === 0 && (
                                <tr>
                                    <td colSpan={isAdmin ? 6 : 5} className="text-center py-12 text-gray-400">
                                        No leave applications submitted.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal 1: Register Employee */}
            {showAddEmp && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-900 mb-1">Register New Staff Member</h2>
                        <p className="text-xs text-gray-500 mb-4">Creates both the staff profile and system login account.</p>

                        <form onSubmit={handleRegisterEmployee} className="space-y-3.5">
                            <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 space-y-2.5">
                                <span className="text-[11px] font-bold text-sky-900 uppercase tracking-wider flex items-center gap-1.5">
                                    <KeyRound size={13} /> Login Account Credentials
                                </span>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700">Username (Login ID)</label>
                                        <input
                                            required
                                            placeholder="e.g. nurse_kumari"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-sky-500"
                                            value={empForm.username}
                                            onChange={(e) => setEmpForm({ ...empForm, username: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-700">Password</label>
                                        <input
                                            required
                                            type="password"
                                            minLength={6}
                                            placeholder="Min 6 characters"
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none bg-white focus:ring-2 focus:ring-sky-500"
                                            value={empForm.password}
                                            onChange={(e) => setEmpForm({ ...empForm, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-gray-700">System Role</label>
                                    <select
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                        value={empForm.role}
                                        onChange={(e) => setEmpForm({ ...empForm, role: e.target.value })}
                                    >
                                        <option value="NURSE">Nurse</option>
                                        <option value="ACCOUNTANT">Accountant</option>
                                        <option value="LAB_STAFF">Lab Staff</option>
                                        <option value="PHARMACIST">Pharmacist</option>
                                        <option value="RECEPTIONIST">Receptionist</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Employee Code</label>
                                    <input
                                        required
                                        placeholder="e.g. EMP-101"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.employeeCode}
                                        onChange={(e) => setEmpForm({ ...empForm, employeeCode: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Designation</label>
                                    <input
                                        required
                                        placeholder="e.g. Ward Supervisor"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.designation}
                                        onChange={(e) => setEmpForm({ ...empForm, designation: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">First Name</label>
                                    <input
                                        required
                                        placeholder="First Name"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.firstName}
                                        onChange={(e) => setEmpForm({ ...empForm, firstName: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Last Name</label>
                                    <input
                                        required
                                        placeholder="Last Name"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.lastName}
                                        onChange={(e) => setEmpForm({ ...empForm, lastName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="staff@medicore.com"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.email}
                                        onChange={(e) => setEmpForm({ ...empForm, email: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Phone</label>
                                    <input
                                        placeholder="0771234567"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                                        value={empForm.phone}
                                        onChange={(e) => setEmpForm({ ...empForm, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Department</label>
                                <select
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                    value={empForm.departmentId}
                                    onChange={(e) => setEmpForm({ ...empForm, departmentId: e.target.value })}
                                >
                                    <option value="">Assign Department</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>{d.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddEmp(false)}
                                    className="px-4 py-2 border rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                    Save Employee & Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal 2: Apply Leave Application */}
            {showApplyLeave && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Submit Leave Application</h2>
                                <p className="text-xs text-gray-500">Record a planned or emergency absence request.</p>
                            </div>
                            <button
                                onClick={() => setShowApplyLeave(false)}
                                className="text-gray-400 hover:text-gray-600 text-lg leading-none cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleApplyLeave} className="space-y-3.5">
                            <div>
                                <label className="text-xs font-semibold text-gray-700">Employee *</label>
                                <select
                                    required
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                    value={leaveForm.employeeId}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, employeeId: e.target.value })}
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp.id} value={emp.id}>
                                            {emp.employeeCode} - {emp.firstName} {emp.lastName} ({emp.designation})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Leave Type *</label>
                                <select
                                    required
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                    value={leaveForm.leaveType}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                                >
                                    <option value="CASUAL">Casual Leave</option>
                                    <option value="SICK">Sick / Medical Leave</option>
                                    <option value="ANNUAL">Annual Leave</option>
                                    <option value="MATERNITY">Maternity Leave</option>
                                    <option value="EMERGENCY">Emergency Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">Start Date *</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                        value={leaveForm.startDate}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-700">End Date *</label>
                                    <input
                                        required
                                        type="date"
                                        min={leaveForm.startDate || undefined}
                                        className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
                                        value={leaveForm.endDate}
                                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-700">Reason / Details *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Provide reason for absence..."
                                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                    value={leaveForm.reason}
                                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowApplyLeave(false)}
                                    className="px-4 py-2 border rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                                >
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};