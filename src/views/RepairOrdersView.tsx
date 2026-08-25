import React, { useState } from 'react';
import {
  Wrench,
  Search,
  Filter,
  Plus,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Flame,
  ShieldCheck,
  User,
  Phone,
  Tag,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatVND,
  formatDateTime,
  formatDate,
  repairStatusConfig,
  deviceTypeLabels,
  exportToCSV
} from '../utils/formatters';
import { DeviceType, RepairStatus } from '../types';

interface RepairOrdersViewProps {
  onOpenNewRepairModal: () => void;
  onOpenDetailModal: (orderId: string) => void;
  onOpenPrintModal: (orderId: string) => void;
}

export const RepairOrdersView: React.FC<RepairOrdersViewProps> = ({
  onOpenNewRepairModal,
  onOpenDetailModal,
  onOpenPrintModal,
}) => {
  const { repairOrders, users } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [selectedTech, setSelectedTech] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'urgency'>('date_desc');

  // Filter repair orders
  const filteredOrders = repairOrders.filter((order) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.code.toLowerCase().includes(query) ||
      order.customerName.toLowerCase().includes(query) ||
      order.customerPhone.includes(query) ||
      order.model.toLowerCase().includes(query) ||
      (order.serialNumber && order.serialNumber.toLowerCase().includes(query)) ||
      (order.reportedIssue && order.reportedIssue.toLowerCase().includes(query));

    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    const matchesDevice = selectedDevice === 'all' || order.deviceType === selectedDevice;
    const matchesTech = selectedTech === 'all' || order.assignedTechnicianId === selectedTech;

    return matchesSearch && matchesStatus && matchesDevice && matchesTech;
  });

  // Sort orders
  filteredOrders.sort((a, b) => {
    if (sortBy === 'date_desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'date_asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === 'amount_desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'urgency') {
      const uMap = { express: 3, urgent: 2, normal: 1 };
      return (uMap[b.urgency] || 0) - (uMap[a.urgency] || 0);
    }
    return 0;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Mã phiếu', 'Ngày tiếp nhận', 'Khách hàng', 'SĐT', 'Thiết bị', 'Model', 'Serial', 'Lỗi mô tả', 'KTV phụ trách', 'Trạng thái', 'Tổng tiền (VND)', 'Đã trả (VND)', 'Còn nợ (VND)', 'Bảo hành'];
    const rows = filteredOrders.map((o) => [
      o.code,
      formatDateTime(o.createdAt),
      o.customerName,
      o.customerPhone,
      deviceTypeLabels[o.deviceType] || o.deviceType,
      `${o.brand} ${o.model}`,
      o.serialNumber || '',
      o.reportedIssue,
      o.assignedTechnicianName || '',
      repairStatusConfig[o.status]?.label || o.status,
      o.totalAmount,
      o.paidAmount,
      o.remainingDebt,
      o.warrantyPeriod || ''
    ]);
    exportToCSV(`Danh_sach_don_sua_chua_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-600" />
            <span>Quản lý Đơn Sửa Chữa Thiết Bị</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {filteredOrders.length} / {repairOrders.length} phiếu
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý quy trình: Tiếp nhận → Đo đạc kiểm tra → Báo giá → Sửa chữa → Test tải → Giao máy & Bảo hành
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
            title="Xuất file Excel / CSV"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Xuất Excel</span>
          </button>

          <button
            onClick={onOpenNewRepairModal}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo phiếu sửa chữa mới</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        {/* Search input + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu (SR000125), SĐT, tên khách, model, serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <select
              value={selectedDevice}
              onChange={(e) => setSelectedDevice(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Tất cả loại thiết bị</option>
              <option value="laptop">Laptop / Notebook</option>
              <option value="vga">Card đồ họa (VGA / GPU)</option>
              <option value="mainboard">Bo mạch chủ (Mainboard)</option>
              <option value="pc">Máy tính PC để bàn</option>
              <option value="power_supply">Nguồn máy tính (PSU)</option>
              <option value="monitor">Màn hình LCD</option>
              <option value="macbook">MacBook / Apple</option>
            </select>
          </div>

          <div>
            <select
              value={selectedTech}
              onChange={(e) => setSelectedTech(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="all">Tất cả Kỹ thuật viên</option>
              {users.filter((u) => u.role === 'technician' || u.role === 'admin').map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-xs font-medium">
          <button
            onClick={() => setSelectedStatus('all')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all cursor-pointer ${
              selectedStatus === 'all'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả ({repairOrders.length})
          </button>

          {(Object.keys(repairStatusConfig) as RepairStatus[]).map((st) => {
            const count = repairOrders.filter((o) => o.status === st).length;
            const cfg = repairStatusConfig[st];
            const isSelected = selectedStatus === st;
            return (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? `${cfg.bg} ${cfg.color} font-bold ring-2 ring-blue-500 border border-transparent`
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{cfg.label}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-200 text-slate-700'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Mã phiếu / Ngày</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Thiết bị & Tình trạng</th>
                <th className="py-3.5 px-4">Kỹ thuật viên</th>
                <th className="py-3.5 px-4">Hẹn trả</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Tổng tiền</th>
                <th className="py-3.5 px-4 text-right">Còn nợ</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Wrench className="w-8 h-8 text-slate-300 stroke-1" />
                      <span>Không có phiếu sửa chữa nào khớp với bộ lọc hiện tại.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusCfg = repairStatusConfig[order.status] || {
                    label: order.status,
                    color: 'text-slate-700',
                    bg: 'bg-slate-100',
                    border: 'border-slate-300'
                  };

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                      onClick={() => onOpenDetailModal(order.id)}
                    >
                      {/* Code & Received Date */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-blue-600 group-hover:text-blue-800 text-sm">
                          {order.code}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {order.urgency === 'urgent' && (
                          <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            Gấp
                          </span>
                        )}
                      </td>

                      {/* Customer Info */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{order.customerName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{order.customerPhone}</span>
                        </div>
                      </td>

                      {/* Device & Issue */}
                      <td className="py-3 px-4 max-w-[240px]">
                        <div className="font-semibold text-slate-800 truncate flex items-center gap-1.5">
                          <span className="px-1.5 py-0.2 text-[10px] font-medium bg-slate-100 text-slate-600 rounded">
                            {deviceTypeLabels[order.deviceType]?.split(' ')[0] || 'Thiết bị'}
                          </span>
                          <span className="truncate">{order.brand} {order.model}</span>
                        </div>
                        <div className="text-[11px] text-slate-600 truncate mt-1" title={order.reportedIssue}>
                          Lỗi: <span className="text-slate-800 font-medium">{order.reportedIssue}</span>
                        </div>
                        {order.serialNumber && (
                          <div className="text-[10px] text-slate-400 truncate">
                            S/N: {order.serialNumber}
                          </div>
                        )}
                      </td>

                      {/* Technician */}
                      <td className="py-3 px-4">
                        {order.assignedTechnicianName ? (
                          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold flex items-center justify-center">
                              {order.assignedTechnicianName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[130px]">{order.assignedTechnicianName.split(' ')[0]} {order.assignedTechnicianName.split(' ')[1]}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa chỉ định</span>
                        )}
                      </td>

                      {/* Appointment */}
                      <td className="py-3 px-4 text-slate-600">
                        <div className="font-medium text-slate-700">{formatDate(order.appointmentDate)}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          <span>{statusCfg.label}</span>
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        {formatVND(order.totalAmount)}
                      </td>

                      {/* Remaining Debt */}
                      <td className="py-3 px-4 text-right">
                        {order.remainingDebt > 0 ? (
                          <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {formatVND(order.remainingDebt)}
                          </span>
                        ) : (
                          <span className="text-emerald-600 font-medium text-[11px] flex items-center justify-end gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Đủ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onOpenDetailModal(order.id)}
                            className="p-1.5 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                            title="Xem chi tiết & Khám máy"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onOpenPrintModal(order.id)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                            title="In phiếu / tem máy"
                          >
                            <Printer className="w-4 h-4" />
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
      </div>
    </div>
  );
};
