import React, { useState } from 'react';
import { CreditCard, Search, DollarSign, ArrowUpRight, ArrowDownRight, User, Phone, CheckCircle2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateTime } from '../utils/formatters';
import confetti from 'canvas-confetti';

export const DebtsView: React.FC = () => {
  const { customers, suppliers, payCustomerDebt, paySupplierDebt, repairOrders } = useApp();

  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [searchQuery, setSearchQuery] = useState('');

  // Collect/Pay Modal
  const [modalType, setModalType] = useState<'collect_customer' | 'pay_supplier' | null>(null);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [amount, setAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const debtorCustomers = customers.filter((c) => c.debt > 0 && (
    !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery)
  ));

  const debtorSuppliers = suppliers.filter((s) => s.debt > 0 && (
    !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.phone.includes(searchQuery)
  ));

  const totalCustomerDebt = customers.reduce((sum, c) => sum + c.debt, 0);
  const totalSupplierDebt = suppliers.reduce((sum, s) => sum + s.debt, 0);

  const handleOpenModal = (type: 'collect_customer' | 'pay_supplier', entity: any) => {
    setModalType(type);
    setSelectedEntity(entity);
    setAmount(entity.debt);
    setNotes('');
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !selectedEntity) return;

    if (modalType === 'collect_customer') {
      payCustomerDebt(selectedEntity.id, Number(amount));
    } else {
      paySupplierDebt(selectedEntity.id, Number(amount));
    }

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setModalType(null);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <span>Quản Lý Công Nợ Khách Hàng & Nhà Cung Cấp</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi dòng tiền nợ phải thu từ khách sửa máy và nợ phải trả cho nhà cung ứng linh kiện
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('customer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'customer'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Khách nợ ({formatVND(totalCustomerDebt)})
          </button>
          <button
            onClick={() => setActiveTab('supplier')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'supplier'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nợ NCC ({formatVND(totalSupplierDebt)})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'customer' ? 'Tìm khách hàng đang nợ theo tên, SĐT...' : 'Tìm nhà cung cấp theo tên, SĐT...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Customer Debt Tab */}
      {activeTab === 'customer' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Địa chỉ</th>
                <th className="py-3.5 px-4 text-right">Tổng chi tiêu</th>
                <th className="py-3.5 px-4 text-right">Tiền còn nợ</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debtorCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1" />
                    Không có khách hàng nào đang nợ tiền!
                  </td>
                </tr>
              ) : (
                debtorCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{c.address || '---'}</td>
                    <td className="py-3 px-4 text-right text-slate-700 font-medium">{formatVND(c.totalSpent)}</td>
                    <td className="py-3 px-4 text-right font-black text-amber-600 text-sm">{formatVND(c.debt)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenModal('collect_customer', c)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                      >
                        Thu nợ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Supplier Debt Tab */}
      {activeTab === 'supplier' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Nhà cung cấp</th>
                <th className="py-3.5 px-4">Người liên hệ / SĐT</th>
                <th className="py-3.5 px-4">Địa chỉ</th>
                <th className="py-3.5 px-4 text-right">Số nợ cần trả</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {debtorSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    <CheckCircle2 className="w-8 h-8 text-purple-500 mx-auto mb-1" />
                    Đã thanh toán hết công nợ cho các nhà cung cấp!
                  </td>
                </tr>
              ) : (
                debtorSuppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-bold text-slate-800">{s.name}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <div>{s.contactPerson}</div>
                      <div className="font-mono text-slate-400">{s.phone}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{s.address}</td>
                    <td className="py-3 px-4 text-right font-black text-purple-600 text-sm">{formatVND(s.debt)}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleOpenModal('pay_supplier', s)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                      >
                        Trả nợ NCC
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Collect/Pay Modal */}
      {modalType && selectedEntity && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className={`px-5 py-4 text-white flex items-center justify-between ${modalType === 'collect_customer' ? 'bg-emerald-700' : 'bg-purple-700'}`}>
              <h3 className="font-bold text-sm">
                {modalType === 'collect_customer' ? 'Thu Nợ Khách Hàng' : 'Chi Trả Nợ Cho Nhà Cung Cấp'}
              </h3>
              <button onClick={() => setModalType(null)} className="p-1 text-white hover:opacity-80 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirm} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Đối tượng:</span>
                  <span className="font-bold text-slate-800">{selectedEntity.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Số nợ hiện tại:</span>
                  <span className="font-black text-red-600 text-sm">{formatVND(selectedEntity.debt)}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số tiền {modalType === 'collect_customer' ? 'thu vào' : 'chi trả'} (VND):
                </label>
                <input
                  type="number"
                  min={1000}
                  max={selectedEntity.debt}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-base font-black text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ghi chú giao dịch:</label>
                <input
                  type="text"
                  placeholder="vd: Khách chuyển khoản thanh toán nốt đơn cũ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalType(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 text-white font-bold rounded-xl shadow-xs cursor-pointer ${
                    modalType === 'collect_customer' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  Xác nhận giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
