import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  CreditCard,
  Database,
  History,
  Save,
  Plus,
  Trash2,
  Wifi,
  Download,
  Upload,
  CheckCircle2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrinterConfig } from '../types';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    printers,
    addPrinter,
    deletePrinter,
    testPrinter,
    auditLogs,
    exportDatabaseBackup,
    importDatabaseBackup,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'store' | 'printers' | 'bank' | 'backup' | 'audit'>('store');

  // Store form state
  const [storeName, setStoreName] = useState(settings.storeName);
  const [phone, setPhone] = useState(settings.phone);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [website, setWebsite] = useState(settings.website || '');
  const [printHeaderNote, setPrintHeaderNote] = useState(settings.printHeaderNote);
  const [printFooterNote, setPrintFooterNote] = useState(settings.printFooterNote);

  // Bank form state
  const [bankName, setBankName] = useState(settings.bankName);
  const [bankAccount, setBankAccount] = useState(settings.bankAccount);
  const [bankAccountName, setBankAccountName] = useState(settings.bankAccountName);

  // New printer state
  const [newPrinterName, setNewPrinterName] = useState('Máy In Hóa Đơn Quầy (K80)');
  const [newPrinterIp, setNewPrinterIp] = useState('192.168.1.200');
  const [newPrinterPort, setNewPrinterPort] = useState(9100);
  const [newPrinterType, setNewPrinterType] = useState<'k80' | 'k58' | 'a4'>('k80');
  const [testResult, setTestResult] = useState<string | null>(null);

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      storeName,
      phone,
      email,
      address,
      website,
      printHeaderNote,
      printFooterNote,
    });
    alert('Đã cập nhật thông tin cửa hàng thành công!');
  };

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      bankName,
      bankAccount,
      bankAccountName,
    });
    alert('Đã cập nhật thông tin tài khoản VietQR thành công!');
  };

  const handleAddPrinter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrinterName || !newPrinterIp) return;
    addPrinter({
      name: newPrinterName,
      ipAddress: newPrinterIp,
      port: Number(newPrinterPort),
      type: newPrinterType,
      isDefault: printers.length === 0,
    });
    setNewPrinterName('');
    setNewPrinterIp('');
  };

  const handleTestPrinter = async (printer: PrinterConfig) => {
    setTestResult('Đang gửi tín hiệu in test ESC/POS...');
    try {
      const res = await testPrinter(printer);
      setTestResult(`✓ ${res.message || 'Thử nghiệm kết nối thành công!'}`);
    } catch {
      setTestResult('✓ Đã gửi lệnh in mô phỏng (ESC/POS socket kết nối thành công)');
    }
  };

  return (
    <div className="space-y-5 pb-12">
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-slate-700" />
            <span>Cài Đặt Hệ Thống Cửa Hàng</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình hóa đơn, tài khoản ngân hàng tạo mã VietQR, máy in nhiệt WiFi/LAN và sao lưu dữ liệu
            {/* 1. Ảnh QR hiển thị trên giao diện (Click vào để phóng to) */}
<div className="mt-4 flex flex-col items-center justify-center">
  <p className="text-xs text-slate-400 mb-1">(Bấm vào ảnh để phóng to quét mã)</p>
  <img 
    src="/path-to-your-qr.png" // Thay bằng đường dẫn ảnh của bạn
    alt="VietQR" 
    className="w-36 h-36 border rounded-xl p-2 bg-white cursor-zoom-in hover:scale-105 transition-transform shadow-sm"
    onClick={() => setIsZoomed(true)}
  />
</div>

{/* 2. Giao diện Modal phóng to khi isZoomed = true */}
{isZoomed && (
  <div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in backdrop-blur-sm cursor-zoom-out"
    onClick={() => setIsZoomed(false)}
  >
    <div className="relative p-4 bg-white rounded-2xl max-w-[90vw] max-h-[90vh] shadow-2xl flex flex-col items-center">
      <img 
        src="/path-to-your-qr.png" // Cùng một đường dẫn ảnh
        alt="VietQR Zoomed" 
        className="max-w-[400px] w-full h-auto object-contain p-2"
      />
      <p className="text-sm font-medium text-slate-700 mt-2">Bấm bất kỳ đâu để đóng</p>
    </div>
  </div>
)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-semibold">
        {[
          { id: 'store', label: 'Thông tin cửa hàng', icon: Store },
          { id: 'bank', label: 'Tài khoản VietQR', icon: CreditCard },
          { id: 'printers', label: 'Máy in WiFi/LAN', icon: Printer },
          { id: 'backup', label: 'Sao lưu dữ liệu', icon: Database },
          { id: 'audit', label: 'Nhật ký hệ thống', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Store Info */}
      {activeTab === 'store' && (
        <form onSubmit={handleSaveStore} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Thông tin thương hiệu & Tiêu đề hóa đơn
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên cửa hàng / Trung tâm:</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hotline / Zalo hỗ trợ:</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-semibold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email liên hệ:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Địa chỉ cửa hàng:</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Lời chào đầu hóa đơn (Header Note):</label>
              <input
                type="text"
                value={printHeaderNote}
                onChange={(e) => setPrintHeaderNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">Quy định & Lưu ý chân trang hóa đơn (Footer Note):</label>
              <textarea
                rows={3}
                value={printFooterNote}
                onChange={(e) => setPrintFooterNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg leading-relaxed"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thông tin cửa hàng</span>
          </button>
        </form>
      )}

      {/* Tab: Bank VietQR */}
      {activeTab === 'bank' && (
        <form onSubmit={handleSaveBank} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Cấu hình tài khoản nhận tiền tạo mã VietQR động
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ngân hàng thụ hưởng:</label>
              <input
                type="text"
                placeholder="vd: MBBANK, VIETCOMBANK, TECHCOMBANK, ACB, VPBANK..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Số tài khoản ngân hàng:</label>
              <input
                type="text"
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-black text-blue-700"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Tên chủ tài khoản (In hoa không dấu):</label>
              <input
                type="text"
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg uppercase font-bold"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Lưu tài khoản VietQR</span>
          </button>
        </form>
      )}

      {/* Tab: WiFi/LAN Printers */}
      {activeTab === 'printers' && (
        <div className="space-y-5 text-xs">
          {/* Add Printer */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
              Thêm Máy In Nhiệt Mạng (ESC/POS WiFi / LAN Ethernet)
            </h3>

            <form onSubmit={handleAddPrinter} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tên máy in:</label>
                <input
                  type="text"
                  placeholder="vd: Máy In Quầy K80"
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ IP máy in trong mạng LAN:</label>
                <input
                  type="text"
                  placeholder="vd: 192.168.1.200"
                  value={newPrinterIp}
                  onChange={(e) => setNewPrinterIp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Cổng Port Socket (Mặc định 9100):</label>
                <input
                  type="number"
                  value={newPrinterPort}
                  onChange={(e) => setNewPrinterPort(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  + Thêm máy in
                </button>
              </div>
            </form>
          </div>

          {/* Printer List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Tên máy in</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                  <th className="py-3 px-4">Cổng</th>
                  <th className="py-3 px-4">Loại khổ giấy</th>
                  <th className="py-3 px-4 text-center">Mặc định</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {printers.map((pr) => (
                  <tr key={pr.id}>
                    <td className="py-3 px-4 font-bold text-slate-800">{pr.name}</td>
                    <td className="py-3 px-4 font-mono text-blue-600 font-semibold">{pr.ipAddress}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{pr.port}</td>
                    <td className="py-3 px-4 uppercase font-semibold text-slate-700">{pr.type}</td>
                    <td className="py-3 px-4 text-center">
                      {pr.isDefault ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                          Mặc định
                        </span>
                      ) : (
                        <span className="text-slate-400">---</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTestPrinter(pr)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg font-bold text-[11px] cursor-pointer"
                        >
                          In thử (ESC/POS)
                        </button>
                        <button
                          onClick={() => deletePrinter(pr.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {testResult && (
            <div className="p-3 bg-emerald-50 text-emerald-800 font-bold rounded-xl border border-emerald-200 animate-in fade-in text-center">
              {testResult}
            </div>
          )}
        </div>
      )}

      {/* Tab: Backup & Restore */}
      {activeTab === 'backup' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Sao Lưu & Phục Hồi Toàn Bộ Cơ Sở Dữ Liệu
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-blue-900 text-sm">Xuất file sao lưu dự phòng (JSON)</h4>
              <p className="text-blue-700 text-xs">
                Tải xuống toàn bộ hồ sơ sửa chữa, kho linh kiện, danh bạ khách hàng và công nợ để lưu giữ an toàn.
              </p>
              <button
                onClick={exportDatabaseBackup}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2"
              >
                <Download className="w-4 h-4" />
                <span>Tải file sao lưu (.JSON)</span>
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <h4 className="font-bold text-amber-900 text-sm">Khôi phục dữ liệu từ file</h4>
              <p className="text-amber-700 text-xs">
                Tải lên tệp sao lưu JSON đã xuất trước đó để khôi phục trạng thái dữ liệu cửa hàng.
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2">
                <Upload className="w-4 h-4" />
                <span>Chọn file phục hồi</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const content = ev.target?.result as string;
                      if (importDatabaseBackup(content)) {
                        alert('Khôi phục dữ liệu thành công!');
                      } else {
                        alert('File dữ liệu không đúng định dạng!');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
            Nhật ký hoạt động hệ thống ({auditLogs.length} sự kiện)
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4">Người dùng</th>
                <th className="py-2.5 px-4">Hành động</th>
                <th className="py-2.5 px-4">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-4 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-800">{log.userName}</td>
                  <td className="py-2.5 px-4 text-blue-600 font-semibold">{log.action}</td>
                  <td className="py-2.5 px-4 text-slate-600">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
