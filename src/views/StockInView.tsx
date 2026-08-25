import React, { useState } from 'react';
import { PackagePlus, Plus, Search, Trash2, CheckCircle2, User, DollarSign, ArrowDownLeft, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatDateTime } from '../utils/formatters';
import confetti from 'canvas-confetti';

export const StockInView: React.FC = () => {
  const { stockInReceipts, products, suppliers, createStockInReceipt } = useApp();

  const [isCreating, setIsCreating] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number; costPrice: number }>>([
    { productId: products[0]?.id || '', quantity: 10, costPrice: products[0]?.costPrice || 50000 }
  ]);
  const [paidAmount, setPaidAmount] = useState(0);
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    setItems([...items, { productId: products[0]?.id || '', quantity: 5, costPrice: products[0]?.costPrice || 50000 }]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleProductChange = (index: number, pid: string) => {
    const prod = products.find((p) => p.id === pid);
    const updated = [...items];
    updated[index].productId = pid;
    if (prod) {
      updated[index].costPrice = prod.costPrice;
    }
    setItems(updated);
  };

  const totalCost = items.reduce((sum, it) => sum + it.quantity * it.costPrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const supp = suppliers.find((s) => s.id === supplierId);

    const formattedItems = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productCode: prod?.code || '',
        productName: prod?.name || '',
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice),
        totalPrice: Number(it.quantity * it.costPrice),
      };
    });

    createStockInReceipt({
      supplierId,
      supplierName: supp?.name || 'Nhà cung cấp linh kiện',
      items: formattedItems,
      paidAmount: Number(paidAmount),
      notes,
    });

    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    setIsCreating(false);
    setNotes('');
  };

  return (
    <div className="space-y-4 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <PackagePlus className="w-5 h-5 text-indigo-600" />
            <span>Nhập Kho Linh Kiện & Hàng Hóa</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
              {stockInReceipts.length} phiếu nhập
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận nhập hàng từ nhà phân phối, cộng dồn tồn kho linh kiện và theo dõi công nợ NCC
          </p>
        </div>

        <button
          onClick={() => {
            setIsCreating(true);
            setPaidAmount(0);
          }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo phiếu nhập kho</span>
        </button>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <th className="py-3.5 px-4">Mã phiếu</th>
              <th className="py-3.5 px-4">Ngày nhập</th>
              <th className="py-3.5 px-4">Nhà cung cấp</th>
              <th className="py-3.5 px-4">Số mặt hàng</th>
              <th className="py-3.5 px-4 text-right">Tổng tiền hàng</th>
              <th className="py-3.5 px-4 text-right">Đã trả NCC</th>
              <th className="py-3.5 px-4 text-right">Còn nợ NCC</th>
              <th className="py-3.5 px-4">Người tạo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stockInReceipts.map((rec) => (
              <tr key={rec.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-mono font-bold text-indigo-600">{rec.code}</td>
                <td className="py-3 px-4 text-slate-600">{formatDateTime(rec.createdAt)}</td>
                <td className="py-3 px-4 font-bold text-slate-800">{rec.supplierName}</td>
                <td className="py-3 px-4 text-slate-600">{rec.items.length} mã linh kiện</td>
                <td className="py-3 px-4 text-right font-bold text-slate-900">{formatVND(rec.totalAmount)}</td>
                <td className="py-3 px-4 text-right font-medium text-emerald-600">{formatVND(rec.paidAmount)}</td>
                <td className="py-3 px-4 text-right font-bold text-amber-600">
                  {rec.remainingDebt > 0 ? formatVND(rec.remainingDebt) : '0 ₫'}
                </td>
                <td className="py-3 px-4 text-slate-500">{rec.createdBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Stock-in Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden animate-in fade-in">
            <div className="px-5 py-4 bg-indigo-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <PackagePlus className="w-5 h-5" />
                <span>Tạo Phiếu Nhập Kho Linh Kiện Mới</span>
              </h3>
              <button onClick={() => setIsCreating(false)} className="p-1 text-white hover:bg-indigo-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Chọn Nhà Cung Cấp:</label>
                  <select
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ghi chú phiếu nhập:</label>
                  <input
                    type="text"
                    placeholder="vd: Nhập lô MOSFET và VRAM Samsung từ NCC Hà Nội..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200 rounded-xl p-3 space-y-2 bg-slate-50">
                <div className="flex items-center justify-between font-bold text-slate-700 pb-1">
                  <span>Chi tiết danh sách hàng nhập:</span>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer"
                  >
                    + Thêm dòng linh kiện
                  </button>
                </div>

                {items.map((it, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded-lg border border-slate-200">
                    <div className="col-span-6">
                      <select
                        value={it.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg font-medium text-xs"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-2">
                      <input
                        type="number"
                        min={1}
                        placeholder="SL"
                        value={it.quantity}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].quantity = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-center font-bold"
                      />
                    </div>

                    <div className="col-span-3">
                      <input
                        type="number"
                        placeholder="Giá vốn"
                        value={it.costPrice}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].costPrice = Number(e.target.value);
                          setItems(updated);
                        }}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-right font-medium"
                      />
                    </div>

                    <div className="col-span-1 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-100 rounded-xl space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng tiền hàng:</span>
                    <span className="font-bold text-slate-800">{formatVND(totalCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Còn nợ NCC:</span>
                    <span className="font-bold text-amber-600">{formatVND(Math.max(0, totalCost - paidAmount))}</span>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số tiền thanh toán trước cho NCC:</label>
                  <input
                    type="number"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-emerald-700 font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Xác nhận nhập kho {formatVND(totalCost)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
