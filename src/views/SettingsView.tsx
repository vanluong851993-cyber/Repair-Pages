import React, { useMemo, useState } from 'react';
import {
  Settings as SettingsIcon,
  Store,
  Printer,
  CreditCard,
  Database,
  History,
  Save,
  Trash2,
  Download,
  Upload,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PrinterConfig } from '../types';

type TabId = 'store' | 'bank' | 'printers' | 'backup' | 'audit';

const inputClass =
  'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    printers,
    updatePrinters,
    testPrinter,
    auditLogs,
    backupDatabase,
    restoreDatabase,
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabId>('store');

  const [storeName, setStoreName] = useState(settings.storeName ?? '');
  const [phone, setPhone] = useState(settings.phone ?? '');
  const [email, setEmail] = useState(settings.email ?? '');
  const [address, setAddress] = useState(settings.address ?? '');
  const [website, setWebsite] = useState(settings.website ?? '');
  const [printHeaderNote, setPrintHeaderNote] = useState(
    settings.printHeaderNote ?? '',
  );
  const [printFooterNote, setPrintFooterNote] = useState(
    settings.printFooterNote ?? '',
  );

  const [bankName, setBankName] = useState(settings.bankName ?? '');
  const [bankAccount, setBankAccount] = useState(settings.bankAccount ?? '');
  const [bankAccountName, setBankAccountName] = useState(
    settings.bankAccountName ?? '',
  );

  const [newPrinterName, setNewPrinterName] = useState(
    'Máy In Hóa Đơn Quầy (K80)',
  );
  const [newPrinterIp, setNewPrinterIp] = useState('');
  const [newPrinterPort, setNewPrinterPort] = useState('9100');
  const [newPrinterType, setNewPrinterType] =
    useState<PrinterConfig['type']>('k80');

  const [testResult, setTestResult] = useState<string>('');
  const [testingPrinterId, setTestingPrinterId] = useState<string | null>(
    null,
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const qrUrl = useMemo(() => {
    const bank = bankName.trim().toUpperCase();
    const account = bankAccount.trim();
    const owner = bankAccountName.trim().toUpperCase();

    if (!bank || !account) return '';

    const query = owner
      ? `?accountName=${encodeURIComponent(owner)}`
      : '';

    return `https://img.vietqr.io/image/${encodeURIComponent(
      bank,
    )}-${encodeURIComponent(account)}-compact2.png${query}`;
  }, [bankName, bankAccount, bankAccountName]);

  const saveStore = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateSettings({
      storeName: storeName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      website: website.trim(),
      printHeaderNote: printHeaderNote.trim(),
      printFooterNote: printFooterNote.trim(),
    });

    window.alert('Đã lưu thông tin cửa hàng.');
  };

  const saveBank = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    updateSettings({
      bankName: bankName.trim().toUpperCase(),
      bankAccount: bankAccount.trim(),
      bankAccountName: bankAccountName.trim().toUpperCase(),
    });

    window.alert('Đã lưu thông tin VietQR.');
  };

  const addPrinter = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const name = newPrinterName.trim();
    const ip = newPrinterIp.trim();
    const port = Number(newPrinterPort);

    if (!name || !ip) {
      window.alert('Vui lòng nhập tên và IP máy in.');
      return;
    }

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      window.alert('Port phải là số nguyên từ 1 đến 65535.');
      return;
    }

    const printer: PrinterConfig = {
      id: `printer-${Date.now()}`,
      name,
      ipAddress: ip,
      port,
      type: newPrinterType,
      isDefault: printers.length === 0,
    };

    updatePrinters([...printers, printer]);

    setNewPrinterName('Máy In Hóa Đơn Quầy (K80)');
    setNewPrinterIp('');
    setNewPrinterPort('9100');
    setNewPrinterType('k80');
    setTestResult('');
  };

  const removePrinter = (printer: PrinterConfig) => {
    const remaining = printers.filter((item) => item.id !== printer.id);

    if (printer.isDefault && remaining.length > 0) {
      updatePrinters(
        remaining.map((item, index) => ({
          ...item,
          isDefault: index === 0,
        })),
      );
      return;
    }

    updatePrinters(remaining);
  };

  const runPrinterTest = async (printer: PrinterConfig) => {
    setTestingPrinterId(printer.id);
    setTestResult('');

    try {
      const result = await testPrinter(printer);

      setTestResult(
        result.success
          ? `✓ ${result.message || 'Kiểm tra máy in thành công.'}`
          : `✕ ${result.message || 'Kiểm tra máy in thất bại.'}`,
      );
    } catch (error) {
      setTestResult(
        `✕ ${
          error instanceof Error
            ? error.message
            : 'Không thể kiểm tra máy in.'
        }`,
      );
    } finally {
      setTestingPrinterId(null);
    }
  };

  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';

      if (!text) {
        window.alert('Không đọc được file sao lưu.');
        return;
      }

      const restored = restoreDatabase(text);

      window.alert(
        restored
          ? 'Khôi phục dữ liệu thành công.'
          : 'File sao lưu không đúng định dạng.',
      );

      event.target.value = '';
    };

    reader.onerror = () => {
      window.alert('Không thể đọc file sao lưu.');
      event.target.value = '';
    };

    reader.readAsText(file, 'utf-8');
  };

  const tabs: Array<{
    id: TabId;
    label: string;
    icon: React.ElementType;
  }> = [
    { id: 'store', label: 'Thông tin cửa hàng', icon: Store },
    { id: 'bank', label: 'Tài khoản VietQR', icon: CreditCard },
    { id: 'printers', label: 'Máy in WiFi/LAN', icon: Printer },
    { id: 'backup', label: 'Sao lưu dữ liệu', icon: Database },
    { id: 'audit', label: 'Nhật ký hệ thống', icon: History },
  ];

  return (
    <div className="space-y-5 pb-12">
      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-start gap-3">
          <SettingsIcon className="w-5 h-5 mt-0.5 text-slate-700" />
          <div>
            <h1 className="text-lg font-bold text-slate-800">
              Cài đặt hệ thống cửa hàng
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Cấu hình cửa hàng, VietQR, máy in nhiệt WiFi/LAN, sao lưu dữ liệu
              và nhật ký hệ thống.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center">
          <p className="text-xs text-slate-400 mb-2">
            {qrUrl
              ? 'Bấm vào mã QR để phóng to'
              : 'Nhập thông tin ngân hàng để tạo mã VietQR'}
          </p>

          <button
            type="button"
            onClick={() => qrUrl && setIsZoomed(true)}
            disabled={!qrUrl}
            className="disabled:cursor-not-allowed"
          >
            {qrUrl ? (
              <img
                src={qrUrl}
                alt="VietQR"
                className="w-40 h-40 object-contain border border-slate-200 rounded-xl p-2 bg-white shadow-sm"
              />
            ) : (
              <div className="w-40 h-40 border border-dashed border-slate-300 rounded-xl flex items-center justify-center text-center text-xs text-slate-400 p-4">
                Chưa có dữ liệu VietQR
              </div>
            )}
          </button>
        </div>
      </section>

      {isZoomed && qrUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setIsZoomed(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={qrUrl}
              alt="VietQR phóng to"
              className="max-w-[80vw] max-h-[75vh] object-contain"
            />
            <button
              type="button"
              onClick={() => setIsZoomed(false)}
              className="w-full mt-4 py-2 rounded-xl bg-slate-800 text-white font-semibold"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'store' && (
        <form
          onSubmit={saveStore}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
            Thông tin cửa hàng
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Tên cửa hàng / Trung tâm">
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className={inputClass}
                required
              />
            </Field>

            <Field label="Hotline / Zalo">
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Website">
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>

            <div className="md:col-span-2">
              <Field label="Địa chỉ">
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Lời chào đầu hóa đơn">
                <input
                  value={printHeaderNote}
                  onChange={(e) => setPrintHeaderNote(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Ghi chú chân trang hóa đơn">
                <textarea
                  rows={4}
                  value={printFooterNote}
                  onChange={(e) => setPrintFooterNote(e.target.value)}
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </div>
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Lưu thông tin
          </button>
        </form>
      )}

      {activeTab === 'bank' && (
        <form
          onSubmit={saveBank}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4"
        >
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-3">
            Tài khoản VietQR
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Ngân hàng">
              <input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className={inputClass}
                placeholder="MBBANK, ACB, VCB..."
                required
              />
            </Field>

            <Field label="Số tài khoản">
              <input
                value={bankAccount}
                onChange={(e) => setBankAccount(e.target.value)}
                className={`${inputClass} font-mono`}
                required
              />
            </Field>

            <Field label="Tên chủ tài khoản">
              <input
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
                className={`${inputClass} uppercase`}
                required
              />
            </Field>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 text-blue-800 text-xs">
            Sau khi lưu, mã VietQR sẽ được tạo tự động từ thông tin trên.
          </div>

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Lưu tài khoản VietQR
          </button>
        </form>
      )}

      {activeTab === 'printers' && (
        <div className="space-y-5">
          <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
              Máy in nhiệt WiFi / LAN
            </h2>

            <form
              onSubmit={addPrinter}
              className="grid grid-cols-1 md:grid-cols-5 gap-3"
            >
              <Field label="Tên máy in">
                <input
                  value={newPrinterName}
                  onChange={(e) => setNewPrinterName(e.target.value)}
                  className={inputClass}
                  required
                />
              </Field>

              <Field label="Địa chỉ IP">
                <input
                  value={newPrinterIp}
                  onChange={(e) => setNewPrinterIp(e.target.value)}
                  className={`${inputClass} font-mono`}
                  placeholder="192.168.1.200"
                  required
                />
              </Field>

              <Field label="Port">
                <input
                  type="number"
                  min={1}
                  max={65535}
                  value={newPrinterPort}
                  onChange={(e) => setNewPrinterPort(e.target.value)}
                  className={`${inputClass} font-mono`}
                  required
                />
              </Field>

              <Field label="Khổ giấy">
                <select
                  value={newPrinterType}
                  onChange={(e) =>
                    setNewPrinterType(
                      e.target.value as PrinterConfig['type'],
                    )
                  }
                  className={inputClass}
                >
                  <option value="k80">K80</option>
                  <option value="k58">K58</option>
                  <option value="a4">A4</option>
                </select>
              </Field>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
                >
                  + Thêm máy in
                </button>
              </div>
            </form>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3">Tên máy in</th>
                  <th className="text-left px-4 py-3">IP</th>
                  <th className="text-left px-4 py-3">Port</th>
                  <th className="text-left px-4 py-3">Loại</th>
                  <th className="text-center px-4 py-3">Mặc định</th>
                  <th className="text-center px-4 py-3">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {printers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-10 text-slate-400"
                    >
                      Chưa có máy in.
                    </td>
                  </tr>
                ) : (
                  printers.map((printer) => (
                    <tr key={printer.id}>
                      <td className="px-4 py-3 font-semibold">
                        {printer.name}
                      </td>
                      <td className="px-4 py-3 font-mono text-blue-600">
                        {printer.ipAddress}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {printer.port}
                      </td>
                      <td className="px-4 py-3 uppercase">{printer.type}</td>
                      <td className="px-4 py-3 text-center">
                        {printer.isDefault ? (
                          <span className="inline-block px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                            Mặc định
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            type="button"
                            disabled={testingPrinterId === printer.id}
                            onClick={() => runPrinterTest(printer)}
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-100 disabled:opacity-50 text-xs font-semibold"
                          >
                            {testingPrinterId === printer.id
                              ? 'Đang test...'
                              : 'In thử'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Xóa máy in "${printer.name}"?`,
                                )
                              ) {
                                removePrinter(printer);
                              }
                            }}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50"
                            aria-label={`Xóa máy in ${printer.name}`}
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
            <div className="p-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold">
              {testResult}
            </div>
          )}
        </div>
      )}

      {activeTab === 'backup' && (
        <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
            Sao lưu và phục hồi dữ liệu
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
              <h3 className="font-bold text-blue-900">
                Sao lưu cơ sở dữ liệu
              </h3>
              <p className="text-sm text-blue-700 mt-1 mb-4">
                Xuất dữ liệu cửa hàng ra file JSON.
              </p>

              <button
                type="button"
                onClick={backupDatabase}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                Tải file sao lưu
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <h3 className="font-bold text-amber-900">
                Phục hồi cơ sở dữ liệu
              </h3>
              <p className="text-sm text-amber-700 mt-1 mb-4">
                Chọn file JSON đã sao lưu trước đó.
              </p>

              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 text-white font-semibold cursor-pointer hover:bg-amber-700">
                <Upload className="w-4 h-4" />
                Chọn file JSON
                <input
                  type="file"
                  accept=".json,application/json"
                  className="hidden"
                  onChange={importBackup}
                />
              </label>
            </div>
          </div>
        </section>
      )}

      {activeTab === 'audit' && (
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold">
            Nhật ký hệ thống ({auditLogs.length})
          </div>

          <table className="w-full min-w-[720px] text-sm">
            <thead className="border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left">Thời gian</th>
                <th className="px-4 py-3 text-left">Người dùng</th>
                <th className="px-4 py-3 text-left">Hành động</th>
                <th className="px-4 py-3 text-left">Chi tiết</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {auditLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Chưa có nhật ký.
                  </td>
                </tr>
              ) : (
                auditLogs.slice(0, 50).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-4 py-3 font-semibold">
                      {log.userName}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-semibold">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
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
    <label className="block mb-1.5 text-xs font-semibold text-slate-700">
      {label}
    </label>
    {children}
  </div>
);

export default SettingsView;
