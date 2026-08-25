import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle2, Clock, AlertCircle, Phone, User, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateTime, formatDate } from '../utils/formatters';

export const WarrantiesView: React.FC<{ onOpenDetailModal: (orderId: string) => void }> = ({ onOpenDetailModal }) => {
  const { repairOrders } = useApp();

  const [searchQuery, setSearchQuery] = useState('');

  // All orders that have warranty
  const warrantyOrders = repairOrders.filter((o) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (o.warrantyCode && o.warrantyCode.toLowerCase().includes(q)) ||
      o.code.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      (o.serialNumber && o.serialNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            <span>Tra Cứu & Quản Lý Bảo Hành Thiết Bị</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Kiểm tra thời hạn bảo hành điện tử theo Mã phiếu, Số điện thoại hoặc Serial máy
          </p>
        </div>
      </div>

      {/* Search box */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Nhập mã bảo hành (BH-SR...), SĐT khách hàng, mã phiếu (SR000125) hoặc số Serial máy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
          />
        </div>
      </div>

      {/* Warranty List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warrantyOrders.map((order) => {
          const isDelivered = order.status === 'da_giao';

          return (
            <div
              key={order.id}
              onClick={() => onOpenDetailModal(order.id)}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
                    {order.warrantyCode || 'CHƯA TẠO MÃ'}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isDelivered ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                    {isDelivered ? 'Đang kích hoạt' : 'Chưa giao máy'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-800 text-sm">{order.brand} {order.model}</h3>
                <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                  <div>Khách: <strong className="text-slate-700">{order.customerName}</strong> ({order.customerPhone})</div>
                  {order.serialNumber && <div>S/N: <span className="font-mono">{order.serialNumber}</span></div>}
                </div>

                {order.usedParts.length > 0 && (
                  <div className="mt-3 p-2.5 bg-slate-50 rounded-xl text-xs border border-slate-100 space-y-1">
                    <span className="font-semibold text-slate-500 text-[10px] uppercase block">Linh kiện bảo hành:</span>
                    {order.usedParts.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span className="truncate">{p.productName}</span>
                        <span className="font-bold text-blue-600 shrink-0">{p.warrantyMonths}T</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 text-[10px]">Thời hạn: </span>
                  <strong className="text-slate-800">{order.warrantyPeriod}</strong>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenDetailModal(order.id);
                  }}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] rounded-lg shadow-xs cursor-pointer"
                >
                  Xem hồ sơ →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
