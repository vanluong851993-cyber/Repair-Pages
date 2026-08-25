import React, { useState } from 'react';
import { User, Phone, MapPin, Search, Plus, FileSpreadsheet, CreditCard, History, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDate, exportToCSV } from '../utils/formatters';
import { Customer } from '../types';

export const CustomersView: React.FC<{ onOpenDetailModal: (orderId: string) => void }> = ({ onOpenDetailModal }) => {
  const { customers, repairOrders, createCustomer, updateCustomer } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || c.name.toLowerCase().includes(q) || c.phone.includes(q) || (c.address && c.address.toLowerCase().includes(q));
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    createCustomer({ name, phone, address, notes });
    setIsAddModalOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setNotes('');
  };

  const handleExport = () => {
    const headers = ['Tên khách hàng', 'Số điện thoại', 'Địa chỉ', 'Tổng chi tiêu', 'Tiền nợ', 'Ghi chú'];
    const rows = filteredCustomers.map((c) => [c.name, c.phone, c.address || '', c.totalSpent, c.debt, c.notes || '']);
    exportToCSV(`Danh_sach_khach_hang_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <span>Quản Lý Khách Hàng (CRM)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {filteredCustomers.length} khách hàng
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Lưu trữ lịch sử sửa chữa, số điện thoại, công nợ và tích điểm khách hàng thân thiết
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Xuất Excel</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm khách hàng</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm khách hàng theo tên, số điện thoại, địa chỉ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Customer table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <th className="py-3.5 px-4">Tên khách hàng</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Địa chỉ</th>
              <th className="py-3.5 px-4 text-right">Tổng chi tiêu</th>
              <th className="py-3.5 px-4 text-right">Nợ hiện tại</th>
              <th className="py-3.5 px-4 text-center">Lịch sử máy</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredCustomers.map((c) => {
              const custOrders = repairOrders.filter((o) => o.customerId === c.id || o.customerPhone === c.phone);
              return (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{c.phone}</td>
                  <td className="py-3 px-4 text-slate-500">{c.address || '---'}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-800">{formatVND(c.totalSpent)}</td>
                  <td className="py-3 px-4 text-right font-bold text-amber-600">
                    {c.debt > 0 ? formatVND(c.debt) : '0 ₫'}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={() => setSelectedCustomer(c)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
                    >
                      {custOrders.length} lần sửa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Customer History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Lịch Sử Sửa Chữa: {selectedCustomer.name}</h3>
                <p className="text-xs text-slate-400">SĐT: {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setSelectedCustomer(null)} className="p-1 text-white hover:opacity-80 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {repairOrders
                .filter((o) => o.customerId === selectedCustomer.id || o.customerPhone === selectedCustomer.phone)
                .map((o) => (
                  <div
                    key={o.id}
                    onClick={() => {
                      setSelectedCustomer(null);
                      onOpenDetailModal(o.id);
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all cursor-pointer text-xs space-y-1.5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-blue-600">#{o.code}</span>
                      <span className="text-[11px] text-slate-400">{formatDate(o.createdAt)}</span>
                    </div>
                    <div className="font-bold text-slate-800">{o.brand} {o.model}</div>
                    <div className="text-slate-500 text-[11px]">Lỗi: {o.reportedIssue}</div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                      <span className="text-slate-400">Trạng thái: <strong>{o.status}</strong></span>
                      <span className="font-bold text-slate-900">{formatVND(o.totalAmount)}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-blue-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Thêm Khách Hàng Mới</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-white hover:opacity-80 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Họ và tên khách hàng *</label>
                <input
                  type="text"
                  required
                  placeholder="vd: Nguyễn Văn B"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số điện thoại *</label>
                <input
                  type="text"
                  required
                  placeholder="vd: 0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ:</label>
                <input
                  type="text"
                  placeholder="vd: Cầu Giấy, Hà Nội"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Tạo khách hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
