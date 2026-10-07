import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Patient } from '../types';
import { Search, Plus, Trash2 } from 'lucide-react';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState<Patient>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'Male',
    nic: '',
    phone: '',
    email: '',
    address: '',
    emergencyContact: '',
    bloodGroup: 'A+',
    conditionSummary: ''
  });

  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole === 'ADMIN';
  const canAddPatient = currentUserRole === 'ADMIN' || currentUserRole === 'RECEPTIONIST';

  const loadPatients = (query = '') => {
    const url = query ? `/patients?search=${encodeURIComponent(query)}` : '/patients';
    api.get(url)
      .then(res => setPatients(res.data))
      .catch(err => console.error('Failed to load patients', err));
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadPatients(search);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/patients', form);
      setShowModal(false);
      setMessage('Patient registered successfully.');
      setForm({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'Male',
        nic: '',
        phone: '',
        email: '',
        address: '',
        emergencyContact: '',
        bloodGroup: 'A+',
        conditionSummary: ''
      });
      loadPatients();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Error saving patient.');
    }
  };

  const handleDelete = async (id?: number, name?: string) => {
    if (!id) return;
    const confirm = window.confirm(`Are you sure you want to remove patient "${name}"? This action cannot be undone.`);
    if (!confirm) return;

    try {
      await api.delete(`/patients/${id}`);
      setMessage(`Patient "${name}" has been removed.`);
      loadPatients(search);
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to delete patient. Ensure no active records depend on this patient.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-500">{patients.length} on record</p>
        </div>

        {canAddPatient && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer"
          >
            <Plus size={16} /> Add patient
          </button>
        )}
      </div>

      {message && (
        <div className="p-3.5 bg-sky-50 border border-sky-200 text-sky-800 text-xs rounded-xl flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold ml-4 cursor-pointer">✕</button>
        </div>
      )}

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button type="submit" className="px-4 py-2 text-sm font-semibold bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300 cursor-pointer">
          Search
        </button>
      </form>

      {/* Patient Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Blood group</th>
              <th className="px-6 py-4">Condition / Disease</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Email</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {patients.map((p) => {
              const fullName = `${p.firstName} ${p.lastName}`;
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {fullName}
                    <div className="text-xs text-gray-400">{p.patientNumber || `ID #${p.id}`}</div>
                  </td>
                  <td className="px-6 py-4">{p.gender}</td>
                  <td className="px-6 py-4">
                    <span className="bg-rose-50 text-rose-600 font-semibold px-2 py-0.5 rounded text-xs border border-rose-200">
                      {p.bloodGroup}
                    </span>
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate">{p.conditionSummary || 'Normal checkup'}</td>
                  <td className="px-6 py-4">{p.phone}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <button
                        title="Remove patient"
                        onClick={() => handleDelete(p.id, fullName)}
                        className="p-1.5 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 7 : 6} className="text-center py-8 text-gray-400">
                  No patients registered yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && canAddPatient && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Register New Patient</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">First Name</label>
                  <input
                    required
                    placeholder="e.g. Kavindu"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Last Name</label>
                  <input
                    required
                    placeholder="e.g. Silva"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">NIC / ID</label>
                  <input
                    required
                    placeholder="e.g. 198810300123"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.nic}
                    onChange={e => setForm({ ...form, nic: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    required
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.dateOfBirth}
                    onChange={e => setForm({ ...form, dateOfBirth: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Gender</label>
                  <select
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.gender}
                    onChange={e => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Blood Group</label>
                  <input
                    placeholder="e.g. A+, O-, B+"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.bloodGroup}
                    onChange={e => setForm({ ...form, bloodGroup: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-700">Phone</label>
                  <input
                    required
                    placeholder="e.g. 0771239874"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700">Emergency Contact</label>
                  <input
                    placeholder="e.g. 0779988771"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                    value={form.emergencyContact}
                    onChange={e => setForm({ ...form, emergencyContact: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. kavindu.silva@example.com"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Residential Address</label>
                <input
                  type="text"
                  placeholder="e.g. No. 45, Galle Road, Colombo 03"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Condition Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief medical notes or presenting complaints..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.conditionSummary}
                  onChange={e => setForm({ ...form, conditionSummary: e.target.value })}
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
                  Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};