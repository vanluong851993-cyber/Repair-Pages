import React, { useEffect, useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  CreditCard,
  Database,
  History,
  Save,
  Download,
  Upload,
  Trash2,
  Wifi,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrinterConfig } from '../types';

type SettingsTab = 'store' | 'bank' | 'printers' | 'backup' | 'audit';

const SettingsView: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<SettingsTab>('store');
  const [isZoomed, setIsZoomed] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Store
  const [storeName, setStoreName] = useState(settings.storeName ?? '');
  const [phone, setPhone] = useState(settings.phone ?? '');
  const [email, setEmail] = useState(settings.email ?? '');
  const [address, setAddress] = useState(settings.address ?? '');
  const [website, setWebsite] = useState(settings.website ?? '');
  const [printHeaderNote, setPrintHeaderNote] = useState(
    settings.printHeaderNote ?? ''
  );
  const [printFooterNote, setPrintFooterNote] = useState(
    settings.printFooterNote ?? ''
  );

  // Bank / VietQR
  const [bankName, setBankName] = useState(settings.bankName ?? '');
  const [bankAccount, setBankAccount] = useState(settings.bankAccount ?? '');
  const [bankAccountName, setBankAccountName] = useState(
    settings.bankAccountName ?? ''
  );

  // Printer
  const [newPrinterName, setNewPrinterName] = useState(
    'Máy In Hóa Đơn Quầy (K80)'
  );
  const [newPrinterIp, setNewPrinterIp] = useState('');
  const [newPrinterPort, setNewPrinterPort] = useState(9100);
  const [newPrinterType, setNewPrinterType] = useState<
    'k80' | 'k58' | 'a4'
  >('k80');

  useEffect(() => {
    setStoreName(settings.storeName ?? '');
    setPhone(settings.phone ?? '');
    setEmail(settings.email ?? '');
    setAddress(settings.address ?? '');
    setWebsite(settings.website ?? '');
    setPrintHeaderNote(settings.printHeaderNote ?? '');
    setPrintFooterNote(settings.printFooterNote ?? '');
    setBankName(settings.bankName ?? '');
    setBankAccount(settings.bankAccount ?? '');
    setBankAccountName(settings.bankAccountName ?? '');
  }, [settings]);

  const handleSaveStore = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateSettings({
      storeName: storeName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      website: website.trim(),
      printHeaderNote: printHeaderNote.trim(),
      printFooterNote: printFooterNote.trim(),
    });

    alert('Đã cập nhật thông tin cửa hàng thành công!');
  };

  const handleSaveBank = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateSettings({
      bankName: bankName.trim().toUpperCase(),
      bankAccount: bankAccount.trim(),
      bankAccountName: bankAccountName.trim().toUpperCase(),
    });

    alert('Đã cập nhật thông tin tài khoản VietQR thành công!');
  };

  const handleAddPrinter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const name = newPrinterName.trim();
    const ipAddress = newPrinterIp.trim();
    const port = Number(newPrinterPort);

    if (!name || !ipAddress) {
      alert('Vui lòng nhập tên máy in và địa chỉ IP.');
      return;
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      alert('Port phải là số nguyên từ 1 đến 65535.');
      return;
    }

    addPrinter({
      name,
      ipAddress,
      port,
      type: newPrinterType,
      isDefault: printers.length === 0,
    });

    setNewPrinterName('Máy In Hóa Đơn Quầy (K80)');
    setNewPrinterIp('');
    setNewPrinterPort(9100);
    setNewPrinterType('k80');
  };

  const handleTestPrinter = async (printer: PrinterConfig) => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await testPrinter(printer);
      setTestResult(
        `✓ ${result?.message || `Kết nối máy in "${printer.name}" thành công.`}`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Không thể kết nối tới máy in.';
      setTestResult(`✕ ${message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleDeletePrinter = (printer: PrinterConfig) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa máy in "${printer.name}" không?`
      )
    ) {
      deletePrinter(printer.id);
      setTestResult(null);
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type && file.type !== 'application/json') {
      alert('Vui lòng chọn đúng file sao lưu JSON.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result;

      if (typeof content !== 'string') {
        alert('Không đọc được file sao lưu.');
        e.target.value = '';
        return;
      }

      try {
        const success = importDatabaseBackup(content);
        alert(
          success
            ? 'Khôi phục dữ liệu thành công!'
            : 'File dữ liệu không đúng định dạng!'
        );
      } catch {
        alert('File sao lưu bị lỗi hoặc không đúng định dạng.');
      } finally {
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      alert('Không thể đọc file sao lưu.');
      e.target.value = '';
    };

    reader.readAsText(file, 'utf-8');
  };

  const tabs = [
    { id: 'store' as const, label: 'Thông tin cửa hàng', icon: Store },
    { id: 'bank' as const, label: 'Tài khoản VietQR', icon: CreditCard },
    { id: 'printers' as const, label: 'Máy in WIFI/LAN', icon: Printer },
    { id: 'backup' as const, label: 'Sao lưu dữ liệu', icon: Database },
    { id: 'audit' as const, label: 'Nhật ký hệ thống', icon: History },
  ];

  return (
    <div className="space-y-5 pb-12">
      <header className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-5 h-5 text-slate-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Cài Đặt Hệ Thống Cửa Hàng
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình hóa đơn, VietQR, máy in nhiệt WIFI/LAN và sao lưu dữ liệu.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-1">
            Bấm vào ảnh để phóng to mã QR
          </p>
          <button
            type="button"
            className="cursor-zoom-in"
            onClick={() => setIsZoomed(true)}
            aria-label="Phóng to mã VietQR"
          >
            <img
              src="/path-to-your-qr.png"
              alt="VietQR"
              className="w-36 h-36 border border-slate-200 rounded-xl p-2 bg-white hover:scale-105 transition-transform shadow-sm"
            />
          </button>
        </div>
      </header>

      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Mã VietQR phóng to"
        >
          <div
            className="relative p-4 bg-white rounded-2xl max-w-[90vw] max-h-[90vh] shadow-2xl flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="absolute top-2 right-2 rounded-full bg-slate-100 hover:bg-slate-200 px-3 py-1 font-bold"
              aria-label="Đóng"
            >
              ×
            </button>
            <img
              src="/path-to-your-qr.png"
              alt="VietQR phóng to"
              className="max-w-[400px] max-h-[70vh] w-full h-auto object-contain p-2"
            />
            <p className="text-sm font-medium text-slate-700 mt-2">
              Bấm ra ngoài hoặc nút × để đóng
            </p>
          </div>
        </div>
      )}

      <nav
        className="flex items-center gap-1.5 overflow-x-auto bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm text-xs font-semibold"
        aria-label="Cài đặt"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {activeTab === 'store' && (
        <form
          onSubmit={handleSaveStore}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
        >
          <h2 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Thông tin thương hiệu & tiêu đề hóa đơn
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Tên cửa hàng / Trung tâm">
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Hotline / Zalo hỗ trợ">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Email liên hệ">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Địa chỉ cửa hàng">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Website">
              <input
                type="url"
                placeholder="https://example.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Lời chào đầu hóa đơn (Header Note)">
              <input
                type="text"
                value={printHeaderNote}
                onChange={(e) => setPrintHeaderNote(e.target.value)}
                className="input"
              />
            </Field>

            <div className="sm:col-span-2">
              <Field label="Quy định & lưu ý chân trang hóa đơn (Footer Note)">
                <textarea
                  rows={3}
                  value={printFooterNote}
                  onChange={(e) => setPrintFooterNote(e.target.value)}
                  className="input leading-relaxed resize-y"
                />
              </Field>
            </div>
          </div>

          <SaveButton label="Lưu thông tin cửa hàng" />
        </form>
      )}

      {activeTab === 'bank' && (
        <form
          onSubmit={handleSaveBank}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs"
        >
          <h2 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Cấu hình tài khoản nhận tiền tạo mã VietQR động
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Ngân hàng thụ hưởng">
              <input
                type="text"
                required
                placeholder="MBBANK, VIETCOMBANK, ACB..."
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="input uppercase font-bold"
              />
            </Field>

            <Field label="Số tài khoản ngân hàng">
              <input
                type="text"
                required
                inputMode="numeric"
                value={bankAccount}
                onChange={(e) =>
                  setBankAccount(e.target.value.replace(/\s/g, ''))
                }
                className="input font-mono font-black text-blue-700"
              />
            </Field>

            <Field label="Tên chủ tài khoản">
              <input
                type="text"
                required
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className="input uppercase font-bold"
              />
            </Field>
          </div>

          <SaveButton label="Lưu tài khoản VietQR" />
        </form>
      )}

      {activeTab === 'printers' && (
        <div className="space-y-5 text-xs">
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2 mb-4">
              Thêm máy in nhiệt mạng (ESC/POS WiFi / LAN Ethernet)
            </h2>

            <form
              onSubmit={handleAddPrinter}
              className="grid grid-cols-1 sm:grid-cols-5 gap-3"
            >
              <Field label="Tên máy in">
                <input
                  type="text"
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  className="input"
                />
              </Field>

              <Field label="Địa chỉ IP">
                <input
                  type="text"
                  required
                  placeholder="192.168.1.200"
                  value={newPrinterIp}
                  onChange={(e) => setNewPrinterIp(e.target.value)}
                  className="input font-mono"
                />
              </Field>

              <Field label="Port">
                <input
                  type="number"
                  min={1}
                  max={65535}
                  value={newPrinterPort}
                  onChange={(e) => setNewPrinterPort(Number(e.target.value))}
                  className="input font-mono"
                />
              </Field>

              <Field label="Khổ giấy">
                <select
                  value={newPrinterType}
                  onChange={(e) =>
                    setNewPrinterType(
                      e.target.value as 'k80' | 'k58' | 'a4'
                    )
                  }
                  className="input"
                >
                  <option value="k80">K80</option>
                  <option value="k58">K58</option>
                  <option value="a4">A4</option>
                </select>
              </Field>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm"
                >
                  + Thêm máy in
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <th className="py-3 px-4">Tên máy in</th>
                  <th className="py-3 px-4">Địa chỉ IP</th>
                  <th className="py-3 px-4">Cổng</th>
                  <th className="py-3 px-4">Loại</th>
                  <th className="py-3 px-4 text-center">Mặc định</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {printers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-8 px-4 text-center text-slate-400"
                    >
                      Chưa có máy in nào được cấu hình.
                    </td>
                  </tr>
                ) : (
                  printers.map((printer) => (
                    <tr key={printer.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {printer.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-600 font-semibold">
                        {printer.ipAddress}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {printer.port}
                      </td>
                      <td className="py-3 px-4 uppercase font-semibold text-slate-700">
                        {printer.type}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {printer.isDefault ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Mặc định
                          </span>
                        ) : (
                          <span className="text-slate-400">---</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            disabled={isTesting}
                            onClick={() => handleTestPrinter(printer)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 rounded-lg font-bold text-[11px]"
                          >
                            {isTesting ? 'Đang test...' : 'In thử ESC/POS'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeletePrinter(printer)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                            aria-label={`Xóa ${printer.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          {testResult && (
            <div
              className={`p-3 font-bold rounded-xl border text-center flex items-center justify-center gap-2 ${
                testResult.startsWith('✓')
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {testResult.startsWith('✓') ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              {testResult}
            </div>
          )}
        </div>
      )}

      {activeTab === 'backup' && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-bold text-sm text-slate-800 border-b border-slate-100 pb-2">
            Sao lưu & phục hồi toàn bộ cơ sở dữ liệu
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-blue-900 text-sm">
                Xuất file sao lưu dự phòng (JSON)
              </h3>
              <p className="text-blue-700">
                Tải xuống toàn bộ hồ sơ sửa chữa, kho linh kiện, khách hàng và
                công nợ để lưu giữ an toàn.
              </p>
              <button
                type="button"
                onClick={exportDatabaseBackup}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm mt-2"
              >
                <Download className="w-4 h-4" />
                Tải file sao lưu (.JSON)
              </button>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
              <h3 className="font-bold text-amber-900 text-sm">
                Khôi phục dữ liệu từ file
              </h3>
              <p className="text-amber-700">
                Chọn tệp JSON đã xuất trước đó để khôi phục dữ liệu cửa hàng.
              </p>

              <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm cursor-pointer mt-2">
                <Upload className="w-4 h-4" />
                Chọn file phục hồi
                <input
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleImportBackup}
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'audit' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto text-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
            Nhật ký hoạt động hệ thống ({auditLogs.length} sự kiện)
          </div>

          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-2.5 px-4">Thời gian</th>
                <th className="py-2.5 px-4">Người dùng</th>
                <th className="py-2.5 px-4">Hành động</th>
                <th className="py-2.5 px-4">Chi tiết</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="py-8 px-4 text-center text-slate-400"
                  >
                    Chưa có nhật ký hoạt động.
                  </td>
                </tr>
              ) : (
                auditLogs.slice(0, 20).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-800">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-4 text-blue-600 font-semibold">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">
                      {log.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field: React.FC<FieldProps> = ({ label, children }) => (
  <div>
    <label className="font-semibold text-slate-700 block mb-1">{label}</label>
    {children}
  </div>
);

interface SaveButtonProps {
  label: string;
}

const SaveButton: React.FC<SaveButtonProps> = ({ label }) => (
  <button
    type="submit"
    className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors"
  >
    <Save className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export default SettingsView;
