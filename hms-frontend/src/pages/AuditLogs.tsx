import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { AuditLog } from '../types';

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);

    useEffect(() => {
        api.get('/audit-logs')
            .then(res => setLogs(res.data))
            .catch(err => console.log('Audit logs restricted to ADMIN', err));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">System Audit Trail</h1>
                <p className="text-sm text-gray-500">Security activity log for all user operations.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 text-xs">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Module</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {logs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-semibold text-gray-900">{log.username}</td>
                                <td className="px-6 py-4">
                                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                                        {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{log.module}</td>
                                <td className="px-6 py-4">{log.description}</td>
                                <td className="px-6 py-4 text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                        {logs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-400">No logs available or access restricted.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};