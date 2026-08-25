import React from 'react';
import { Users, Award, Wrench, CheckCircle2, TrendingUp, DollarSign } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';

export const TechniciansView: React.FC = () => {
  const { users, repairOrders } = useApp();

  const techs = users.filter((u) => u.role === 'technician' || u.role === 'admin');

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <span>Năng Suất & Hiệu Quả Kỹ Thuật Viên</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Theo dõi số lượng máy hoàn thành, doanh thu tạo ra và tính toán hoa hồng kỹ thuật
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {techs.map((tech) => {
          const techOrders = repairOrders.filter((o) => o.assignedTechnicianId === tech.id);
          const completedOrders = techOrders.filter((o) => o.status === 'da_giao' || o.status === 'sua_xong');
          const totalRevenue = techOrders.reduce((sum, o) => sum + o.paidAmount, 0);
          const totalLabor = techOrders.reduce((sum, o) => sum + o.laborFee, 0);
          const estimatedCommission = totalLabor * 0.3; // 30% commission on labor fee

          return (
            <div key={tech.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-lg">
                  {tech.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{tech.name}</h3>
                  <div className="text-xs text-slate-500">{tech.email}</div>
                  <span className="inline-block mt-0.5 px-2 py-0.2 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold">
                    {tech.role === 'admin' ? 'Trưởng phòng Kỹ thuật' : 'Kỹ thuật viên Vi mạch'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Máy phụ trách</div>
                  <div className="text-base font-bold text-slate-800 mt-0.5">{techOrders.length} đơn</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Đã hoàn thành</div>
                  <div className="text-base font-bold text-emerald-600 mt-0.5">{completedOrders.length} đơn</div>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <div className="text-slate-400 text-[11px]">Doanh số tạo ra</div>
                  <div className="text-xs font-bold text-blue-600 mt-0.5">{formatVND(totalRevenue)}</div>
                </div>

                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="text-emerald-800 text-[11px] font-semibold">Hoa hồng ước tính (30%)</div>
                  <div className="text-xs font-black text-emerald-700 mt-0.5">{formatVND(estimatedCommission)}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
