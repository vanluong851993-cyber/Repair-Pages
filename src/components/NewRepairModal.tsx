import React, { useState } from 'react';
import {
  X,
  Wrench,
  User,
  Phone,
  Calendar,
  Clock,
  Laptop,
  Check,
  Plus,
  Zap,
  Tag,
  Shield,
  Camera
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DeviceType, RepairStatus } from '../types';
import confetti from 'canvas-confetti';

interface NewRepairModalProps {
  onClose: () => void;
  onSuccess: (orderId: string) => void;
}

const COMMON_ISSUES: Record<DeviceType, string[]> = {
  laptop: [
    'Không lên nguồn',
    'Không sạc pin / Sạc chập chờn',
    'Bật nguồn quạt quay không lên hình',
    'Màn hình sọc / Nháy / Chớp',
    'Liệt bàn phím / Touchpad đơ',
    'Nhiệt độ cao / Quạt kêu to',
    'Lỗi BIOS / Treo logo khởi động',
    'Mất nguồn 3V/5V Standby'
  ],
  vga: [
    'Rác hình (Artifact) / Sọc màn hình',
    'Cài driver NVIDIA bị sập đen màn hình',
    'Code 43 / Không nhận VGA trong Device Manager',
    'Lỗi VRAM (Chạy MATS báo lỗi bank ô nhớ)',
    'Mất nguồn 12V PCIe / Chập nguồn Core NVVDD',
    'Quá nhiệt / Quạt không quay / Reball GPU'
  ],
  mainboard: [
    'Không kích được nguồn (Mất 3.3V DSW/VSB)',
    'Kích nguồn quạt quay tắt lặp lại (Reset loop)',
    'Không POST / Đèn Debug CPU/RAM/VGA sáng đỏ',
    'Không nhận RAM Dual Channel',
    'Chập nguồn VRM / Cháy MOSFET',
    'Lỗi nạp ROM BIOS / Lỗi Chipset PCH'
  ],
  pc: [
    'Bật máy không lên gì',
    'Chơi game sập nguồn / Tắt phụt',
    'Dump màn hình xanh (BSOD)',
    'Nhiệt độ CPU quá cao > 95°C',
    'Vệ sinh bảo dưỡng & Tra keo tản nhiệt',
    'Lỗi nguồn máy tính (PSU sụt áp)'
  ],
  power_supply: ['Nổ tụ / Chập sò công suất', 'Mất áp 12V/5V/3.3V', 'Quạt không quay'],
  monitor: ['Mất nguồn / Đèn nguồn nhấp nháy', 'Trắng màn hình', 'Sọc chỉ ngang dọc', 'Hỏng tấm nền / Vỡ panel'],
  macbook: ['Không sạc Type-C', 'Mất nguồn 20V (Chập CD3215)', 'Màn hình tối đen mất đèn nền', 'Dính nước ẩm mốc bo mạch'],
  bios_programmer: ['Nạp BIOS laptop chuẩn Clean ME', 'Nạp BIOS Card VGA', 'Mở khóa password BIOS'],
  other: ['Lỗi mạch điện tử', 'Hỏng jack cắm / Cáp tín hiệu']
};

export const NewRepairModal: React.FC<NewRepairModalProps> = ({ onClose, onSuccess }) => {
  const { customers, createCustomer, createRepairOrder, users } = useApp();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');

  const [deviceType, setDeviceType] = useState<DeviceType>('laptop');
  const [brand, setBrand] = useState('Dell');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [password, setPassword] = useState('');
  const [appearanceCondition, setAppearanceCondition] = useState('Máy nguyên tem, xước dăm nhẹ theo thời gian');
  const [accessoriesIncluded, setAccessoriesIncluded] = useState('Thân máy + Sạc Adapter');
  const [reportedIssue, setReportedIssue] = useState('');
  const [assignedTechnicianId, setAssignedTechnicianId] = useState(
    users.find((u) => u.role === 'technician')?.id || ''
  );

  // Appointment date: Default tomorrow 16:00
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(16, 0, 0, 0);
  const [appointmentDate, setAppointmentDate] = useState(tomorrow.toISOString().slice(0, 16));

  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'express'>('normal');
  const [depositAmount, setDepositAmount] = useState(0);

  // Auto-fill existing customer when typing phone
  const handlePhoneChange = (phone: string) => {
    setCustomerPhone(phone);
    const existing = customers.find((c) => c.phone.replace(/\D/g, '') === phone.replace(/\D/g, ''));
    if (existing) {
      setSelectedCustomerId(existing.id);
      setCustomerName(existing.name);
      setCustomerAddress(existing.address || '');
    } else {
      setSelectedCustomerId('');
    }
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !model || !reportedIssue) {
      alert('Vui lòng điền đầy đủ Tên khách hàng, SĐT, Model máy và Lỗi mô tả!');
      return;
    }

    let customerId = selectedCustomerId;
    if (!customerId) {
      const newCust = createCustomer({
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
      });
      customerId = newCust.id;
    }

    const techUser = users.find((u) => u.id === assignedTechnicianId);

    const newOrder = createRepairOrder({
      customerId,
      customerName,
      customerPhone,
      deviceType,
      brand,
      model,
      serialNumber: serialNumber || undefined,
      password: password || undefined,
      appearanceCondition,
      accessoriesIncluded,
      reportedIssue,
      assignedTechnicianId,
      assignedTechnicianName: techUser?.name,
      appointmentDate: new Date(appointmentDate).toISOString(),
      status: 'tiep_nhan',
      urgency,
      usedParts: [],
      laborFee: 0,
      otherServicesFee: 0,
      discount: 0,
      paidAmount: Number(depositAmount),
      warrantyPeriod: '3 tháng',
      techSheet: {
        diagnosedFault: reportedIssue,
      },
      images: {
        before: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80']
      }
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
    onSuccess(newOrder.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-md">
              <Plus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold">Tiếp Nhận Thiết Bị Sửa Chữa Mới</h2>
              <p className="text-xs text-blue-100 mt-0.5">
                Tạo phiếu tiếp nhận, ghi nhận tình trạng máy, mật khẩu, phụ kiện & phân công kỹ thuật viên
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-5 bg-slate-50/50">
          
          {/* Section 1: Customer Information */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Thông tin khách hàng</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Số điện thoại khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: 0901234567"
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Họ và tên khách hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Nguyễn Văn A"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Địa chỉ / Khu vực:</label>
                <input
                  type="text"
                  placeholder="vd: Cầu Giấy, Hà Nội"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Device Information */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Laptop className="w-4 h-4 text-blue-600" />
              <span>2. Thông tin thiết bị nhận sửa</span>
            </h3>

            {/* Device Type Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: 'laptop', label: 'Laptop / Notebook' },
                { id: 'vga', label: 'Card đồ họa (VGA)' },
                { id: 'mainboard', label: 'Bo mạch chủ (Main)' },
                { id: 'pc', label: 'Máy tính PC để bàn' },
                { id: 'power_supply', label: 'Nguồn PC (PSU)' },
                { id: 'monitor', label: 'Màn hình LCD' },
                { id: 'macbook', label: 'MacBook / Apple' },
                { id: 'bios_programmer', label: 'Nạp BIOS ROM' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDeviceType(d.id as DeviceType)}
                  className={`p-2 rounded-xl border font-semibold text-left transition-all cursor-pointer ${
                    deviceType === d.id
                      ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-400'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-2">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hãng sản xuất:</label>
                <input
                  type="text"
                  placeholder="vd: Dell, Asus, MSI, Gigabyte, HP, Lenovo, Apple..."
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Model thiết bị <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="vd: Inspiron 5570 / RTX 3080 / B450M..."
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Số Serial / IMEI:</label>
                <input
                  type="text"
                  placeholder="vd: DL-5570-9941..."
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mật khẩu máy / BIOS:</label>
                <input
                  type="text"
                  placeholder="vd: 123456 hoặc Không có"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Ngoại hình khi nhận máy:</label>
                <input
                  type="text"
                  value={appearanceCondition}
                  onChange={(e) => setAppearanceCondition(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Phụ kiện đi kèm:</label>
                <input
                  type="text"
                  value={accessoriesIncluded}
                  onChange={(e) => setAccessoriesIncluded(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Symptoms & Fault Description */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>3. Mô tả tình trạng lỗi & Gợi ý nhanh</span>
            </h3>

            {/* Fast Symptom Chips */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {(COMMON_ISSUES[deviceType] || COMMON_ISSUES.laptop).map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => setReportedIssue((prev) => (prev ? `${prev}, ${issue}` : issue))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                >
                  + {issue}
                </button>
              ))}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Chi tiết lỗi khách mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="vd: Cắm sạc đèn nguồn không sáng, bấm power không có phản hồi, máy mất nguồn hoàn toàn..."
                value={reportedIssue}
                onChange={(e) => setReportedIssue(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 text-xs font-medium"
              />
            </div>
          </div>

          {/* Section 4: Assignment, Schedule & Deposit */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>4. Phân công kỹ thuật viên & Hẹn trả máy</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Kỹ thuật viên phụ trách:</label>
                <select
                  value={assignedTechnicianId}
                  onChange={(e) => setAssignedTechnicianId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  {users.filter((u) => u.role === 'technician' || u.role === 'admin').map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mức độ ưu tiên:</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="normal">Bình thường</option>
                  <option value="urgent">Gấp (Lấy trong ngày)</option>
                  <option value="express">Hỏa tốc (Xử lý ngay)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Hẹn trả khách:</label>
                <input
                  type="datetime-local"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold text-blue-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Tiền cọc trước (VND):</label>
                <input
                  type="number"
                  min={0}
                  step={50000}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500 font-bold text-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Tạo phiếu tiếp nhận</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
