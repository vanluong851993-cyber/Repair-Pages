export type DeviceType = 
  | 'laptop' 
  | 'pc' 
  | 'vga' 
  | 'mainboard' 
  | 'power_supply' 
  | 'monitor' 
  | 'macbook' 
  | 'bios_programmer' 
  | 'other';

export type RepairStatus = 
  | 'tiep_nhan'          // 1. Tiếp nhận
  | 'cho_kiem_tra'       // 2. Chờ kiểm tra
  | 'dang_kiem_tra'      // 3. Đang kiểm tra
  | 'bao_gia'            // 4. Báo giá
  | 'cho_khach_duyet'    // 5. Chờ khách duyệt
  | 'dang_sua'           // 6. Đang sửa
  | 'cho_linh_kien'      // 7. Chờ linh kiện
  | 'sua_xong'           // 8. Sửa xong
  | 'dang_test'          // 9. Đang test
  | 'cho_khach_nhan'     // 10. Chờ khách nhận
  | 'da_giao'            // 11. Đã giao
  | 'bao_hanh'           // 12. Bảo hành
  | 'huy_khong_sua';     // 13. Hủy / Không sửa

export type UserRole = 'admin' | 'manager' | 'cashier' | 'technician' | 'warehouse';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address?: string;
  email?: string;
  notes?: string;
  totalRepairs: number;
  totalSpent: number;
  debt: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  address?: string;
  contactPerson?: string;
  debt: number;
  totalPurchases: number;
}

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  model?: string;
  costPrice: number;    // Giá vốn
  sellingPrice: number; // Giá bán
  stock: number;        // Tồn kho hiện tại
  minStock: number;     // Tồn tối thiểu
  warehouseLocation: string; // Vị trí kho (Kệ A1, Ngăn IC-02...)
  supplierId?: string;
  supplierName?: string;
  warrantyMonths: number;
  serials?: string[];
  specs?: string;
}

export interface UsedPart {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  costPrice: number;
  unitPrice: number;
  serialNumber?: string;
  warrantyMonths: number;
}

export interface TechnicalCheckSheet {
  inputVoltage?: string;     // Điện áp đầu vào (e.g. 19.5V, 12V)
  standbyCurrent?: string;   // Dòng ăn Standby (e.g. 0.015A)
  vcore?: string;            // Nguồn CPU Core
  ramVoltage?: string;       // Nguồn RAM (1.2V / 1.35V)
  vgaVoltage?: string;       // Nguồn GPU/VRAM
  chipsetVoltage?: string;   // Nguồn Chipset PCH
  biosStatus?: string;       // ROM BIOS nạp chuẩn / sai ME
  ecStatus?: string;         // EC/SIO
  vrmStatus?: string;        // VRM MOSFETs
  tempC?: string;            // Nhiệt độ full load (°C)
  boardCondition?: string;   // Tình trạng mainboard (Zin / Đã qua sửa / Rỉ sét)
  diagnosedFault?: string;   // Lỗi phát hiện
  rootCause?: string;        // Nguyên nhân
  damagedParts?: string;     // Linh kiện hỏng
  repairMethod?: string;     // Phương án sửa chữa
  techNotes?: string;        // Ghi chú kỹ thuật
}

export interface StatusHistoryItem {
  id: string;
  status: RepairStatus;
  timestamp: string;
  updatedBy: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  date: string;
  amount: number;
  method: 'cash' | 'transfer' | 'qr';
  note?: string;
  recordedBy: string;
}

export interface RepairOrder {
  id: string;
  code: string;                     // SR000125
  createdAt: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  serialNumber?: string;
  imei?: string;
  password?: string;               // Mật khẩu máy
  appearanceCondition?: string;    // Ngoại hình trầy xước, cấn góc...
  accessoriesIncluded?: string;    // Sạc, túi chống sốc, cáp...
  reportedIssue: string;           // Lỗi khách mô tả
  issueCategory?: string;          // Danh mục lỗi (Không lên nguồn, Treo logo, Rác hình...)
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  appointmentDate: string;         // Ngày hẹn trả
  completedDate?: string;          // Ngày sửa xong
  deliveredDate?: string;          // Ngày giao khách
  status: RepairStatus;
  urgency: 'normal' | 'urgent' | 'express';
  
  // Technical Log
  techSheet?: TechnicalCheckSheet;
  images?: {
    before?: string[];
    board?: string[];
    fault?: string[];
    after?: string[];
  };

  // Pricing & Stock
  usedParts: UsedPart[];
  laborFee: number;                // Tiền công sửa
  otherServicesFee: number;        // Dịch vụ khác (vệ sinh, cài win, nạp bios)
  discount: number;                // Chiết khấu / Giảm giá
  totalAmount: number;             // Tổng tiền
  paidAmount: number;              // Đã thanh toán
  remainingDebt: number;           // Còn nợ
  
  // Warranty
  warrantyPeriod: string;          // 7 ngày, 1 tháng, 3 tháng, 6 tháng...
  warrantyCode?: string;           // BH-SR000125
  warrantyExpiry?: string;

  // Timelines & Payments
  statusHistory: StatusHistoryItem[];
  payments: PaymentRecord[];
  notes?: string;
}

export interface StockInItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  costPrice: number;
  totalPrice: number;
  serials?: string[];
}

export interface StockIn {
  id: string;
  code: string;           // PN0001
  date: string;
  supplierId: string;
  supplierName: string;
  items: StockInItem[];
  totalAmount: number;
  discount: number;
  paidAmount: number;
  remainingDebt: number;
  note?: string;
  createdBy: string;
}

export interface StockOutItem {
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  totalPrice: number;
}

export interface StockOut {
  id: string;
  code: string;           // PX0001
  date: string;
  reason: 'repair' | 'sale' | 'warranty' | 'other';
  repairOrderId?: string;
  items: StockOutItem[];
  totalAmount: number;
  note?: string;
  createdBy: string;
}

export interface SaleInvoice {
  id: string;
  code: string;           // HD0001
  date: string;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  items: {
    productId: string;
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    warrantyMonths: number;
  }[];
  totalAmount: number;
  discount: number;
  paidAmount: number;
  remainingDebt: number;
  paymentMethod: 'cash' | 'transfer' | 'qr';
  createdBy: string;
  note?: string;
}

export interface NotificationItem {
  id: string;
  type: 'repair' | 'debt' | 'inventory' | 'warranty';
  title: string;
  message: string;
  level: 'info' | 'warning' | 'urgent';
  timestamp: string;
  read: boolean;
  linkTab?: string;
  orderId?: string;
}

export interface PrinterConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  paperSize: '58mm' | '80mm' | 'A4';
  connectionType: 'wifi_lan' | 'usb' | 'bluetooth';
  isDefault: boolean;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  hotline: string;
  address: string;
  email: string;
  website?: string;
  bankName: string;
  bankAccount: string;
  bankAccountName: string;
  qrCodeUrl?: string;
  defaultWarranty: string;
  printHeaderNote: string;
  printFooterNote: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
}
