import React, { useState } from 'react';
import {
  Wrench,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  DollarSign,
  Package,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Calendar,
  Sparkles,
  ChevronRight,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';
import { formatVND, formatNumber } from '../utils/formatters';

export const DashboardView: React.FC<{ onOpenNewRepairModal: () => void }> = ({ onOpenNewRepairModal }) => {
  const { repairOrders, products, customers, suppliers, saleInvoices, setActiveTab, setSelectedOrderId } = useApp();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month' | 'all'>('month');

  // Compute key stats
  const totalRepairs = repairOrders.length;
  const receivingOrders = repairOrders.filter((o) => o.status === 'tiep_nhan').length;
  const checkingOrders = repairOrders.filter((o) => ['cho_kiem_tra', 'dang_kiem_tra', 'bao_gia'].includes(o.status)).length;
  const repairingOrders = repairOrders.filter((o) => ['dang_sua', 'cho_linh_kien'].includes(o.status)).length;
  const fixedOrders = repairOrders.filter((o) => ['sua_xong', 'dang_test'].includes(o.status)).length;
  const waitingPickup = repairOrders.filter((o) => o.status === 'cho_khach_nhan').length;
  const deliveredOrders = repairOrders.filter((o) => o.status === 'da_giao').length;
  const warrantyOrders = repairOrders.filter((o) => o.status === 'bao_hanh').length;

  // Financial stats
  const totalRevenue = repairOrders.reduce((sum, o) => sum + o.paidAmount, 0) +
    saleInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  const customerDebts = customers.reduce((sum, c) => sum + c.debt, 0);
  const supplierDebts = suppliers.reduce((sum, s) => sum + s.debt, 0);
  const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.costPrice, 0);
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  // Chart data: Device Distribution
  const deviceCounts: Record<string, number> = {};
  repairOrders.forEach((o) => {
    const typeLabel = o.deviceType === 'laptop' ? 'Laptop' :
      o.deviceType === 'vga' ? 'VGA / GPU' :
      o.deviceType === 'mainboard' ? 'Mainboard' :
      o.deviceType === 'pc' ? 'Máy PC' :
      o.deviceType === 'macbook' ? 'Macbook' : 'Khác';
    deviceCounts[typeLabel] = (deviceCounts[typeLabel] || 0) + 1;
  });

  const devicePieData = Object.keys(deviceCounts).map((k) => ({
    name: k,
    value: deviceCounts[k],
  }));

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

  // Revenue & Profit Chart Mock Data
  const revenueChartData = [
    { name: '18/08', doanhThu: 3200000, loiNhuan: 1850000, donSua: 3 },
    { name: '19/08', doanhThu: 4850000, loiNhuan: 2900000, donSua: 5 },
    { name: '20/08', doanhThu: 2900000, loiNhuan: 1600000, donSua: 2 },
    { name: '21/08', doanhThu: 5400000, loiNhuan: 3400000, donSua: 6 },
    { name: '22/08', doanhThu: 6800000, loiNhuan: 4100000, donSua: 7 },
    { name: '23/08', doanhThu: 4200000, loiNhuan: 2600000, donSua: 4 },
    { name: '24/08', doanhThu: 5900000, loiNhuan: 3750000, donSua: 5 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Store Greeting & Date Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>Tổng quan hoạt động cửa hàng</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Thời gian thực
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Theo dõi tiến độ sửa chữa máy, xuất nhập linh kiện, công nợ và doanh thu hằng ngày
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Time filter pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {(['today', '7days', 'month', 'all'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  timeRange === r ? 'bg-white text-blue-600 font-bold shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {r === 'today' ? 'Hôm nay' : r === '7days' ? '7 ngày' : r === 'month' ? 'Tháng này' : 'Tất cả'}
              </button>
            ))}
          </div>

          <button
            onClick={onOpenNewRepairModal}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tiếp nhận máy</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid: Repair Order Pipeline */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setActiveTab('repairs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng đơn sửa</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{totalRepairs}</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">Toàn bộ hồ sơ</div>
        </div>

        <div
          onClick={() => setActiveTab('repairs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-yellow-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang khám & Báo giá</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{checkingOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">Chờ khách duyệt</div>
        </div>

        <div
          onClick={() => setActiveTab('repairs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đang sửa / Chờ LK</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-indigo-600 mt-2">{repairingOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">KTV đang xử lý</div>
        </div>

        <div
          onClick={() => setActiveTab('waiting_pickup')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-cyan-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sửa xong chờ nhận</span>
            <div className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-cyan-700 mt-2">{waitingPickup}</div>
          <div className="text-[11px] text-cyan-600 font-medium mt-1">Báo khách lấy máy</div>
        </div>

        <div
          onClick={() => setActiveTab('repairs')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Đã giao máy</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">{deliveredOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đã tất toán</div>
        </div>

        <div
          onClick={() => setActiveTab('warranties')}
          className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-rose-400 hover:shadow-md transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Bảo hành lại</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">{warrantyOrders}</div>
          <div className="text-[11px] text-slate-500 mt-1">Đơn bảo hành</div>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-100">Tổng doanh thu thực thu</span>
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="text-2xl font-black tracking-tight mt-2">{formatVND(totalRevenue)}</div>
          <div className="flex items-center gap-1.5 text-xs text-blue-100 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-300" />
            <span>Đã bao gồm công sửa & bán lẻ POS</span>
          </div>
        </div>

        {/* Customer Debt */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tiền khách còn nợ</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{formatVND(customerDebts)}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{customers.filter((c) => c.debt > 0).length} khách chưa trả hết</span>
            <span className="text-blue-600 font-semibold">Xem nợ →</span>
          </div>
        </div>

        {/* Supplier Debt */}
        <div
          onClick={() => setActiveTab('debts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-purple-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nợ phải trả nhà cung cấp</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{formatVND(supplierDebts)}</div>
          <div className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>{suppliers.filter((s) => s.debt > 0).length} nhà cung cấp linh kiện</span>
            <span className="text-blue-600 font-semibold">Chi trả →</span>
          </div>
        </div>

        {/* Inventory Stock Value */}
        <div
          onClick={() => setActiveTab('products')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-400 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Giá trị tồn kho linh kiện</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">{formatVND(inventoryValue)}</div>
          <div className="text-xs mt-2 flex items-center justify-between">
            <span className="text-slate-500">{products.length} mã linh kiện</span>
            {lowStockCount > 0 && (
              <span className="text-red-600 font-bold bg-red-50 px-1.5 py-0.5 rounded text-[11px]">
                {lowStockCount} sắp hết!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Critical Alert Banners */}
      {lowStockCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-amber-900 text-sm">
                Có {lowStockCount} linh kiện dưới mức tồn tối thiểu!
              </div>
              <div className="text-xs text-amber-700 mt-0.5">
                Các linh kiện như MOSFET AON6414, IC Nguồn TPS51125 đang sắp cạn kiệt, cần nhập thêm để phục vụ sửa chữa.
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('low_stock')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            Tạo phiếu nhập ngay
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Biểu đồ Doanh thu & Lợi nhuận (7 ngày gần nhất)</h2>
              <p className="text-xs text-slate-400">Doanh thu thu về trừ giá vốn linh kiện thay thế</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600"></span>
                <span>Doanh thu</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-500"></span>
                <span>Lợi nhuận</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorDoanhThu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorLoiNhuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(v) => `${(v / 1000000).toFixed(1)}Tr`}
                />
                <Tooltip
                  formatter={(value: any) => [formatVND(Number(value)), '']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorDoanhThu)" />
                <Area type="monotone" dataKey="loiNhuan" name="Lợi nhuận" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorLoiNhuan)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Device Distribution Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Phân bổ Thiết bị sửa chữa</h2>
            <p className="text-xs text-slate-400">Tỷ lệ theo chủng loại máy nhận sửa</p>
          </div>

          <div className="h-48 w-full relative my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={devicePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {devicePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} đơn`, 'Số lượng']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-black text-slate-800">{totalRepairs}</span>
              <span className="text-[10px] text-slate-400">Tổng máy</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {devicePieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>
                <span className="text-slate-600 truncate">{d.name}</span>
                <span className="font-bold text-slate-800 ml-auto">({d.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Repairs Table & Popular Components */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Repair Queue */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Phiếu sửa chữa mới tiếp nhận & đang xử lý</h2>
              <p className="text-xs text-slate-400">Danh sách theo dõi tiến độ thời gian thực</p>
            </div>
            <button
              onClick={() => setActiveTab('repairs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold">
                  <th className="pb-3">Mã phiếu</th>
                  <th className="pb-3">Khách hàng</th>
                  <th className="pb-3">Thiết bị & Lỗi</th>
                  <th className="pb-3">Kỹ thuật viên</th>
                  <th className="pb-3">Trạng thái</th>
                  <th className="pb-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {repairOrders.slice(0, 5).map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => {
                      setSelectedOrderId(order.id);
                      setActiveTab('repairs');
                    }}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 font-bold text-blue-600">{order.code}</td>
                    <td className="py-3">
                      <div className="font-semibold text-slate-800">{order.customerName}</div>
                      <div className="text-[11px] text-slate-400">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 max-w-[200px]">
                      <div className="font-medium text-slate-700 truncate">{order.brand} {order.model}</div>
                      <div className="text-[11px] text-slate-500 truncate">{order.reportedIssue}</div>
                    </td>
                    <td className="py-3 text-slate-600">
                      {order.assignedTechnicianName ? order.assignedTechnicianName.split(' ')[0] + ' ' + order.assignedTechnicianName.split(' ')[1] : 'Chưa gán'}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold text-slate-800">
                      {formatVND(order.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Best-selling Spares / Popular Components */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-slate-800 text-sm">Linh kiện thay thế phổ biến</h2>
              <p className="text-xs text-slate-400">Tồn kho & giá bán niêm yết</p>
            </div>
            <button
              onClick={() => setActiveTab('products')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Kho linh kiện
            </button>
          </div>

          <div className="space-y-3">
            {products.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="min-w-0 pr-2">
                  <div className="text-xs font-semibold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{p.category}</span>
                    <span>•</span>
                    <span>Vị trí: {p.warehouseLocation}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-blue-600">{formatVND(p.sellingPrice)}</div>
                  <div className={`text-[11px] font-semibold ${p.stock <= p.minStock ? 'text-red-600' : 'text-slate-500'}`}>
                    Tồn: {p.stock} cái
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
