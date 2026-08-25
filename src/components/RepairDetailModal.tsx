import React, { useState } from 'react';
import {
  X,
  Wrench,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Zap,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  QrCode,
  Printer,
  ShieldCheck,
  Image,
  History,
  FileText,
  Save,
  Loader2,
  ChevronDown,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatVND,
  formatDateTime,
  formatDate,
  repairStatusConfig,
  deviceTypeLabels,
  generateVietQRUrl
} from '../utils/formatters';
import { RepairOrder, RepairStatus, UsedPart } from '../types';
import confetti from 'canvas-confetti';

interface RepairDetailModalProps {
  orderId: string;
  onClose: () => void;
  onOpenPrintModal: (orderId: string) => void;
}

export const RepairDetailModal: React.FC<RepairDetailModalProps> = ({
  orderId,
  onClose,
  onOpenPrintModal,
}) => {
  const {
    repairOrders,
    updateRepairOrder,
    updateRepairStatus,
    addPaymentToRepair,
    addUsedPartToRepair,
    removeUsedPartFromRepair,
    products,
    users,
    settings,
  } = useApp();

  const order = repairOrders.find((o) => o.id === orderId);

  const [activeTab, setActiveTab] = useState<'info' | 'tech' | 'ai' | 'parts' | 'payment' | 'images' | 'history'>('tech');

  // Technical sheet form state
  const [techSheet, setTechSheet] = useState(order?.techSheet || {
    inputVoltage: '',
    standbyCurrent: '',
    vcore: '',
    ramVoltage: '',
    vgaVoltage: '',
    chipsetVoltage: '',
    biosStatus: '',
    ecStatus: '',
    vrmStatus: '',
    tempC: '',
    boardCondition: '',
    diagnosedFault: '',
    rootCause: '',
    damagedParts: '',
    repairMethod: '',
    techNotes: '',
  });

  // Financial inputs
  const [laborFee, setLaborFee] = useState(order?.laborFee || 0);
  const [otherServicesFee, setOtherServicesFee] = useState(order?.otherServicesFee || 0);
  const [discount, setDiscount] = useState(order?.discount || 0);
  const [warrantyPeriod, setWarrantyPeriod] = useState(order?.warrantyPeriod || '3 tháng');

  // Add Part selection
  const [selectedProductId, setSelectedProductId] = useState('');
  const [partQty, setPartQty] = useState(1);

  // Payment form
  const [payAmount, setPayAmount] = useState(order?.remainingDebt || 0);
  const [payMethod, setPayMethod] = useState<'cash' | 'transfer' | 'qr'>('qr');
  const [payNote, setPayNote] = useState('');

  // AI Diagnostic State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<string | null>(null);

  // Status transition note
  const [statusNote, setStatusNote] = useState('');

  if (!order) return null;

  // Handle Save Tech Sheet
  const handleSaveTechSheet = () => {
    updateRepairOrder(order.id, {
      techSheet,
      laborFee,
      otherServicesFee,
      discount,
      warrantyPeriod,
    });
    alert('Đã lưu nhật ký kỹ thuật & bảng giá thành công!');
  };

  // Handle Add Part
  const handleAddPart = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;
    if (prod.stock < partQty) {
      alert(`Linh kiện "${prod.name}" trong kho chỉ còn ${prod.stock} cái!`);
      return;
    }
    const part: UsedPart = {
      productId: prod.id,
      productCode: prod.code,
      productName: prod.name,
      quantity: Number(partQty),
      costPrice: prod.costPrice,
      unitPrice: prod.sellingPrice,
      warrantyMonths: prod.warrantyMonths,
    };
    addUsedPartToRepair(order.id, part);
    setSelectedProductId('');
    setPartQty(1);
  };

  // Handle Gemini AI Diagnostic
  const handleRunAiDiagnostic = async () => {
    setAiLoading(true);
    setAiDiagnosis(null);
    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceType: order.deviceType,
          brand: order.brand,
          model: order.model,
          faultDescription: order.reportedIssue + (techSheet.diagnosedFault ? ` - ${techSheet.diagnosedFault}` : ''),
          measurements: techSheet,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiDiagnosis(data.diagnosis);
      } else {
        setAiDiagnosis('Không thể chẩn đoán: ' + (data.error || 'Lỗi server'));
      }
    } catch (err: any) {
      setAiDiagnosis('Lỗi kết nối AI: ' + err.message);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Payment Submit
  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) return;
    addPaymentToRepair(order.id, Number(payAmount), payMethod, payNote);
    if (payAmount >= order.remainingDebt) {
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
    }
    setPayAmount(0);
    setPayNote('');
  };

  // Fast Status Change
  const handleStatusChange = (newStatus: RepairStatus) => {
    updateRepairStatus(order.id, newStatus, statusNote || `Chuyển trạng thái sang "${repairStatusConfig[newStatus]?.label || newStatus}"`);
    setStatusNote('');
    if (newStatus === 'da_giao') {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    }
  };

  // Calculate profit
  const partsCost = order.usedParts.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  const profit = Math.max(0, order.totalAmount - partsCost);

  // Dynamic QR Url
  const qrTransferUrl = generateVietQRUrl(
    settings.bankAccount,
    settings.bankName,
    order.remainingDebt,
    `${order.code} ${order.customerName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()}`,
    settings.bankAccountName
  );

  const statusCfg = repairStatusConfig[order.status] || { label: order.status, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-300' };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-black tracking-wide text-blue-400">{order.code}</span>
                <span className="text-xs text-slate-400">|</span>
                <span className="font-semibold text-sm">{order.brand} {order.model}</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusCfg.bg} ${statusCfg.color}`}>
                  {statusCfg.label}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Khách: <strong className="text-slate-200">{order.customerName}</strong> ({order.customerPhone}) - Tiếp nhận: {formatDateTime(order.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPrintModal(order.id)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4 text-blue-400" />
              <span>In phiếu / Tem</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Status Transition Bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Trạng thái phiếu:</span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value as RepairStatus)}
              className="px-3 py-1 bg-white border border-slate-300 rounded-lg font-bold text-blue-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              {(Object.keys(repairStatusConfig) as RepairStatus[]).map((st) => (
                <option key={st} value={st}>
                  {repairStatusConfig[st].label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            {order.status === 'cho_khach_duyet' && (
              <button
                onClick={() => handleStatusChange('dang_sua')}
                className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                ✓ Khách đồng ý sửa
              </button>
            )}

            {order.status === 'dang_sua' && (
              <button
                onClick={() => handleStatusChange('sua_xong')}
                className="px-3 py-1 bg-teal-600 text-white font-bold rounded-lg shadow-xs hover:bg-teal-700 transition-colors cursor-pointer"
              >
                ✓ Đã sửa xong → Chuyển Test
              </button>
            )}

            {order.status === 'cho_khach_nhan' && (
              <button
                onClick={() => handleStatusChange('da_giao')}
                className="px-3 py-1 bg-indigo-600 text-white font-bold rounded-lg shadow-xs hover:bg-indigo-700 transition-colors cursor-pointer flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Giao máy & Kích hoạt bảo hành</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-200 bg-white overflow-x-auto custom-scrollbar text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('tech')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'tech'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Khám máy & Đo điện áp</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'ai'
                ? 'border-purple-600 text-purple-600 bg-purple-50/50'
                : 'border-transparent text-slate-500 hover:text-purple-700'
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>AI Chẩn đoán vi mạch</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'parts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Linh kiện & Báo giá ({order.usedParts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'payment'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Thu tiền & VietQR</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'info'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-slate-500" />
            <span>Thông tin tiếp nhận</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'images'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Image className="w-4 h-4 text-indigo-500" />
            <span>Hình ảnh bo mạch</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4 text-slate-400" />
            <span>Lịch sử trạng thái</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-slate-50/50">
          
          {/* TAB 1: TECHNICAL SHEET & MEASUREMENTS */}
          {activeTab === 'tech' && (
            <div className="space-y-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Nhật ký đo đạc vi mạch & Kiểm tra kỹ thuật</span>
                  </h3>
                  <span className="text-xs text-slate-400">Đồng hồ VOM / Dao động ký / Máy cấp dòng</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Điện áp đầu vào (V):</label>
                    <input
                      type="text"
                      placeholder="vd: 19.5V, 12V PCIE"
                      value={techSheet.inputVoltage || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, inputVoltage: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Dòng Standby ăn nguồn (A):</label>
                    <input
                      type="text"
                      placeholder="vd: 0.005A, Chập B+"
                      value={techSheet.standbyCurrent || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, standbyCurrent: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nguồn VCORE / CPU:</label>
                    <input
                      type="text"
                      placeholder="vd: 0.85V OK, Mất áp"
                      value={techSheet.vcore || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, vcore: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nguồn RAM (1.2V/1.35V):</label>
                    <input
                      type="text"
                      placeholder="vd: 1.2V OK"
                      value={techSheet.ramVoltage || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, ramVoltage: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nguồn GPU / VRAM:</label>
                    <input
                      type="text"
                      placeholder="vd: NVVDD 0.8V, FBVDDQ 1.35V"
                      value={techSheet.vgaVoltage || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, vgaVoltage: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">ROM BIOS / FW ME:</label>
                    <input
                      type="text"
                      placeholder="vd: Lỗi BIOS, Cần Clean ME"
                      value={techSheet.biosStatus || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, biosStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Chip EC / SIO / KBC:</label>
                    <input
                      type="text"
                      placeholder="vd: IT8586E OK"
                      value={techSheet.ecStatus || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, ecStatus: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Nhiệt độ Full Load (°C):</label>
                    <input
                      type="text"
                      placeholder="vd: 65°C Furmark"
                      value={techSheet.tempC || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, tempC: e.target.value })}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tình trạng bo mạch / Mainboard:</label>
                    <input
                      type="text"
                      placeholder="vd: Mainboard zin chưa sửa, có dấu vết rỉ sét chân IC nguồn..."
                      value={techSheet.boardCondition || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, boardCondition: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Lỗi phát hiện chính xác:</label>
                    <input
                      type="text"
                      placeholder="vd: Chập MOSFET nguồn đầu vào 19V PQ101 (AON6414)"
                      value={techSheet.diagnosedFault || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, diagnosedFault: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 font-semibold text-red-600"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nguyên nhân hư hỏng:</label>
                    <textarea
                      rows={2}
                      placeholder="vd: Dùng sạc không rõ nguồn gốc gây xung sét..."
                      value={techSheet.rootCause || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, rootCause: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Phương án sửa chữa & Khắc phục:</label>
                    <textarea
                      rows={2}
                      placeholder="vd: Xả tụ chập, thay cặp MOSFET AON6414 mới, vệ sinh tra keo MX-4..."
                      value={techSheet.repairMethod || ''}
                      onChange={(e) => setTechSheet({ ...techSheet, repairMethod: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={handleSaveTechSheet}
                    className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu nhật ký kỹ thuật</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AI HARDWARE DIAGNOSTIC ASSISTANT */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-800/50 shadow-md">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-white flex items-center gap-2">
                        <span>Trợ lý Chẩn Đoán Phần Cứng AI (Gemini)</span>
                      </h3>
                      <p className="text-xs text-indigo-200 mt-0.5">
                        Phân tích sơ đồ schematic, nguyên lý mạch, thứ tự mở nguồn (Power Sequence) & mã lỗi VRAM/BIOS.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRunAiDiagnostic}
                    disabled={aiLoading}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>{aiLoading ? 'Đang phân tích mạch...' : 'Chẩn đoán vi mạch ngay'}</span>
                  </button>
                </div>
              </div>

              {/* AI Result Viewer */}
              {aiDiagnosis ? (
                <div className="bg-white p-5 rounded-2xl border border-purple-200 shadow-xs prose prose-sm max-w-none text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                  {aiDiagnosis}
                </div>
              ) : (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 space-y-2">
                  <Cpu className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
                  <div className="text-xs font-semibold text-slate-600">Chưa có kết quả phân tích</div>
                  <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                    Nhấn nút "Chẩn đoán vi mạch ngay" ở trên để AI đọc mô tả lỗi và thông số đo đạc thực tế của thiết bị ({order.brand} {order.model}).
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PARTS & PRICING */}
          {activeTab === 'parts' && (
            <div className="space-y-5">
              {/* Add Part Form */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Xuất linh kiện từ kho lắp vào máy (Tự động trừ tồn kho)</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-600 block mb-1">Chọn linh kiện trong kho:</label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="">-- Chọn linh kiện / IC / VRAM / MOSFET --</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                          {p.name} (Tồn: {p.stock} | Giá: {formatVND(p.sellingPrice)})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Số lượng:</label>
                    <input
                      type="number"
                      min={1}
                      value={partQty}
                      onChange={(e) => setPartQty(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={handleAddPart}
                      disabled={!selectedProductId}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer text-xs"
                    >
                      + Thêm linh kiện
                    </button>
                  </div>
                </div>
              </div>

              {/* Used Parts Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-3 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700">
                  Danh sách linh kiện đã sử dụng cho phiếu #{order.code}
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-100 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-4">Linh kiện</th>
                      <th className="py-2.5 px-4 text-center">SL</th>
                      <th className="py-2.5 px-4 text-right">Giá vốn</th>
                      <th className="py-2.5 px-4 text-right">Đơn giá bán</th>
                      <th className="py-2.5 px-4 text-right">Thành tiền</th>
                      <th className="py-2.5 px-4 text-center">Bảo hành</th>
                      <th className="py-2.5 px-4 text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {order.usedParts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-6 text-center text-slate-400">
                          Chưa sử dụng linh kiện kho nào (chỉ tính công sửa hoặc khách mang linh kiện đến).
                        </td>
                      </tr>
                    ) : (
                      order.usedParts.map((p) => (
                        <tr key={p.productId} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            <div>{p.productName}</div>
                            <div className="text-[10px] text-slate-400">{p.productCode}</div>
                          </td>
                          <td className="py-3 px-4 text-center font-bold">{p.quantity}</td>
                          <td className="py-3 px-4 text-right text-slate-500">{formatVND(p.costPrice)}</td>
                          <td className="py-3 px-4 text-right font-medium text-slate-700">{formatVND(p.unitPrice)}</td>
                          <td className="py-3 px-4 text-right font-bold text-blue-600">{formatVND(p.quantity * p.unitPrice)}</td>
                          <td className="py-3 px-4 text-center text-slate-600">{p.warrantyMonths} tháng</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => removeUsedPartFromRepair(order.id, p.productId)}
                              className="p-1 rounded-md text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Xóa linh kiện & Hoàn lại kho"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pricing & Labor breakdown */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                <h4 className="font-bold text-xs uppercase text-slate-700 mb-3">
                  Bảng tính Báo giá & Chi phí dịch vụ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Tiền công thợ sửa (VND):</label>
                    <input
                      type="number"
                      value={laborFee}
                      onChange={(e) => setLaborFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Dịch vụ khác (Vệ sinh, Cài Win):</label>
                    <input
                      type="number"
                      value={otherServicesFee}
                      onChange={(e) => setOtherServicesFee(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Chiết khấu / Giảm giá (VND):</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 text-red-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-600 block mb-1">Thời hạn bảo hành:</label>
                    <select
                      value={warrantyPeriod}
                      onChange={(e) => setWarrantyPeriod(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 font-medium"
                    >
                      <option value="7 ngày">7 ngày</option>
                      <option value="15 ngày">15 ngày</option>
                      <option value="1 tháng">1 tháng</option>
                      <option value="3 tháng">3 tháng</option>
                      <option value="6 tháng">6 tháng</option>
                      <option value="12 tháng">12 tháng</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-slate-400">Giá vốn linh kiện:</span>
                      <span className="font-bold text-slate-700 ml-1.5">{formatVND(partsCost)}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Lợi nhuận ước tính:</span>
                      <span className="font-bold text-emerald-600 ml-1.5">{formatVND(profit)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Tổng tiền báo khách:</div>
                      <div className="text-lg font-black text-blue-600">{formatVND(order.totalAmount)}</div>
                    </div>
                    <button
                      onClick={handleSaveTechSheet}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Cập nhật báo giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENT & DYNAMIC VIETQR */}
          {activeTab === 'payment' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Payment Entry Form */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Thu tiền sửa chữa</span>
                </h3>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng giá trị đơn:</span>
                    <span className="font-bold text-slate-800">{formatVND(order.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đã thanh toán:</span>
                    <span className="font-bold text-emerald-600">{formatVND(order.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm">
                    <span className="font-bold text-slate-700">Còn nợ:</span>
                    <span className="font-black text-amber-600">{formatVND(order.remainingDebt)}</span>
                  </div>
                </div>

                <form onSubmit={handleRecordPayment} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Số tiền thu lần này (VND):</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 text-base font-black text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Hình thức thanh toán:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'cash', label: 'Tiền mặt' },
                        { id: 'transfer', label: 'Chuyển khoản' },
                        { id: 'qr', label: 'Quét VietQR' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setPayMethod(m.id as any)}
                          className={`py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            payMethod === m.id
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-400'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Ghi chú thu tiền:</label>
                    <input
                      type="text"
                      placeholder="vd: Thu đủ tiền khi nhận máy..."
                      value={payNote}
                      onChange={(e) => setPayNote(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={payAmount <= 0}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    Xác nhận thu tiền {formatVND(payAmount)}
                  </button>
                </form>
              </div>

              {/* Dynamic VietQR Display */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center justify-center text-center space-y-3">
                <div className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>Mã VietQR Tự Động Điền Tiền & Nội Dung</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner">
                  <img
                    src={qrTransferUrl}
                    alt="VietQR Payment"
                    className="w-48 h-48 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="text-xs text-slate-600 space-y-0.5">
                  <div className="font-bold text-slate-800">{settings.bankName}</div>
                  <div>STK: <strong className="text-blue-600">{settings.bankAccount}</strong></div>
                  <div>Chủ TK: <strong>{settings.bankAccountName}</strong></div>
                  <div className="text-[11px] text-slate-400">
                    Nội dung: <strong>{order.code} {order.customerName}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: INTAKE INFORMATION */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Thông tin thiết bị</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loại thiết bị:</span>
                    <span className="font-bold text-slate-800">{deviceTypeLabels[order.deviceType]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hãng & Model:</span>
                    <span className="font-bold text-slate-800">{order.brand} {order.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số Serial / IMEI:</span>
                    <span className="font-mono font-semibold text-slate-700">{order.serialNumber || '---'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mật khẩu máy:</span>
                    <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">{order.password || 'Không có'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngoại hình khi nhận:</span>
                    <span className="text-slate-700 text-right max-w-[200px]">{order.appearanceCondition || 'Bình thường'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Phụ kiện đi kèm:</span>
                    <span className="text-slate-700 text-right max-w-[200px]">{order.accessoriesIncluded || 'Không có'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 text-xs">
                <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Khách hàng & Phân công</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Khách hàng:</span>
                    <span className="font-bold text-slate-800">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Số điện thoại:</span>
                    <span className="font-bold text-blue-600">{order.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Kỹ thuật viên phụ trách:</span>
                    <span className="font-bold text-slate-800">{order.assignedTechnicianName || 'Chưa gán'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngày tiếp nhận:</span>
                    <span className="text-slate-700">{formatDateTime(order.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hẹn trả khách:</span>
                    <span className="font-bold text-red-600">{formatDateTime(order.appointmentDate)}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-slate-400 mb-1">Lỗi khách mô tả ban đầu:</div>
                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-800 font-medium">
                    {order.reportedIssue}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: CIRCUIT & DEVICE IMAGES */}
          {activeTab === 'images' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(order.images?.before || [
                  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80'
                ]).map((img, i) => (
                  <div key={i} className="rounded-xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100 group relative">
                    <img src={img} alt="Bo mạch" className="w-full h-40 object-cover group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white p-1.5 text-[10px] text-center backdrop-blur-xs">
                      {i === 0 ? 'Ngoại quan trước sửa' : 'Vị trí đo đạc bo mạch'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TIMELINE HISTORY */}
          {activeTab === 'history' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Nhật ký chuyển trạng thái & Tiến độ xử lý
              </h3>
              <div className="relative pl-6 border-l-2 border-blue-200 space-y-4">
                {order.statusHistory.map((h, i) => (
                  <div key={h.id || i} className="relative">
                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs"></div>
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                        {repairStatusConfig[h.status]?.label || h.status}
                      </span>
                      <span className="text-slate-400 font-normal">{formatDateTime(h.timestamp)}</span>
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      Bởi: <strong>{h.updatedBy}</strong> - {h.notes || 'Cập nhật tiến độ'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <div className="text-slate-500">
            Mã bảo hành: <strong className="font-mono text-blue-600">{order.warrantyCode}</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
