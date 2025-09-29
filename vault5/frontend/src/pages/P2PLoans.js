import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';
import { p2pLoansAPI, makeIdemKey } from '../services/api';
import LenderApprovalModal from '../components/LenderApprovalModal';
import P2PLoanRequestWizard from '../components/P2PLoanRequestWizard';

const StatusPill = ({ status }) => {
  const map = {
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    funded: 'bg-indigo-100 text-indigo-800',
    active: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    repaid: 'bg-emerald-100 text-emerald-800',
    written_off: 'bg-gray-100 text-gray-800',
    declined: 'bg-gray-200 text-gray-700',
    cancelled: 'bg-gray-200 text-gray-700',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-800';
  return <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cls}`}>{String(status).replace(/_/g,' ')}</span>;
};

const Card = ({ children }) => (
  <div className="border rounded-lg bg-white shadow-sm p-4">{children}</div>
);

export default function P2PLoans() {
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState({ borrowed: [], lent: [], summary: { activeLoans: 0, pendingApprovals: 0, overdueAmount: 0 } });
  const [tab, setTab] = useState('borrowed'); // 'borrowed' | 'lent'
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [repayBusyId, setRepayBusyId] = useState(null);
  const [declineBusyId, setDeclineBusyId] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await p2pLoansAPI.list();
      setList(resp.data?.data || { borrowed: [], lent: [], summary: { activeLoans: 0, pendingApprovals: 0, overdueAmount: 0 } });
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to load P2P loans');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    reload();
  }, [reload]);

  const borrowed = useMemo(() => list.borrowed || [], [list]);
  const lent = useMemo(() => list.lent || [], [list]);

  const onApproveClick = (loan) => {
    setSelectedLoan(loan);
    setApproveOpen(true);
  };

  const onDecline = async (loanId) => {
    setDeclineBusyId(loanId);
    try {
      await p2pLoansAPI.decline(loanId, makeIdemKey('p2p-decline-ui'));
      showSuccess('Loan request declined');
      await reload();
    } catch (e) {
      showError(e?.response?.data?.message || 'Failed to decline loan');
    } finally {
      setDeclineBusyId(null);
    }
  };

  const onRepay = async (loan) => {
    const suggestion = loan.nextPaymentAmount && loan.nextPaymentAmount > 0 ? loan.nextPaymentAmount : Math.min(loan.remainingAmount || 0, 0);
    const input = window.prompt('Enter repayment amount (KES)', suggestion ? String(suggestion) : '');
    if (!input) return;
    const amount = Number(input);
    if (!(amount > 0)) {
      showError('Enter a valid amount');
      return;
    }
    setRepayBusyId(loan._id);
    try {
      await p2pLoansAPI.repay(loan._id, { amount }, makeIdemKey('p2p-repay-ui'));
      showSuccess('Repayment successful');
      await reload();
    } catch (e) {
      showError(e?.response?.data?.message || 'Repayment failed');
    } finally {
      setRepayBusyId(null);
    }
  };

  const renderLoanRow = (loan, isLent) => {
    const money = (n) => `KES ${Number(n || 0).toLocaleString()}`;
    const dueStr = loan.nextPaymentDate ? new Date(loan.nextPaymentDate).toLocaleDateString() : '-';
    const canApprove = isLent && loan.status === 'pending_approval';
    const canRepay = !isLent && ['active', 'funded', 'approved', 'overdue'].includes(loan.status);

    return (
      <Card key={loan._id}>
        <div className="flex justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="font-semibold">{isLent ? 'Your borrower' : 'Your lender'}</div>
              <StatusPill status={loan.status} />
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Principal: <span className="font-medium">{money(loan.principal)}</span> • Remaining:{' '}
              <span className="font-medium">{money(loan.remainingAmount)}</span> • Next due:{' '}
              <span className="font-medium">{dueStr}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Schedule: {loan.scheduleType} • {loan.scheduleFrequency}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {canApprove && (
              <>
                <button
                  onClick={() => onApproveClick(loan)}
                  className="px-3 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => onDecline(loan._id)}
                  disabled={declineBusyId === loan._id}
                  className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50"
                >
                  {declineBusyId === loan._id ? 'Declining...' : 'Decline'}
                </button>
              </>
            )}
            {canRepay && (
              <button
                onClick={() => onRepay(loan)}
                disabled={repayBusyId === loan._id}
                className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {repayBusyId === loan._id ? 'Processing...' : 'Repay'}
              </button>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) return <div className="p-8">Loading P2P loans...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">P2P Loans</h1>
        <button
          onClick={() => setRequestOpen(true)}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
        >
          Request P2P Loan
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <Card>
          <div className="text-xs text-gray-500">Active loans</div>
          <div className="text-xl font-semibold">{list.summary?.activeLoans ?? 0}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Pending approvals</div>
          <div className="text-xl font-semibold">{list.summary?.pendingApprovals ?? 0}</div>
        </Card>
        <Card>
          <div className="text-xs text-gray-500">Overdue (borrowed)</div>
          <div className="text-xl font-semibold">KES {Number(list.summary?.overdueAmount ?? 0).toLocaleString()}</div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          className={`px-3 py-1.5 rounded ${tab === 'borrowed' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          onClick={() => setTab('borrowed')}
        >
          Borrowed
        </button>
        <button
          className={`px-3 py-1.5 rounded ${tab === 'lent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`}
          onClick={() => setTab('lent')}
        >
          Lent
        </button>
      </div>

      {/* Lists */}
      <div className="space-y-3">
        {tab === 'borrowed' && (borrowed.length ? borrowed.map(l => renderLoanRow(l, false)) : <Card>No borrowed loans</Card>)}
        {tab === 'lent' && (lent.length ? lent.map(l => renderLoanRow(l, true)) : <Card>No lent loans</Card>)}
      </div>

      {/* Modals */}
      <LenderApprovalModal
        isOpen={approveOpen}
        onClose={() => { setApproveOpen(false); setSelectedLoan(null); }}
        loan={selectedLoan}
        onApproved={async () => { setApproveOpen(false); await reload(); showSuccess('Loan approved'); }}
      />
      <P2PLoanRequestWizard
        isOpen={requestOpen}
        onClose={() => setRequestOpen(false)}
        onSubmitted={async () => { setRequestOpen(false); await reload(); showSuccess('Loan request submitted'); }}
      />
    </div>
  );
}