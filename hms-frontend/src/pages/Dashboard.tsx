import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, UserCheck, CalendarCheck, FileSpreadsheet } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalInvoices: 0,
    totalPayments: 0,
    admittedPatients: 0
  });

  useEffect(() => {
    api.get('/reports/dashboard-stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.log('Stats endpoint requires elevated role or not ready:', err));
  }, []);

  const cards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-sky-600 bg-sky-50' },
    { title: 'Active Admissions', value: stats.admittedPatients, icon: UserCheck, color: 'text-indigo-600 bg-indigo-50' },
    { title: 'Total Invoices', value: stats.totalInvoices, icon: FileSpreadsheet, color: 'text-emerald-600 bg-emerald-50' },
    { title: 'Recorded Payments', value: stats.totalPayments, icon: CalendarCheck, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hospital Operational Dashboard</h1>
        <p className="text-sm text-gray-500">Live operational overview for MediCore departments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase text-gray-500">{c.title}</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{c.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${c.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};