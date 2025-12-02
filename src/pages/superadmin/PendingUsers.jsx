import React, { useEffect, useState } from 'react';
import Table from '../../components/Table';
import Button from '../../components/Button';
import { ConfirmModal } from '../../components/Modal';
import LoadingSpinner from '../../components/LoadingSpinner';
import { getPendingUsers, approveUser } from '../../api/admin.api';

export default function PendingUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await getPendingUsers({ q });
      const d = res.data || res;
      if (d && d.rows) {
        setUsers(d.rows);
      } else {
        setUsers(d || []);
      }
    } catch (err) {
      console.error('Failed to load pending users:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove() {
    if (!selectedUser) return;
    try {
      await approveUser(selectedUser.id);
      setShowConfirm(false);
      setSelectedUser(null);
      load();
    } catch (e) {
      alert('Failed to approve user');
    }
  }

  function openConfirm(user) {
    setSelectedUser(user);
    setShowConfirm(true);
  }

  const columns = [
    {
      header: 'Name',
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-sm text-gray-500">{row.email}</div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium uppercase">
          {row.role}
        </span>
      )
    },
    {
      header: 'College',
      accessor: 'collegeId',
      render: (row) => row.College?.name || 'N/A'
    },
    {
      header: 'Actions',
      render: (row) => (
        <Button
          variant="success"
          size="sm"
          onClick={() => openConfirm(row)}
        >
          Approve
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Pending User Approvals</h1>
        <p className="text-gray-600 mt-1">Review and approve TPO and Instructor accounts</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name or email..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button onClick={load} variant="primary">
          Search
        </Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingSpinner size="lg" className="py-12" />
      ) : (
        <Table
          columns={columns}
          data={users}
          emptyMessage="No pending users found. All accounts are approved!"
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleApprove}
        title="Approve User"
        message={`Are you sure you want to approve ${selectedUser?.name} (${selectedUser?.role})? They will gain access to the platform immediately.`}
        confirmText="Approve"
        variant="success"
      />
    </div>
  );
}

