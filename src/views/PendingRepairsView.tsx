import React from 'react';
import { Clock, AlertTriangle, Flame, Wrench, User, Phone, CheckCircle2, Eye, Printer, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDate, formatDateTime, repairStatusConfig, deviceTypeLabels } from '../utils/formatters';

interface PendingRepairsViewProps {
  onOpenDetailModal: (orderId: string) => void;
  onOpenPrintModal: (orderId: string) => void;
}

export const PendingRepairsView: React.FC<PendingRepairsViewProps> = ({ onOpenDetailModal, onOpenPrintModal }) => {
  const { repairOrders } = useApp();

  // Filter orders that need technician attention (Tiếp nhận, Chờ kiểm tra, Đang kiểm tra, Báo giá, Đang sửa, Chờ linh kiện)
  const pendingOrders = repairOrders.filter((o) =>
    ['tiep_nhan', 'cho_kiem_tra', 'dang_kiem_tra', 'bao_gia', 'cho_khach_duyet', 'dang_sua', 'cho_linh_kien'].includes(o.status)
  );

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <span>Khách Hàng Cần Sửa (Hàng Đang Chờ Kỹ Thuật Xử Lý)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
              {pendingOrders.length} máy
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách các thiết bị đang trong quy trình kiểm tra, báo giá và sửa chữa cần hoàn thành đúng hạn hẹn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingOrders.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700">Tuyệt vời! Không có máy nào đang tồn đọng.</div>
            <p className="text-xs text-slate-400 mt-1">Toàn bộ thiết bị đã được sửa xong hoặc bàn giao cho khách.</p>
          </div>
        ) : (
          pendingOrders.map((order) => {
            const isUrgent = order.urgency === 'urgent' || order.urgency === 'express';
            const statusCfg = repairStatusConfig[order.status];

            // Check if deadline is approaching
            const appointTime = new Date(order.appointmentDate).getTime();
            const now = new Date().getTime();
            const hoursLeft = Math.round((appointTime - now) / (1000 * 60 * 60));
            const isNearOverdue = hoursLeft < 12;

            return (
              <div
                key={order.id}
                onClick={() => onOpenDetailModal(order.id)}
                className={`bg-white rounded-2xl border p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between ${
                  isUrgent
                    ? 'border-red-300 ring-1 ring-red-200'
                    : isNearOverdue
                    ? 'border-amber-300'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-blue-600 text-sm">#{order.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">
                    {order.brand} {order.model}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{order.customerName} - {order.customerPhone}</span>
                  </div>

                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-500 block text-[10px] uppercase">Mô tả lỗi:</span>
                    <p className="line-clamp-2 mt-0.5">{order.reportedIssue}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">KTV phụ trách:</span>
                    <span className="font-bold text-slate-800">
                      {order.assignedTechnicianName || 'Chưa phân công'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Hẹn trả máy:</span>
                    <span className={`font-bold ${isNearOverdue ? 'text-red-600 flex items-center gap-1' : 'text-slate-700'}`}>
                      {isNearOverdue && <AlertTriangle className="w-3 h-3 text-red-500" />}
                      {formatDateTime(order.appointmentDate)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400">Báo giá: </span>
                      <strong className="text-blue-600 text-sm">{formatVND(order.totalAmount)}</strong>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPrintModal(order.id);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 cursor-pointer"
                        title="In phiếu"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenDetailModal(order.id);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                      >
                        Khám máy →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
