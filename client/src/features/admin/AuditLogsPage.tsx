import React, { useEffect, useState } from 'react';
import { Shield, Search, Filter, Clock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { EmptyState } from '../../components/ui/EmptyState.js';
import { AlertCircle } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(false);



  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.get('/admin/audit-logs');
      if (res.data?.success && res.data.data.length > 0) {
        setLogs(res.data.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setError(true);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.action?.toLowerCase().includes(q) ||
      l.module?.toLowerCase().includes(q) ||
      l.userName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <PageHeader
        title="System Audit Logs & Security Vault"
        subtitle="Cryptographically tracked immutable records of all administrative actions, grade postings, and stipend disbursals."
        badge={<StatusBadge label="ISO 27001 Protocol" variant="red" />}
      />

      {/* Search Input */}
      <div className="card-premium p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter audit records by action keyword, operator name, or module..."
          className="w-full text-xs text-slate-800 bg-transparent focus:outline-none"
        />
      </div>

      {/* Audit Log Table */}
      <div className="card-premium overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-sm text-slate-900">
            Immutable Security Event Stream
          </h3>
          <span className="text-xs text-slate-400 font-semibold">{filteredLogs.length} Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Timestamp</th>
                <th className="py-3.5 px-5">Action Event</th>
                <th className="py-3.5 px-5">Module</th>
                <th className="py-3.5 px-5">Initiated By</th>
                <th className="py-3.5 px-5">Role</th>
                <th className="py-3.5 px-5">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {error ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={AlertCircle}
                      title="Connection Error"
                      description="Failed to load audit logs."
                      action={{ label: 'Retry', onClick: fetchLogs }}
                    />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6}>
                    <EmptyState
                      icon={Shield}
                      title="No Audit Logs"
                      description="No audit logs found matching your criteria."
                    />
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                  <td className="py-3.5 px-5 font-mono text-slate-500 text-[11px]">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-5 font-extrabold text-slate-900">{log.action}</td>
                  <td className="py-3.5 px-5">
                    <StatusBadge label={log.module} variant="teal" size="sm" />
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-slate-700">{log.userName}</td>
                  <td className="py-3.5 px-5 capitalize font-medium text-slate-500">
                    {log.userRole}
                  </td>
                  <td className="py-3.5 px-5 text-slate-400 font-mono text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
