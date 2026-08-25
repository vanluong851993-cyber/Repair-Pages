import React, { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, FileSpreadsheet, Calendar, ArrowUpRight, ArrowDownRight, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, exportToCSV } from '../utils/formatters';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

export const ReportsView: React.FC = () => {
  const { repairOrders, saleInvoices, products } = useApp();

  const [timeFilter, setTimeFilter] = useState<'this_month' | 'last_month' | 'this_year'>('this_month');

  // Calculate financials
  const repairRevenue = repairOrders.reduce((sum, o) => sum + o.paidAmount, 0);
  const partsCostInRepairs = repairOrders.reduce(
    (sum, o) => sum + o.usedParts.reduce((pSum, p) => pSum + p.quantity * p.costPrice, 0),
    0
  );
  const repairProfit = repairRevenue - partsCostInRepairs;

  const posRevenue = saleInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
  const posCost = saleInvoices.reduce(
    (sum, inv) => sum + inv.items.reduce((pSum, it) => pSum + it.quantity * it.costPrice, 0),
    0
  );
  const posProfit = posRevenue - posCost;

  const totalGrossRevenue = repairRevenue + posRevenue;
  const totalCost = partsCostInRepairs + posCost;
  const totalNetProfit = totalGrossRevenue - totalCost;

  const reportChartData = [
    { name: 'Sửa Laptop', doanhThu: 14500000, giaVon: 4200000, loiNhuan: 10300000 },
    { name: 'Sửa VGA/GPU', doanhThu: 8900000, giaVon: 2800000, loiNhuan: 6100000 },
    { name: 'Sửa Mainboard', doanhThu: 6200000, giaVon: 1500000, loiNhuan: 4700000 },
    { name: 'Bán lẻ linh kiện', doanhThu: posRevenue || 5400000, giaVon: posCost || 3200000, loiNhuan: posProfit || 2200000 },
    { name: 'Nạp BIOS & Cài đặt', doanhThu: 1800000, giaVon: 100000, loiNhuan: 1700000 },
  ];

  const handleExport = () => {
    const headers = ['Hạng mục', 'Doanh thu (VND)', 'Giá vốn linh kiện (VND)', 'Lợi nhuận gộp (VND)'];
    const rows = [
      ['Dịch vụ sửa chữa phần cứng', repairRevenue, partsCostInRepairs, repairProfit],
      ['Bán lẻ linh kiện POS', posRevenue, posCost, posProfit],
      ['TỔNG CỘNG HOẠT ĐỘNG', totalGrossRevenue, totalCost, totalNetProfit],
    ];
    exportToCSV(`Bao_cao_tai_chinh_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <span>Báo Cáo Doanh Thu & Hiệu Quả Kinh Doanh</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Báo cáo phân tích doanh thu, chi phí linh kiện, lợi nhuận gộp theo từng mảng dịch vụ
          </p>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Xuất Báo Cáo Excel</span>
        </button>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng doanh thu thực thu</div>
          <div className="text-2xl font-black text-blue-600 mt-1">{formatVND(totalGrossRevenue)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Gồm công sửa & bán lẻ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500">Tổng giá vốn linh kiện xuất kho</div>
          <div className="text-2xl font-black text-slate-700 mt-1">{formatVND(totalCost)}</div>
          <div className="text-[11px] text-slate-400 mt-1">Linh kiện đã lắp vào máy & bán</div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-md">
          <div className="text-xs font-semibold text-emerald-100">Lợi nhuận gộp thực tế</div>
          <div className="text-2xl font-black text-white mt-1">{formatVND(totalNetProfit)}</div>
          <div className="text-[11px] text-emerald-200 mt-1">Tỷ suất lợi nhuận: {totalGrossRevenue > 0 ? ((totalNetProfit / totalGrossRevenue) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="font-bold text-sm text-slate-800 mb-4">
          Biểu đồ Cơ Cấu Doanh Thu & Lợi Nhuận Theo Nhóm Dịch Vụ
        </h3>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Tr`} />
              <Tooltip formatter={(value: any) => [formatVND(Number(value)), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="doanhThu" name="Doanh thu" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="giaVon" name="Giá vốn LK" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="loiNhuan" name="Lợi nhuận" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
