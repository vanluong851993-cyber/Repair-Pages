import React from 'react';
import { Clock, PhoneCall, CheckCircle2, User, Printer, ArrowRight, ShieldCheck, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateTime, repairStatusConfig } from '../utils/formatters';

interface WaitingPickupViewProps {
  onOpenDetailModal: (orderId: string) => void;
  onOpenPrintModal: (orderId: string) => void;
}

export const WaitingPickupView: React.FC<WaitingPickupViewProps> = ({ onOpenDetailModal, onOpenPrintModal }) => {
  const { repairOrders, updateRepairStatus } = useApp();

  const pickupOrders = repairOrders.filter((o) => ['sua_xong', 'dang_test', 'cho_khach_nhan'].includes(o.status));

  const handleQuickDeliver = (orderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    updateRepairStatus(orderId, 'da_giao', 'Đã bàn giao máy trực tiếp cho khách');
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>Máy Đã Sửa Xong Chờ Khách Nhận</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-800 font-bold">
              {pickupOrders.length} máy
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Các thiết bị đã hoàn thành sửa chữa & test tải ổn định, chuẩn bị bàn giao và thu tiền thanh toán
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pickupOrders.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400">
            <CheckCircle2 className="w-12 h-12 text-teal-500 mx-auto mb-2" />
            <div className="font-bold text-slate-700">Hiện không có máy nào đang chờ khách lấy.</div>
          </div>
        ) : (
          pickupOrders.map((order) => {
            const isFinished = order.status === 'cho_khach_nhan';
            const statusCfg = repairStatusConfig[order.status];

            return (
              <div
                key={order.id}
                onClick={() => onOpenDetailModal(order.id)}
                className="bg-white rounded-2xl border border-teal-200 p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-teal-700 text-sm">#{order.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                      {statusCfg.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-800 text-sm">
                    {order.brand} {order.model}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{order.customerName}</span>
                  </div>

                  <a
                    href={`tel:${order.customerPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <PhoneCall className="w-3 h-3" />
                    <span>Gọi khách: {order.customerPhone}</span>
                  </a>

                  {order.techSheet?.repairMethod && (
                    <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                      <span className="font-semibold text-slate-500 block text-[10px] uppercase">Đã xử lý:</span>
                      <p className="line-clamp-2 mt-0.5 font-medium text-emerald-800">{order.techSheet.repairMethod}</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Cần thu thêm:</span>
                    <span className="font-black text-blue-700 text-sm">{formatVND(order.remainingDebt)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Bảo hành:</span>
                    <span className="font-bold text-slate-800">{order.warrantyPeriod}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPrintModal(order.id);
                      }}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                      title="In hóa đơn & bảo hành"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    <button
                      onClick={(e) => handleQuickDeliver(order.id, e)}
                      className="flex-1 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Giao máy cho khách</span>
                    </button>
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
