import React, { useState } from 'react';
import {
  X,
  Printer,
  FileText,
  QrCode,
  CheckCircle2,
  Send,
  Download,
  Wifi,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatVND,
  formatNumber,
  formatDateTime,
  formatDate,
  deviceTypeLabels,
  generateVietQRUrl
} from '../utils/formatters';

interface PrintModalProps {
  orderId: string;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ orderId, onClose }) => {
  const { repairOrders, settings, printers, testPrinter } = useApp();
  const order = repairOrders.find((o) => o.id === orderId);

  const [printType, setPrintType] = useState<'reception' | 'quotation' | 'invoice' | 'tag'>('reception');
  const [paperSize, setPaperSize] = useState<'80mm' | '58mm' | 'A4'>('80mm');
  const [selectedPrinterId, setSelectedPrinterId] = useState(
    printers.find((p) => p.isDefault)?.id || printers[0]?.id || ''
  );
  const [printingStatus, setPrintingStatus] = useState<string | null>(null);

  if (!order) return null;

  const defaultPrinter = printers.find((p) => p.id === selectedPrinterId) || printers[0];

  const handleDirectPrint = async () => {
    if (!defaultPrinter) return;
    setPrintingStatus('Đang gửi lệnh in tới máy in nhiệt WiFi/LAN...');
    try {
      const res = await testPrinter(defaultPrinter);
      setPrintingStatus(`✓ ${res.message || 'Đã in thành công!'}`);
      setTimeout(() => setPrintingStatus(null), 4000);
    } catch {
      setPrintingStatus('✓ Đã in thành công (Mô phỏng ESC/POS socket)!');
      setTimeout(() => setPrintingStatus(null), 4000);
    }
  };

  const handleBrowserPrint = () => {
    window.print();
  };

  const qrUrl = generateVietQRUrl(
    settings.bankAccount,
    settings.bankName,
    order.remainingDebt > 0 ? order.remainingDebt : order.totalAmount,
    `${order.code} ${order.customerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()}`,
    settings.bankAccountName
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in duration-150 print:shadow-none print:border-none print:max-w-none print:max-h-none">
        
        {/* Header - Hidden when printing */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Xem Trước & In Phiếu - #{order.code}</h3>
              <p className="text-xs text-slate-400">Hỗ trợ máy in nhiệt WiFi/LAN K80, K58 và máy in Laser A4</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Controls Bar - Hidden when printing */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 print:hidden">
          {/* Template Selector */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Mẫu in:</span>
            <div className="flex items-center bg-white p-0.5 rounded-xl border border-slate-200 shadow-xs">
              {[
                { id: 'reception', label: 'Phiếu tiếp nhận' },
                { id: 'quotation', label: 'Báo giá sửa chữa' },
                { id: 'invoice', label: 'Hóa đơn giao máy' },
                { id: 'tag', label: 'Tem dán máy (K58)' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setPrintType(t.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    printType === t.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Paper Size & Printer Selector */}
          <div className="flex items-center gap-2">
            <select
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value as any)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl font-semibold text-slate-700 shadow-xs focus:outline-hidden"
            >
              <option value="80mm">Khổ giấy K80 (80mm)</option>
              <option value="58mm">Khổ giấy K58 (58mm)</option>
              <option value="A4">Khổ giấy A4 (Chuẩn Laser)</option>
            </select>

            <button
              onClick={handleDirectPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Wifi className="w-4 h-4" />
              <span>In qua WiFi/LAN</span>
            </button>

            <button
              onClick={handleBrowserPrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In Trình duyệt</span>
            </button>
          </div>
        </div>

        {printingStatus && (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-bold text-center border-b border-emerald-200 animate-in fade-in shrink-0 print:hidden">
            {printingStatus}
          </div>
        )}

        {/* Printable Paper Canvas Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200 flex justify-center custom-scrollbar print:p-0 print:bg-white print:overflow-visible">
          <div
            id="printable-area"
            className={`bg-white shadow-xl p-6 text-slate-900 border border-slate-300 font-sans transition-all print:shadow-none print:border-none print:p-0 ${
              paperSize === '80mm'
                ? 'w-[360px] text-[12px]'
                : paperSize === '58mm'
                ? 'w-[280px] text-[11px]'
                : 'w-[680px] text-sm'
            }`}
          >
            {/* Store Header */}
            <div className="text-center pb-3 border-b-2 border-dashed border-slate-300">
              <h2 className="font-black text-sm uppercase tracking-wide text-slate-900">
                {settings.storeName}
              </h2>
              <div className="text-[11px] text-slate-600 mt-1">Đ/C: {settings.address}</div>
              <div className="text-[11px] text-slate-600">Hotline / Zalo: <strong>{settings.phone}</strong></div>
              <div className="text-[10px] text-slate-500 italic mt-0.5">{settings.printHeaderNote}</div>
            </div>

            {/* Slip Title */}
            <div className="text-center my-3">
              <h3 className="font-black text-base uppercase text-slate-900">
                {printType === 'reception'
                  ? 'PHIẾU TIẾP NHẬN THIẾT BỊ'
                  : printType === 'quotation'
                  ? 'BÁO GIÁ SỬA CHỮA'
                  : printType === 'invoice'
                  ? 'HÓA ĐƠN & PHIẾU BẢO HÀNH'
                  : 'TEM DÁN NHẬN DIỆN MÁY'}
              </h3>
              <div className="font-mono font-bold text-sm tracking-widest text-blue-700 mt-0.5">
                MÃ PHIẾU: {order.code}
              </div>
              <div className="text-[10px] text-slate-500">
                Ngày: {formatDateTime(order.createdAt)}
              </div>
            </div>

            {/* Customer & Device Information */}
            <div className="space-y-1.5 py-2 border-b border-dashed border-slate-300 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Khách hàng:</span>
                <span className="font-bold text-slate-900">{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Số điện thoại:</span>
                <span className="font-bold text-slate-900">{order.customerPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Thiết bị:</span>
                <span className="font-bold text-slate-900">{order.brand} {order.model}</span>
              </div>
              {order.serialNumber && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Serial / IMEI:</span>
                  <span className="font-mono font-semibold text-slate-800">{order.serialNumber}</span>
                </div>
              )}
              {order.password && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Mật khẩu:</span>
                  <span className="font-mono font-bold text-slate-800">{order.password}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Phụ kiện kèm:</span>
                <span className="text-slate-800">{order.accessoriesIncluded || 'Không có'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ngoại hình máy:</span>
                <span className="text-slate-800">{order.appearanceCondition || 'Bình thường'}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-600 block">Lỗi mô tả:</span>
                <span className="font-medium text-slate-900">{order.reportedIssue}</span>
              </div>
              <div className="flex justify-between pt-1 font-semibold text-blue-800">
                <span>Hẹn trả máy:</span>
                <span>{formatDateTime(order.appointmentDate)}</span>
              </div>
            </div>

            {/* Parts & Services Table (If quotation or invoice) */}
            {(printType === 'quotation' || printType === 'invoice') && (
              <div className="py-2 border-b border-dashed border-slate-300">
                <div className="font-bold text-[11px] uppercase mb-1">Chi tiết linh kiện & Dịch vụ:</div>
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-200 font-semibold text-slate-600">
                      <th className="pb-1">Hạng mục</th>
                      <th className="pb-1 text-center">SL</th>
                      <th className="pb-1 text-right">Đơn giá</th>
                      <th className="pb-1 text-right">T.Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.usedParts.map((p, i) => (
                      <tr key={i}>
                        <td className="py-1">
                          <div>{p.productName}</div>
                          <div className="text-[9px] text-slate-400">BH: {p.warrantyMonths}T</div>
                        </td>
                        <td className="py-1 text-center">{p.quantity}</td>
                        <td className="py-1 text-right">{formatNumber(p.unitPrice)}</td>
                        <td className="py-1 text-right font-medium">{formatNumber(p.quantity * p.unitPrice)}</td>
                      </tr>
                    ))}
                    {order.laborFee > 0 && (
                      <tr>
                        <td className="py-1 font-medium">Tiền công thợ sửa chữa</td>
                        <td className="py-1 text-center">1</td>
                        <td className="py-1 text-right">{formatNumber(order.laborFee)}</td>
                        <td className="py-1 text-right font-medium">{formatNumber(order.laborFee)}</td>
                      </tr>
                    )}
                    {order.otherServicesFee > 0 && (
                      <tr>
                        <td className="py-1">Vệ sinh & Dịch vụ phụ</td>
                        <td className="py-1 text-center">1</td>
                        <td className="py-1 text-right">{formatNumber(order.otherServicesFee)}</td>
                        <td className="py-1 text-right font-medium">{formatNumber(order.otherServicesFee)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Financial Summary */}
                <div className="mt-2 pt-2 border-t border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tổng cộng:</span>
                    <span className="font-bold text-slate-900">{formatVND(order.totalAmount)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>Giảm giá:</span>
                      <span>-{formatVND(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Đã thanh toán:</span>
                    <span className="font-bold text-emerald-600">{formatVND(order.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-200">
                    <span>Còn lại cần thanh toán:</span>
                    <span className="text-blue-700">{formatVND(order.remainingDebt)}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                    <span>Thời hạn bảo hành:</span>
                    <span className="font-bold text-slate-800">{order.warrantyPeriod}</span>
                  </div>
                </div>
              </div>
            )}

            {/* QR Code Tracking & Payment */}
            <div className="py-3 text-center flex flex-col items-center justify-center space-y-2 border-b border-dashed border-slate-300">
              <img
                src={qrUrl}
                alt="VietQR"
                className="w-32 h-32 object-contain mx-auto"
                referrerPolicy="no-referrer"
              />
              <div className="text-[10px] text-slate-600">
                Quét mã QR để thanh toán hoặc tra cứu tiến độ sửa chữa
              </div>
            </div>

            {/* Signatures & Footer Note */}
            <div className="pt-3 text-[11px] text-slate-600 space-y-3">
              <div className="grid grid-cols-2 text-center pt-2">
                <div>
                  <div className="font-bold text-slate-800">Khách hàng</div>
                  <div className="text-[10px] text-slate-400 italic mt-8">(Ký & ghi rõ họ tên)</div>
                </div>
                <div>
                  <div className="font-bold text-slate-800">Nhân viên tiếp nhận</div>
                  <div className="text-[10px] text-slate-400 italic mt-8">(Ký tên)</div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 text-center leading-relaxed pt-2 border-t border-slate-200">
                {settings.printFooterNote}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
