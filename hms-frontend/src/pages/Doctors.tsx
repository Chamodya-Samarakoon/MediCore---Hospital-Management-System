import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Doctor, Department } from '../types';
import { Plus, Mail, Phone, Calendar, Clock, AlertCircle, CheckCircle2, RotateCw } from 'lucide-react';

export const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const userRole = localStorage.getItem('role');
  const canManageDoctors = userRole === 'ADMIN' || userRole === 'RECEPTIONIST';

  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    departmentId: '',
    workingDays: 'Monday - Friday',
    workingHours: '08:00 AM - 02:00 PM'
  });

  const loadData = async () => {
    setFetchLoading(true);
    setError('');

    try {
      const res = await api.get<Doctor[]>('/doctors');
      const data = Array.isArray(res.data) ? res.data : [];
      setDoctors(data);
    } catch (err: any) {
      console.error('Failed to load doctors', err);
      const serverMessage = err.response?.data?.message || err.message;
      setError(`Failed to load doctors directory: ${serverMessage}`);
    } finally {
      setFetchLoading(false);
    }

    try {
      const deptRes = await api.get<Department[]>('/departments');
      setDepartments(Array.isArray(deptRes.data) ? deptRes.data : []);
    } catch (deptErr: any) {
      console.warn('Departments could not be loaded', deptErr);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageDoctors) return;

    setError('');
    setSuccess('');
    setLoading(true);

    const generatedFullName = `Dr. ${form.firstName.trim()} ${form.lastName.trim()}`.trim();

    try {
      await api.post('/doctors', {
        ...form,
        fullName: generatedFullName,
        departmentId: form.departmentId ? Number(form.departmentId) : null
      });

      setSuccess(`Doctor ${generatedFullName} and login credentials created successfully!`);
      setShowModal(false);
      setForm({
        username: '',
        password: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: '',
        departmentId: '',
        workingDays: 'Monday - Friday',
        workingHours: '08:00 AM - 02:00 PM'
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add doctor');
    } finally {
      setLoading(false);
    }
  };

  const getDoctorDisplayName = (doc: any) => {
    if (doc.full_name) return doc.full_name;
    if (doc.fullName) return doc.fullName;
    const fName = doc.first_name || doc.firstName || '';
    const lName = doc.last_name || doc.lastName || '';
    return fName || lName ? `Dr. ${fName} ${lName}`.trim() : 'Dr. Doctor';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
          <p className="text-sm text-gray-500">
            {fetchLoading ? 'Loading directory...' : `${doctors.length} on medical staff`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            title="Refresh"
            className="p-2.5 text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            <RotateCw size={16} className={fetchLoading ? 'animate-spin' : ''} />
          </button>

          {canManageDoctors && (
            <button
              onClick={() => {
                setError('');
                setShowModal(true);
              }}
              className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer"
            >
              <Plus size={16} /> Add doctor
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

      {fetchLoading && doctors.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-500 shadow-sm">
          Loading doctors roster...
        </div>
      )}

      {/* Doctors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {doctors.map((doc: any) => (
          <div key={doc.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-900 text-base">
                  {getDoctorDisplayName(doc)}
                </h3>
                <p className="text-xs font-medium text-sky-600">
                  {doc.specialization || 'Consultant'}
                </p>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                {doc.status || 'ACTIVE'}
              </span>
            </div>

            <div className="text-xs text-gray-600 space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <p className="flex items-center gap-2">
                <Mail size={13} className="text-gray-400" />
                <span>{doc.email || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={13} className="text-gray-400" />
                <span>{doc.phone || 'N/A'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={13} className="text-gray-400" />
                <span>{doc.working_days || doc.workingDays || 'Mon - Fri'}</span>
              </p>
              <p className="flex items-center gap-2">
                <Clock size={13} className="text-gray-400" />
                <span>{doc.working_hours || doc.workingHours || '08:00 AM - 02:00 PM'}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {!fetchLoading && doctors.length === 0 && !error && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-sm text-gray-400 shadow-sm">
          No doctors found.
        </div>
      )}

      {showModal && canManageDoctors && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Add Medical Doctor</h2>
            <p className="text-xs text-gray-500 mb-4">Creates both the Doctor clinical profile and system login account.</p>

            <form onSubmit={handleAddDoctor} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Username (Login ID)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. dr_kasun"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Login Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Temporary password"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fernando"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. kasun@medicore.com"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. 0771234567"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Specialization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cardiologist"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Department</label>
                  <select
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Working Days</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.workingDays}
                    onChange={(e) => setForm({ ...form, workingDays: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Working Hours</label>
                  <input
                    type="text"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.workingHours}
                    onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Save Doctor & Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};