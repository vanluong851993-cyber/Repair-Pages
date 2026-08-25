import React from 'react';
import { AlertTriangle, Package, Plus, ShoppingCart, CheckCircle2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';

export const LowStockView: React.FC = () => {
  const { products, suppliers, setActiveTab } = useApp();

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  const totalEstimatedCost = lowStockProducts.reduce((sum, p) => {
    const deficit = Math.max(1, p.minStock * 2 - p.stock);
    return sum + deficit * p.costPrice;
  }, 0);

  return (
    <div className="space-y-4 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Hàng Hóa & Linh Kiện Cần Nhập Thêm</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold border border-red-200">
              {lowStockProducts.length} mặt hàng báo động
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Linh kiện có số lượng tồn kho chạm hoặc thấp hơn định mức tối thiểu, cần đặt mua ngay để không gián đoạn sửa chữa
          </p>
        </div>

        <button
          onClick={() => setActiveTab('stock_in')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Tạo phiếu nhập kho ngay</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
        <div className="text-xs text-amber-900">
          <div>Ước tính kinh phí nhập bù đủ định mức 2x cho {lowStockProducts.length} linh kiện:</div>
          <div className="text-lg font-black text-amber-950 mt-0.5">{formatVND(totalEstimatedCost)}</div>
        </div>
        <div className="text-xs text-slate-500">
          Nhà cung cấp đề xuất: <strong className="text-slate-800">{suppliers[0]?.name || 'Kho Linh Kiện Toàn Quốc'}</strong>
        </div>
      </div>

      {/* Low stock list */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <th className="py-3 px-4">Mã SP</th>
              <th className="py-3 px-4">Tên linh kiện</th>
              <th className="py-3 px-4">Danh mục</th>
              <th className="py-3 px-4">Vị trí kho</th>
              <th className="py-3 px-4 text-center">Tồn hiện tại</th>
              <th className="py-3 px-4 text-center">Định mức min</th>
              <th className="py-3 px-4 text-center">Cần nhập bù</th>
              <th className="py-3 px-4 text-right">Đơn giá nhập</th>
              <th className="py-3 px-4 text-right">Tổng chi phí</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lowStockProducts.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-10 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <div className="font-bold text-slate-700">Tất cả linh kiện đều đủ số lượng tồn an toàn!</div>
                </td>
              </tr>
            ) : (
              lowStockProducts.map((p) => {
                const deficit = Math.max(1, p.minStock * 2 - p.stock);
                return (
                  <tr key={p.id} className="hover:bg-amber-50/40">
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">{p.code}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{p.name}</td>
                    <td className="py-3 px-4 text-slate-500">{p.category}</td>
                    <td className="py-3 px-4 text-slate-600">{p.warehouseLocation}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full font-black text-xs bg-red-100 text-red-700">
                        {p.stock} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-slate-600">{p.minStock}</td>
                    <td className="py-3 px-4 text-center font-black text-amber-600">+{deficit}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{formatVND(p.costPrice)}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatVND(deficit * p.costPrice)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
