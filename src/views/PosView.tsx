import React, { useState } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  QrCode,
  Printer,
  CheckCircle2,
  User,
  Phone,
  Tag,
  CreditCard
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, generateVietQRUrl } from '../utils/formatters';
import confetti from 'canvas-confetti';

export const PosView: React.FC = () => {
  const { products, customers, createCustomer, createSaleInvoice, settings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Array<{ product: any; quantity: number }>>([]);
  const [customerPhone, setCustomerPhone] = useState('0909999999');
  const [customerName, setCustomerName] = useState('Khách lẻ');
  const [customerId, setCustomerId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'qr'>('qr');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastInvoiceCode, setLastInvoiceCode] = useState('');

  // Search products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || (p.barcode && p.barcode.includes(q));
  });

  const addToCart = (product: any) => {
    if (product.stock <= 0) {
      alert(`Sản phẩm "${product.name}" đã hết hàng trong kho!`);
      return;
    }
    const existingIndex = cart.findIndex((it) => it.product.id === product.id);
    if (existingIndex > -1) {
      if (cart[existingIndex].quantity >= product.stock) {
        alert(`Số lượng tồn trong kho chỉ còn ${product.stock}!`);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateQuantity = (index: number, qty: number) => {
    const it = cart[index];
    if (qty <= 0) {
      setCart(cart.filter((_, i) => i !== index));
      return;
    }
    if (qty > it.product.stock) {
      alert(`Tồn kho chỉ còn ${it.product.stock}!`);
      return;
    }
    const updated = [...cart];
    updated[index].quantity = qty;
    setCart(updated);
  };

  const subTotal = cart.reduce((sum, it) => sum + it.quantity * it.product.sellingPrice, 0);
  const grandTotal = Math.max(0, subTotal - discount);

  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = customers.find((c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existing) {
      setCustomerId(existing.id);
      setCustomerName(existing.name);
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    let custId = customerId;
    if (!custId) {
      const newCust = createCustomer({
        name: customerName,
        phone: customerPhone,
      });
      custId = newCust.id;
    }

    const items = cart.map((it) => ({
      productId: it.product.id,
      productCode: it.product.code,
      productName: it.product.name,
      quantity: it.quantity,
      costPrice: it.product.costPrice,
      unitPrice: it.product.sellingPrice,
      totalPrice: it.quantity * it.product.sellingPrice,
      warrantyMonths: it.product.warrantyMonths,
    }));

    const invoice = createSaleInvoice({
      customerId: custId,
      customerName,
      customerPhone,
      items,
      discount,
      paidAmount: grandTotal,
      paymentMethod,
    });

    setLastInvoiceCode(invoice.code);
    setShowSuccessModal(true);
    setCart([]);
    setDiscount(0);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  const qrUrl = generateVietQRUrl(
    settings.bankAccount,
    settings.bankName,
    grandTotal,
    `BAN LE ${customerPhone}`,
    settings.bankAccountName
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pb-12">
      {/* Product Catalog Picker (Left 7 Cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm linh kiện bán lẻ hoặc quét mã vạch Barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              autoFocus
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const outOfStock = p.stock <= 0;
            return (
              <div
                key={p.id}
                onClick={() => !outOfStock && addToCart(p)}
                className={`bg-white p-3.5 rounded-2xl border transition-all flex flex-col justify-between ${
                  outOfStock
                    ? 'opacity-40 border-slate-200 cursor-not-allowed'
                    : 'border-slate-200 hover:border-blue-500 hover:shadow-md cursor-pointer active:scale-95'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span className="font-mono">{p.code}</span>
                    <span className="font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">{p.category}</span>
                  </div>
                  <h4 className="font-bold text-xs text-slate-800 line-clamp-2">{p.name}</h4>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div className="font-black text-xs text-blue-600">{formatVND(p.sellingPrice)}</div>
                  <div className={`text-[10px] font-bold ${p.stock <= p.minStock ? 'text-red-500' : 'text-slate-500'}`}>
                    Tồn: {p.stock}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cart & POS Checkout Panel (Right 5 Cols) */}
      <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-blue-600" />
              <span>Giỏ hàng bán lẻ ({cart.length})</span>
            </h3>
            {cart.length > 0 && (
              <button
                onClick={() => setCart([])}
                className="text-[11px] text-red-500 hover:text-red-700 font-semibold cursor-pointer"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Cart items list */}
          <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto custom-scrollbar my-2">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Giỏ hàng trống. Hãy chọn linh kiện bên trái để thêm vào hóa đơn.
              </div>
            ) : (
              cart.map((it, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-800 truncate">{it.product.name}</div>
                    <div className="text-[10px] text-blue-600 font-bold">{formatVND(it.product.sellingPrice)}</div>
                  </div>

                  {/* Quantity modifier */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                    <button
                      onClick={() => updateQuantity(idx, it.quantity - 1)}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-bold">{it.quantity}</span>
                    <button
                      onClick={() => updateQuantity(idx, it.quantity + 1)}
                      className="p-1 hover:bg-white rounded text-slate-600 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="font-bold text-slate-800 text-right min-w-[70px]">
                    {formatVND(it.quantity * it.product.sellingPrice)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Customer & Payment Form */}
        <form onSubmit={handleCheckout} className="space-y-3 text-xs pt-3 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-600 block mb-0.5">SĐT Khách hàng:</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 block mb-0.5">Tên khách hàng:</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Chiết khấu / Giảm giá:</span>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-28 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-right text-red-600 font-bold"
            />
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Tạm tính:</span>
              <span className="font-semibold text-slate-700">{formatVND(subTotal)}</span>
            </div>
            <div className="flex justify-between text-base font-black border-t border-slate-200 pt-1">
              <span className="text-slate-800">Tổng thanh toán:</span>
              <span className="text-blue-600">{formatVND(grandTotal)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'qr', label: 'Quét VietQR' },
              { id: 'cash', label: 'Tiền mặt' },
              { id: 'transfer', label: 'Chuyển khoản' },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setPaymentMethod(m.id as any)}
                className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  paymentMethod === m.id
                    ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-400'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={cart.length === 0}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:bg-slate-300 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            Thanh toán {formatVND(grandTotal)}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center space-y-4 animate-in fade-in zoom-in-95">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h3 className="font-bold text-base text-slate-800">Thanh Toán Bán Lẻ Thành Công!</h3>
            <p className="text-xs text-slate-500">
              Mã hóa đơn: <strong className="text-blue-600 font-mono">{lastInvoiceCode}</strong>
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowSuccessModal(false);
                }}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In hóa đơn</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
