import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { formatDate } from '../../utils/currency';
import { ConfirmDialog, PageHeader, Spinner } from '../../components/ui';
import { useToast } from '../../context/ToastContext';

export default function AdminUsers() {
  const navigate = useNavigate();
  const { push } = useToast();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [removeId, setRemoveId] = useState(null);

  const load = () => adminApi.get('/admin/users').then((response) => setRows(response.data.data)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => rows.filter((row) => {
    const text = `${row.name} ${row.email} ${row.mobile}`.toLowerCase();
    if (search && !text.includes(search.toLowerCase())) return false;
    if (status && row.status !== status) return false;
    return true;
  }), [rows, search, status]);

  const setActive = async (row, isActive) => {
    try {
      const response = await adminApi.put(`/admin/users/${row.id}/status`, { isActive });
      push(response.data.message);
      load();
    } catch (error) {
      push(error.response?.data?.message || 'Could not update user.', 'error');
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader title="Users" subtitle="Registered InflationWise accounts. Passwords are never shown." />
      <div className="card mb-6 grid gap-3 p-4 md:grid-cols-2">
        <input className="input" placeholder="Search users" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select className="input" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          <option>Active</option>
          <option>Inactive</option>
        </select>
      </div>
      <div className="card overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-[#20205A] text-white">
            <tr>{['User Name', 'Email', 'Mobile Number', 'Account Status', 'Created Date', 'Actions'].map((head) => <th key={head} className="px-4 py-3 font-semibold">{head}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-[#E6EEF3]">
                <td className="px-4 py-3">{row.name}</td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.mobile}</td>
                <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${row.isActive ? 'bg-[#DDF8FB] text-[#20205A]' : 'bg-[#EEF2FF] text-[#3155C6]'}`}>{row.status}</span></td>
                <td className="px-4 py-3">{formatDate(row.createdAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button className="text-[#3155C6]" type="button" onClick={() => navigate(`/admin/users/${row.id}`)}>View</button>
                    {row.isActive
                      ? <button className="text-[#20205A]" type="button" onClick={() => setActive(row, false)}>Deactivate</button>
                      : <button className="text-[#20205A]" type="button" onClick={() => setActive(row, true)}>Activate</button>}
                    <button className="text-[#20205A]" type="button" onClick={() => setRemoveId(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td className="px-4 py-6 text-[#6B7280]" colSpan="6">No users found.</td></tr>}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(removeId)}
        title="Delete user"
        message="Are you sure you want to delete this user?"
        confirmText="Delete"
        danger
        onClose={() => setRemoveId(null)}
        onConfirm={async () => {
          await adminApi.delete(`/admin/users/${removeId}`);
          setRemoveId(null);
          push('User deleted successfully.');
          load();
        }}
      />
    </div>
  );
}
