import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Appointment as BaseAppointment, Doctor, Patient } from '../types';
import { Plus, Edit2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Appointment extends BaseAppointment {
  notes?: string;
}

export const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const currentUserRole = localStorage.getItem('role');
  const currentUsername = localStorage.getItem('username');

  const isAdmin = currentUserRole === 'ADMIN';
  const isDoctor = currentUserRole === 'DOCTOR';
  const canBook = currentUserRole === 'ADMIN' || currentUserRole === 'RECEPTIONIST';
  const canChangeStatus = currentUserRole === 'ADMIN' || currentUserRole === 'RECEPTIONIST';

  const formatDoctorName = (d?: any): string => {
    if (!d) return 'Unknown Doctor';
    if (d.fullName) return d.fullName;
    if (d.full_name) return d.full_name;
    const fName = d.firstName || d.first_name || '';
    const lName = d.lastName || d.last_name || '';
    if (fName || lName) return `Dr. ${fName} ${lName}`.trim();
    return `Doctor #${d.id || ''}`;
  };

  const [form, setForm] = useState({
    patientId: '',
    doctorId: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  const [editForm, setEditForm] = useState({
    doctorId: '',
    appointmentTime: '',
    reason: '',
    notes: ''
  });

  const loadData = () => {
    api.get<Appointment[]>('/appointments')
      .then((res) => {
        let list = res.data;
        // Client-side fallback filter for doctor
        if (isDoctor && currentUsername) {
          list = list.filter((a: any) =>
            a.doctor?.user?.username === currentUsername ||
            a.doctor?.username === currentUsername
          );
        }
        setAppointments(list);
      })
      .catch((err) => console.error(err));

    api.get<Doctor[]>('/doctors')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error(err));

    api.get<Patient[]>('/patients')
      .then((res) => setPatients(res.data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.post('/appointments', {
        patientId: Number(form.patientId),
        doctorId: Number(form.doctorId),
        appointmentTime: form.appointmentTime,
        reason: form.reason,
        notes: form.notes
      });
      setSuccess('Appointment booked successfully!');
      setShowAddModal(false);
      setForm({ patientId: '', doctorId: '', appointmentTime: '', reason: '', notes: '' });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (app: Appointment) => {
    setSelectedApp(app);
    setEditForm({
      doctorId: String(app.doctor?.id || ''),
      appointmentTime: app.appointmentTime ? app.appointmentTime.slice(0, 16) : '',
      reason: app.reason || '',
      notes: app.notes || ''
    });
    setError('');
    setShowEditModal(true);
  };

  const handleUpdateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp?.id) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await api.put(`/appointments/${selectedApp.id}`, {
        doctorId: Number(editForm.doctorId),
        appointmentTime: editForm.appointmentTime,
        reason: editForm.reason,
        notes: editForm.notes
      });
      setSuccess(`Appointment #${selectedApp.id} updated successfully.`);
      setShowEditModal(false);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update appointment.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id?: number, newStatus?: string) => {
    if (!id || !newStatus) return;
    try {
      await api.patch(`/appointments/${id}/status`, { status: newStatus });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'NO_SHOW':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-sky-50 text-sky-700 border-sky-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-sm text-gray-500">
            {isDoctor ? 'My consultation schedule and patient bookings.' : 'Consultation schedule and bookings.'}
          </p>
        </div>

        {canBook && (
          <button
            onClick={() => {
              setError('');
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-[#0284c7] hover:bg-[#0369a1] text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow transition cursor-pointer"
          >
            <Plus size={16} /> Book Appointment
          </button>
        )}
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

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
            <tr>
              <th className="px-6 py-4">Patient</th>
              <th className="px-6 py-4">Doctor</th>
              <th className="px-6 py-4">Scheduled Date & Time</th>
              <th className="px-6 py-4">Reason / Notes</th>
              <th className="px-6 py-4">Status</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {appointments.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-semibold text-gray-900">
                  {a.patient?.firstName} {a.patient?.lastName}
                </td>
                <td className="px-6 py-4 text-gray-800">
                  {formatDoctorName(a.doctor)}
                </td>
                <td className="px-6 py-4 text-xs text-gray-600">
                  {a.appointmentTime ? new Date(a.appointmentTime).toLocaleString() : 'N/A'}
                </td>
                <td className="px-6 py-4 max-w-xs text-xs text-gray-600">
                  <span className="font-medium text-gray-800 block">{a.reason || 'Routine Checkup'}</span>
                  {a.notes && <span className="text-gray-400 italic block">{a.notes}</span>}
                </td>
                <td className="px-6 py-4">
                  {canChangeStatus ? (
                    <select
                      value={a.status}
                      onChange={(e) => handleStatusChange(a.id, e.target.value)}
                      className="text-xs font-semibold px-2 py-1 border border-emerald-300 text-emerald-700 rounded-md bg-emerald-50 outline-none cursor-pointer"
                    >
                      <option value="SCHEDULED">SCHEDULED</option>
                      <option value="CONFIRMED">CONFIRMED</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELLED">CANCELLED</option>
                      <option value="NO_SHOW">NO_SHOW</option>
                    </select>
                  ) : (
                    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md border ${getStatusBadgeClass(a.status)}`}>
                      {a.status}
                    </span>
                  )}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => openEditModal(a)}
                      title="Edit Appointment"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-md transition cursor-pointer"
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {appointments.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-gray-400">
                  {isDoctor ? 'No appointments scheduled for you.' : 'No appointments scheduled.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showEditModal && isAdmin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Edit Appointment</h2>
            <p className="text-xs text-gray-500 mb-4">
              Updating appointment for <span className="font-semibold text-gray-700">{selectedApp?.patient?.firstName} {selectedApp?.patient?.lastName}</span>
            </p>

            <form onSubmit={handleUpdateAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Assigned Doctor</label>
                <select
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  value={editForm.doctorId}
                  onChange={(e) => setEditForm({ ...editForm, doctorId: e.target.value })}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDoctorName(d)} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={editForm.appointmentTime}
                  onChange={(e) => setEditForm({ ...editForm, appointmentTime: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Reason</label>
                <input
                  type="text"
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={editForm.reason}
                  onChange={(e) => setEditForm({ ...editForm, reason: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Clinical / Administrative Notes</label>
                <textarea
                  rows={2}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddModal && canBook && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">Book Appointment</h2>
            <p className="text-xs text-gray-500 mb-4">Select patient, doctor, and schedule time slot.</p>

            <form onSubmit={handleCreateAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700">Patient</label>
                <select
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.patientId}
                  onChange={(e) => setForm({ ...form, patientId: e.target.value })}
                >
                  <option value="">Select Patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName} (#{p.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Doctor</label>
                <select
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs bg-white outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.doctorId}
                  onChange={(e) => setForm({ ...form, doctorId: e.target.value })}
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {formatDoctorName(d)} ({d.specialization})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.appointmentTime}
                  onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Reason</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardiology checkup"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Additional patient notes or requests"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-sky-500"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Booking...' : 'Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};