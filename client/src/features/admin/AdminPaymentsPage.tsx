import React, { useEffect, useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  Receipt,
  Search,
  Filter,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Users,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  X,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api.js';
import {
  IPaymentRecord,
  ICourseFee,
  IReceiptData,
  PaymentStatus,
  PaymentMethod,
} from '../../types/index.js';
import { PageHeader } from '../../components/ui/PageHeader.js';
import { StatCard } from '../../components/ui/StatCard.js';
import { StatusBadge } from '../../components/ui/StatusBadge.js';
import { ReceiptModal } from '../../components/payments/ReceiptModal.js';
import { formatINR, calculateGST } from '../../utils/currency.js';
import { downloadReceiptPdf } from '../../utils/pdfGenerator.js';

interface IAdminSummary {
  totalRevenueRecorded: number;
  totalAmountPaid: number;
  totalPending: number;
  totalGSTRecorded: number;
  numberPayments: number;
  numberStudentsWithOutstandingBalance: number;
  courseFeeConfig?: ICourseFee;
}

export const AdminPaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<IPaymentRecord[]>([]);
  const [summary, setSummary] = useState<IAdminSummary | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [selectedReceipt, setSelectedReceipt] = useState<IReceiptData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFeeConfigModal, setShowFeeConfigModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<IPaymentRecord | null>(null);

  // Form State: Create Payment
  const [formStudentId, setFormStudentId] = useState('');
  const [formDescription, setFormDescription] = useState('Course Fee - Tuition');
  const [formInstallment, setFormInstallment] = useState(1);
  const [formBaseAmount, setFormBaseAmount] = useState<number>(50000);
  const [formGstRate, setFormGstRate] = useState<number>(18);
  const [formAmountPaid, setFormAmountPaid] = useState<number>(59000);
  const [formMethod, setFormMethod] = useState<PaymentMethod>('Online');
  const [formTxnId, setFormTxnId] = useState('');
  const [formPaymentDate, setFormPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [formStatus, setFormStatus] = useState<PaymentStatus>('Paid');
  const [formNotes, setFormNotes] = useState('');

  // Form State: Course Fee Config
  const [feeBase, setFeeBase] = useState<number>(100000);
  const [feeGst, setFeeGst] = useState<number>(18);
  const [feeTitle, setFeeTitle] = useState('6-Month Job-Ready Training Program');

  useEffect(() => {
    fetchSummary();
    fetchStudentsList();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [search, filterStatus, filterMethod, page]);

  const fetchSummary = async () => {
    try {
      const res = await api.get('/admin/payments/summary');
      if (res.data?.success) {
        setSummary(res.data.data);
        if (res.data.data.courseFeeConfig) {
          setFeeBase(res.data.data.courseFeeConfig.baseFee);
          setFeeGst(res.data.data.courseFeeConfig.gstRate);
          setFeeTitle(res.data.data.courseFeeConfig.programTitle);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin summary:', err);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const res = await api.get('/students');
      if (res.data?.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
    }
  };

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterMethod !== 'all') params.append('paymentMethod', filterMethod);
      params.append('page', String(page));
      params.append('limit', '10');

      const res = await api.get(`/admin/payments?${params.toString()}`);
      if (res.data?.success) {
        setPayments(res.data.data);
        setTotalPages(res.data.pagination?.pages || 1);
        setTotalCount(res.data.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-calculate on Base Amount change in create form
  const handleBaseAmountChange = (val: number) => {
    setFormBaseAmount(val);
    const calc = calculateGST(val, formGstRate);
    setFormAmountPaid(calc.totalAmount);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formStudentId) {
      alert('Please select a student.');
      return;
    }

    try {
      const res = await api.post('/admin/payments', {
        studentId: formStudentId,
        description: formDescription,
        installmentNumber: formInstallment,
        baseAmount: formBaseAmount,
        gstRate: formGstRate,
        amountPaid: formAmountPaid,
        paymentMethod: formMethod,
        transactionId: formTxnId,
        paymentDate: formPaymentDate,
        status: formStatus,
        notes: formNotes,
      });

      if (res.data?.success) {
        alert('Payment record registered and receipt generated successfully!');
        setShowCreateModal(false);
        fetchPayments();
        fetchSummary();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create payment');
    }
  };

  const handleEditClick = (p: IPaymentRecord) => {
    setEditingPayment(p);
    setShowEditModal(true);
  };

  const handleUpdatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    try {
      const res = await api.put(`/admin/payments/${editingPayment._id}`, {
        description: editingPayment.description,
        installmentNumber: editingPayment.installmentNumber,
        baseAmount: editingPayment.baseAmount,
        gstRate: editingPayment.gstRate,
        amountPaid: editingPayment.amountPaid,
        paymentMethod: editingPayment.paymentMethod,
        transactionId: editingPayment.transactionId,
        status: editingPayment.status,
        notes: editingPayment.notes,
      });

      if (res.data?.success) {
        alert('Payment updated successfully!');
        setShowEditModal(false);
        setEditingPayment(null);
        fetchPayments();
        fetchSummary();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update payment');
    }
  };

  const handleDeletePayment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this payment record? This action will be recorded in Audit Logs.')) {
      return;
    }

    try {
      const res = await api.delete(`/admin/payments/${id}`);
      if (res.data?.success) {
        alert('Payment deleted.');
        fetchPayments();
        fetchSummary();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete payment');
    }
  };

  const handleUpdateCourseFee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/admin/course-fees', {
        baseFee: feeBase,
        gstRate: feeGst,
        programTitle: feeTitle,
      });

      if (res.data?.success) {
        alert('Course fee structure updated successfully!');
        setShowFeeConfigModal(false);
        fetchSummary();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update course fee');
    }
  };

  const handleViewReceipt = (p: IPaymentRecord) => {
    const studentObj = p.studentId as any;
    const receiptData: IReceiptData = {
      payment: p,
      student: {
        name: studentObj?.name || 'Candidate',
        email: studentObj?.email || '',
        phone: p.studentProfile?.phone || '+91 98765 43210',
        rollNumber: p.studentProfile?.rollNumber || 'CEGS-2025-0182',
        batchCode: p.batchId?.code || 'CEGS-FGT-OCT15',
        trackName: p.trackId?.name || 'Full Stack Development',
        programTitle: '6-Month Job-Ready Training Program',
      },
      verificationUrl: `http://localhost:5173/verify-receipt/${p.receiptNumber}`,
    };
    setSelectedReceipt(receiptData);
  };

  const handleExportCSV = () => {
    if (payments.length === 0) {
      alert('No payments to export.');
      return;
    }

    const headers = [
      'Payment ID',
      'Receipt Number',
      'Student Name',
      'Email',
      'Description',
      'Base Amount',
      'GST Amount',
      'Total Amount',
      'Amount Paid',
      'Balance',
      'Method',
      'Transaction ID',
      'Date',
      'Status',
    ];

    const rows = payments.map((p) => [
      p.paymentId,
      p.receiptNumber,
      (p.studentId as any)?.name || '',
      (p.studentId as any)?.email || '',
      `"${p.description}"`,
      p.baseAmount,
      p.gstAmount,
      p.totalAmount,
      p.amountPaid,
      p.balanceAmount,
      p.paymentMethod,
      p.transactionId || '',
      new Date(p.paymentDate).toISOString().split('T')[0],
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CEGS-Payments-Report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calcCreate = calculateGST(formBaseAmount, formGstRate);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* 1. Page Header */}
      <PageHeader
        title="Payment & Revenue Central"
        subtitle="Manage candidate course fees, 18% GST tax invoices, installment tracking, and audit-logged transactions."
        badge={<StatusBadge label={`${totalCount} Total Payments`} variant="teal" />}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFeeConfigModal(true)}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm bg-white"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Configure Pricing</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm bg-white"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Payment</span>
            </button>
          </div>
        }
      />

      {/* 2. Admin Summary Dashboard Cards (Section 17 Spec) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        <StatCard
          label="Total Revenue"
          value={formatINR(summary?.totalRevenueRecorded || 0)}
          icon={TrendingUp}
          subtext="Invoiced course fee revenue"
        />

        <StatCard
          label="Total Paid"
          value={formatINR(summary?.totalAmountPaid || 0)}
          icon={IndianRupee}
          subtext="Settled receipts received"
        />

        <StatCard
          label="Outstanding Balance"
          value={formatINR(summary?.totalPending || 0)}
          icon={Clock}
          subtext="Pending fee collections"
        />

        <StatCard
          label="GST Recorded (18%)"
          value={formatINR(summary?.totalGSTRecorded || 0)}
          icon={CreditCard}
          subtext="Statutory tax ledger"
        />

        <StatCard
          label="Total Receipts"
          value={String(summary?.numberPayments || 0)}
          icon={Receipt}
          subtext="Issued official receipts"
        />

        <StatCard
          label="Unsettled Students"
          value={String(summary?.numberStudentsWithOutstandingBalance || 0)}
          icon={Users}
          subtext="Scholars with balance due"
        />
      </div>

      {/* 3. Search & Filter Bar (Section 16 Spec) */}
      <div className="card-premium p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by student name, roll ID, payment ID, or txn ref..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Refunded">Refunded</option>
          </select>

          <select
            value={filterMethod}
            onChange={(e) => {
              setFilterMethod(e.target.value);
              setPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none"
          >
            <option value="all">All Payment Methods</option>
            <option value="Online">Online</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      {/* 4. Payment Data Table (Section 16 Spec) */}
      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold border-b border-slate-100">
              <tr>
                <th className="py-3.5 px-5">Receipt & Payment ID</th>
                <th className="py-3.5 px-5">Student / Scholar</th>
                <th className="py-3.5 px-5">Fee Description</th>
                <th className="py-3.5 px-5 text-right">Base Amount</th>
                <th className="py-3.5 px-5 text-right">GST (18%)</th>
                <th className="py-3.5 px-5 text-right">Total Amount</th>
                <th className="py-3.5 px-5 text-right">Paid</th>
                <th className="py-3.5 px-5 text-right">Balance</th>
                <th className="py-3.5 px-5 text-center">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <div className="w-8 h-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin mx-auto mb-2" />
                    <span>Loading payment registry...</span>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    No payment records found matching your filters.
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const studentObj = p.studentId as any;
                  return (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-5">
                        <span className="font-mono font-extrabold text-slate-900 block">
                          {p.receiptNumber}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.paymentId} • {p.paymentMethod}
                        </span>
                      </td>

                      <td className="py-3.5 px-5">
                        <p className="font-extrabold text-slate-900">{studentObj?.name || 'Candidate'}</p>
                        <p className="text-[11px] text-slate-400">{studentObj?.email}</p>
                      </td>

                      <td className="py-3.5 px-5">
                        <p className="font-bold text-slate-800">{p.description}</p>
                        {p.transactionId && (
                          <p className="text-[10px] text-slate-400 font-mono">
                            Txn: {p.transactionId}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-5 text-right font-medium text-slate-600">
                        {formatINR(p.baseAmount)}
                      </td>

                      <td className="py-3.5 px-5 text-right font-medium text-slate-600">
                        {formatINR(p.gstAmount)}
                      </td>

                      <td className="py-3.5 px-5 text-right font-extrabold text-slate-900">
                        {formatINR(p.totalAmount)}
                      </td>

                      <td className="py-3.5 px-5 text-right font-extrabold text-emerald-700">
                        {formatINR(p.amountPaid)}
                      </td>

                      <td className="py-3.5 px-5 text-right font-extrabold">
                        <span className={p.balanceAmount > 0 ? 'text-rose-600' : 'text-slate-400'}>
                          {formatINR(p.balanceAmount)}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-center">
                        <StatusBadge
                          label={p.status}
                          variant={
                            p.status === 'Paid'
                              ? 'green'
                              : p.status === 'Partially Paid'
                              ? 'orange'
                              : p.status === 'Cancelled'
                              ? 'red'
                              : 'neutral'
                          }
                          size="sm"
                        />
                      </td>

                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewReceipt(p)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="View Receipt"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleEditClick(p)}
                            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
                            title="Edit Payment"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePayment(p._id)}
                            className="p-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-600"
                            title="Delete Payment"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing Page {page} of {totalPages} ({totalCount} Total Transactions)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. RECORD PAYMENT MODAL (SECTION 16 SPEC) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Record Candidate Payment</h3>
                <p className="text-xs text-slate-500">
                  Calculates 18% GST and automatically generates official verifiable tax receipt
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Select Candidate / Student *</label>
                <select
                  required
                  value={formStudentId}
                  onChange={(e) => setFormStudentId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-medium"
                >
                  <option value="">-- Choose Candidate --</option>
                  {students.map((s) => (
                    <option key={s._id} value={s.user?._id || s.user}>
                      {s.user?.name} ({s.user?.email}) • Roll: {s.rollNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fee Description *</label>
                  <input
                    type="text"
                    required
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="e.g. Course Fee - Installment 1"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Installment Number</label>
                  <input
                    type="number"
                    min={1}
                    value={formInstallment}
                    onChange={(e) => setFormInstallment(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500 font-mono"
                  />
                </div>
              </div>

              {/* GST CALCULATION PREVIEW BOX */}
              <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 space-y-3">
                <span className="font-extrabold text-brand-900 block text-[11px] uppercase tracking-wider">
                  Automated GST & Financial Breakdown
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Base Course Fee (₹) *</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formBaseAmount}
                      onChange={(e) => handleBaseAmountChange(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                    <input
                      type="number"
                      value={formGstRate}
                      disabled
                      className="w-full p-2 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-600 font-bold cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-brand-200/50 grid grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Base Amount:</span>
                    <strong className="text-slate-900">{formatINR(calcCreate.baseAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">GST @ 18%:</span>
                    <strong className="text-slate-900">{formatINR(calcCreate.gstAmount)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Total Payable:</span>
                    <strong className="text-brand-700">{formatINR(calcCreate.totalAmount)}</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount Paid (₹) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formAmountPaid}
                    onChange={(e) => setFormAmountPaid(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 focus:outline-none focus:border-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Balance: {formatINR(Math.max(0, calcCreate.totalAmount - formAmountPaid))}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  >
                    <option value="Online">Online / Net Banking</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Transaction Ref ID</label>
                  <input
                    type="text"
                    value={formTxnId}
                    onChange={(e) => setFormTxnId(e.target.value)}
                    placeholder="e.g. TXN-HDFC-91829"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={formPaymentDate}
                    onChange={(e) => setFormPaymentDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Internal Audit Notes</label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Cleared via corporate ICICI collection account."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. EDIT PAYMENT MODAL */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit Payment Record</h3>
                <p className="text-xs text-slate-500 font-mono">
                  {editingPayment.paymentId} • {editingPayment.receiptNumber}
                </p>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdatePayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <input
                  type="text"
                  value={editingPayment.description}
                  onChange={(e) =>
                    setEditingPayment({ ...editingPayment, description: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Base Amount (₹)</label>
                  <input
                    type="number"
                    value={editingPayment.baseAmount}
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        baseAmount: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Amount Paid (₹)</label>
                  <input
                    type="number"
                    value={editingPayment.amountPaid}
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        amountPaid: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Status Override</label>
                  <select
                    value={editingPayment.status}
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        status: e.target.value as PaymentStatus,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={editingPayment.paymentMethod}
                    onChange={(e) =>
                      setEditingPayment({
                        ...editingPayment,
                        paymentMethod: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Online">Online</option>
                    <option value="UPI">UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Card">Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Transaction Ref ID</label>
                <input
                  type="text"
                  value={editingPayment.transactionId || ''}
                  onChange={(e) =>
                    setEditingPayment({ ...editingPayment, transactionId: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editingPayment.notes || ''}
                  onChange={(e) =>
                    setEditingPayment({ ...editingPayment, notes: e.target.value })
                  }
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. CONFIGURE COURSE FEE MODAL (SECTION 20 SPEC) */}
      {showFeeConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Configure Program Pricing</h3>
                <p className="text-xs text-slate-500">
                  Update baseline tuition fee and statutory GST parameters
                </p>
              </div>
              <button
                onClick={() => setShowFeeConfigModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourseFee} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Program Title</label>
                <input
                  type="text"
                  required
                  value={feeTitle}
                  onChange={(e) => setFeeTitle(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Base Course Fee (₹)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={feeBase}
                  onChange={(e) => setFeeBase(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-base"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">GST Rate (%)</label>
                <input
                  type="number"
                  required
                  value={feeGst}
                  onChange={(e) => setFeeGst(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold"
                />
              </div>

              {/* Dynamic Calculation preview */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-500">
                  <span>Base Fee:</span>
                  <span>{formatINR(feeBase)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>GST ({feeGst}%):</span>
                  <span>{formatINR((feeBase * feeGst) / 100)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1 flex justify-between font-bold text-slate-900">
                  <span>Total Payable:</span>
                  <span className="text-brand-700">
                    {formatINR(feeBase + (feeBase * feeGst) / 100)}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFeeConfigModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold shadow-sm"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official CEGS Receipt Modal */}
      <ReceiptModal receipt={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
    </div>
  );
};
