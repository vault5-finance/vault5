import React, { useEffect, useMemo, useState } from 'react';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const Section = ({ title, children, right, icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50',
    gray: 'border-gray-200 bg-gray-50'
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border-l-4 ${colorClasses[color]} p-6`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {icon && <div className="text-2xl">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        {right}
      </div>
      {children}
    </div>
  );
};

const Pill = ({ children, color = 'blue' }) => {
  const map = {
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  return <span className={`px-2 py-1 rounded-full text-xs font-medium ${map[color] || map.gray}`}>{children}</span>;
};

const formatKes = (n) => `KES ${Number(n || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const Countdown = ({ ms }) => {
  const [timeLeft, setTimeLeft] = useState(ms || 0);
  useEffect(() => {
    setTimeLeft(ms || 0);
    if (!ms || ms <= 0) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1000)), 1000);
    return () => clearInterval(id);
  }, [ms]);
  const d = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const h = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const m = Math.floor((timeLeft / (1000 * 60)) % 60);
  const s = Math.floor((timeLeft / 1000) % 60);
  if (timeLeft <= 0) return <span className="text-green-700 font-medium">Eligible now</span>;
  return (
    <span className="text-gray-700">{d}d {h}h {m}m {s}s</span>
  );
};

const ComplianceCenter = () => {
  const { showError, showSuccess, showInfo } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null);
  const [kycList, setKycList] = useState([]);
  const [submittingKyc, setSubmittingKyc] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // KYC form state
  const [kycForm, setKycForm] = useState({
    levelRequested: 'Tier1',
    documents: [
      { type: 'nat_id', url: '' },
      { type: 'selfie', url: '' },
    ],
  });

  // Payout form state
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    currency: 'KES',
    destination: {
      bankName: '',
      accountName: '',
      accountNumber: '',
      bankCode: '',
    }
  });

  const load = async () => {
    setLoading(true);
    try {
      const [st, kl] = await Promise.all([
        api.get('/api/compliance/status'),
        api.get('/api/compliance/kyc'),
      ]);
      setStatus(st.data?.data || null);
      setKycList(kl.data?.data || []);
    } catch (e) {
      console.error('Compliance load error', e);
      showError(e.response?.data?.message || 'Failed to load compliance status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onKycDocChange = (idx, field, value) => {
    setKycForm((prev) => {
      const docs = [...prev.documents];
      docs[idx] = { ...docs[idx], [field]: value };
      return { ...prev, documents: docs };
    });
  };

  const addKycDoc = () => {
    setKycForm((prev) => ({ ...prev, documents: [...prev.documents, { type: 'other', url: '' }] }));
  };

  const submitKyc = async (e) => {
    e.preventDefault();
    if (!kycForm.documents.length || kycForm.documents.some(d => !d.url || !d.type)) {
      showError('Please add at least one document with a valid URL and type.');
      return;
    }
    setSubmittingKyc(true);
    try {
      await api.post('/api/compliance/kyc', kycForm);
      showSuccess('KYC submitted for review');
      setKycForm({
        levelRequested: 'Tier1',
        documents: [{ type: 'nat_id', url: '' }, { type: 'selfie', url: '' }],
      });
      await load();
    } catch (e) {
      console.error('Submit KYC error', e);
      showError(e.response?.data?.message || 'Failed to submit KYC');
    } finally {
      setSubmittingKyc(false);
    }
  };

  const submitPayout = async (e) => {
    e.preventDefault();
    if (!(Number(payoutForm.amount) > 0)) {
      showError('Enter a valid amount');
      return;
    }
    if (!payoutForm.destination.bankName || !payoutForm.destination.accountName || !payoutForm.destination.accountNumber) {
      showError('Enter complete bank destination details');
      return;
    }
    if (!status?.payoutEligible) {
      showInfo('Not eligible for payout yet. Please check the countdown and bank verification.');
      return;
    }
    setSubmittingPayout(true);
    try {
      await api.post('/api/compliance/payouts', payoutForm);
      showSuccess('Payout request submitted for review');
      setPayoutForm({
        amount: '',
        currency: 'KES',
        destination: { bankName: '', accountName: '', accountNumber: '', bankCode: '' }
      });
      await load();
    } catch (e) {
      console.error('Submit payout error', e);
      showError(e.response?.data?.message || 'Failed to request payout');
    } finally {
      setSubmittingPayout(false);
    }
  };

  const limitationPill = useMemo(() => {
    const st = status?.limitation?.status || 'none';
    if (st === 'none') return <Pill color="green">No Limitation</Pill>;
    if (st === 'temporary_30') return <Pill color="yellow">Temporarily Limited (30d)</Pill>;
    if (st === 'temporary_180') return <Pill color="red">Limited (180d Reserve)</Pill>;
    if (st === 'permanent') return <Pill color="red">Permanently Limited</Pill>;
    return <Pill color="gray">{st}</Pill>;
  }, [status]);

  if (loading) {
    return (
      <div className="p-8">
        <div>Loading Compliance Center...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Compliance Center</h1>
              <p className="text-gray-600 mt-1">Manage your account limitations, KYC verification, and payout requests</p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{status?.kycLevel || 'Tier0'}</div>
              <div className="text-sm text-gray-600">KYC Level</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{status?.reserves?.count || 0}</div>
              <div className="text-sm text-gray-600">Active Reserves</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{formatKes(status?.reserves?.totalAmount || 0)}</div>
              <div className="text-sm text-gray-600">Reserved Amount</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {status?.payoutEligible ? '✅' : '⏳'}
              </div>
              <div className="text-sm text-gray-600">Payout Status</div>
            </div>
          </div>
        </div>

        <Section
          title="Account Limitation Status"
          icon="🚫"
          color={status?.limitation?.status === 'none' ? 'green' : 'red'}
          right={<div className="flex items-center gap-2">{limitationPill}</div>}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600">Reason</div>
              <div className="text-gray-900">{status?.limitation?.reason || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Countdown</div>
              <div className="text-gray-900">
                {['temporary_30', 'temporary_180'].includes(status?.limitation?.status)
                  ? <Countdown ms={status?.limitation?.countdownMs} />
                  : <span className="text-gray-700">N/A</span>}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Reserve Release</div>
              <div className="text-gray-900">
                {status?.limitation?.reserveReleaseAt
                  ? new Date(status.limitation.reserveReleaseAt).toLocaleString()
                  : '—'}
              </div>
            </div>
          </div>
        </Section>

      <Section title="Reserves">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
          <div>
            <div className="text-sm text-gray-600">Active Holds</div>
            <div className="text-gray-900">{status?.reserves?.count || 0}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Total Reserved</div>
            <div className="text-gray-900">{formatKes(status?.reserves?.totalAmount || 0)}</div>
          </div>
          <div>
            <div className="text-sm text-gray-600">Payout Eligibility</div>
            <div className="text-gray-900">{status?.payoutEligible ? <Pill color="green">Eligible</Pill> : <Pill>Not Yet</Pill>}</div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Currency</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Release At</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {(status?.reserves?.items || []).map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{formatKes(r.amount)}</td>
                  <td className="px-4 py-2">{r.currency}</td>
                  <td className="px-4 py-2">{r.releaseAt ? new Date(r.releaseAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-2"><Pill color={r.status === 'active' ? 'yellow' : 'green'}>{r.status}</Pill></td>
                </tr>
              ))}
              {(status?.reserves?.items || []).length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-3 text-gray-500 text-sm">No active reserves</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Submit KYC">
          <form onSubmit={submitKyc} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Requested</label>
              <select
                className="w-full p-2 border rounded-lg"
                value={kycForm.levelRequested}
                onChange={(e) => setKycForm((prev) => ({ ...prev, levelRequested: e.target.value }))}
              >
                <option value="Tier1">Tier1 (Basic)</option>
                <option value="Tier2">Tier2 (Full)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-700">Documents</label>
                <button
                  type="button"
                  onClick={addKycDoc}
                  className="px-3 py-1 rounded border text-sm hover:bg-gray-50"
                >
                  Add Document
                </button>
              </div>
              {kycForm.documents.map((doc, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <select
                    className="p-2 border rounded-lg"
                    value={doc.type}
                    onChange={(e) => onKycDocChange(idx, 'type', e.target.value)}
                  >
                    <option value="nat_id">National ID</option>
                    <option value="passport">Passport</option>
                    <option value="utility_bill">Utility Bill</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="selfie">Selfie</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="url"
                    placeholder="https://files.example.com/your-doc.pdf"
                    value={doc.url}
                    onChange={(e) => onKycDocChange(idx, 'url', e.target.value)}
                    className="p-2 border rounded-lg col-span-2"
                    required
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submittingKyc}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {submittingKyc ? 'Submitting...' : 'Submit KYC'}
            </button>
          </form>

          <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2">Your KYC Requests</h3>
            <div className="space-y-2">
              {kycList.length === 0 && <div className="text-gray-600 text-sm">No KYC requests yet.</div>}
              {kycList.map((k) => (
                <div key={k._id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="text-sm">Level: <span className="font-medium">{k.levelRequested}</span></div>
                    <div className="text-xs text-gray-600">{new Date(k.createdAt).toLocaleString()}</div>
                  </div>
                  <Pill color={k.status === 'approved' ? 'green' : k.status === 'rejected' ? 'red' : k.status === 'more_info' ? 'yellow' : 'blue'}>
                    {k.status}
                  </Pill>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Request Payout (Post-180 day Reserve)">
          <form onSubmit={submitPayout} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={payoutForm.amount}
                onChange={(e) => setPayoutForm((p) => ({ ...p, amount: e.target.value }))}
                className="w-full p-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={payoutForm.destination.bankName}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, bankName: e.target.value } }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Equity, KCB, DTB..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                <input
                  type="text"
                  value={payoutForm.destination.accountName}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, accountName: e.target.value } }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={payoutForm.destination.accountNumber}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, accountNumber: e.target.value } }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bank Code (optional)</label>
                <input
                  type="text"
                  value={payoutForm.destination.bankCode}
                  onChange={(e) => setPayoutForm((p) => ({ ...p, destination: { ...p.destination, bankCode: e.target.value } }))}
                  className="w-full p-2 border rounded-lg"
                  placeholder="SWIFT/Branch"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submittingPayout}
              className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submittingPayout ? 'Submitting...' : 'Submit Payout Request'}
            </button>
            {!status?.payoutEligible && (
              <p className="text-xs text-gray-500 mt-1">
                Payouts are only allowed after the reserve release time and to a verified bank.
              </p>
            )}
          </form>
        </Section>
        </div>
      </div>
    </div>
  );
};

export default ComplianceCenter;