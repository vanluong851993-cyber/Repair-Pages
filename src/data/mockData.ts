import {
  Customer,
  Supplier,
  Product,
  RepairOrder,
  User,
  StockIn,
  StockOut,
  SaleInvoice,
  NotificationItem,
  PrinterConfig,
  StoreSettings,
  AuditLog
} from '../types';

export const initialUsers: User[] = [
  { id: 'usr-1', username: 'admin', name: 'Nguyễn Văn Lượng (Admin)', role: 'admin', phone: '0789324445' },
    { id: 'usr-5', username: 'cashier_mai', name: 'Ngô Cao Thuỷ Nguyên (Thu Ngân)', role: 'cashier', phone: '0981005162' },
  ];
export const initialCustomers: Customer[] = [
  {
   id: 'user_3', username: 'thkhachhang', name: 'Nguyễn Văn A', phone: '000000000' },
  ];
export const initialSuppliers: Supplier[] = [
  {
    id: 'ncc-001',
    name: 'Tân Phát Electronic IC & Chipset',
  }
];
export const initialProducts: Product[] = [
  {
    id: 'sp-001',
    code: 'LK-MOSFET-AON',
    name: 'MOSFET AON6414A (Kênh N 30V 50A - Nguồn CPU/VGA)',
    category: 'MOSFET',
    brand: 'Alpha & Omega',
    model: 'AON6414A DFN5x6',
    costPrice: 15000,
    sellingPrice: 85000,
    stock: 3,
    minStock: 15,
    warehouseLocation: 'Kệ A1 - Khay IC 01',
    supplierId: 'ncc-002',
    supplierName: 'Tân Phát Electronic IC & Chipset',
    warrantyMonths: 1,
    specs: '30V, 50A, RDS(ON) < 4.2mΩ'
  },
  {
    id: 'sp-002',
    code: 'LK-IC-TPS51125',
    name: 'IC Nguồn Xung 3V/5V TPS51125RGER Standby',
    category: 'IC nguồn',
    brand: 'Texas Instruments',
    model: 'TPS51125 QFN-24',
    costPrice: 35000,
    sellingPrice: 180000,
    stock: 2,
    minStock: 10,
    warehouseLocation: 'Kệ A1 - Khay IC 04',
    supplierId: 'ncc-002',
    supplierName: 'Tân Phát Electronic IC & Chipset',
    warrantyMonths: 1,
    specs: 'Dual-Synchronous Step-Down Controller for Notebook'
  },
  {
    id: 'sp-003',
    code: 'LK-VRAM-SAMS6G',
    name: 'Chip VRAM Samsung GDDR6 1GB K4Z80325BC-HC14 (Dùng cho RTX 3060/3070/3080)',
    category: 'VRAM',
    brand: 'Samsung',
    model: 'K4Z80325BC-HC14 BGA-180',
    costPrice: 220000,
    sellingPrice: 650000,
    stock: 4,
    minStock: 8,
    warehouseLocation: 'Kệ B2 - Tủ chống ẩm BGA',
    supplierId: 'ncc-003',
    supplierName: 'Hải Nam VGA Parts & BGA Stencil',
    warrantyMonths: 3,
    specs: 'GDDR6 8Gb, 14Gbps, 1.35V'
  },
  {
    id: 'sp-004',
    code: 'LK-BIOS-25Q128',
    name: 'Chip ROM BIOS Winbond 25Q128JVPQ (16MB SOP-8 3.3V)',
    category: 'BIOS chip',
    brand: 'Winbond',
    model: 'W25Q128JVPQ',
    costPrice: 25000,
    sellingPrice: 120000,
    stock: 12,
    minStock: 10,
    warehouseLocation: 'Kệ A1 - Khay ROM 02',
    supplierId: 'ncc-002',
    supplierName: 'Tân Phát Electronic IC & Chipset',
    warrantyMonths: 3,
    specs: '128M-bit Serial Flash Memory, 133MHz SPI'
  },
  {
    id: 'sp-005',
    code: 'LK-RAM-DDR4-8G',
    name: 'RAM Laptop Kingston Fury 8GB DDR4 Bus 3200MHz',
    category: 'RAM',
    brand: 'Kingston',
    model: 'KF432S20IB/8',
    costPrice: 420000,
    sellingPrice: 620000,
    stock: 8,
    minStock: 5,
    warehouseLocation: 'Kệ C1 - Ngăn RAM 01',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 36,
    serials: ['KF8G3200-01992', 'KF8G3200-01993', 'KF8G3200-01994', 'KF8G3200-01995']
  },
  {
    id: 'sp-006',
    code: 'LK-SSD-NVME-512',
    name: 'Ổ Cứng SSD Samsung 980 NVMe M.2 500GB Gen3x4',
    category: 'SSD',
    brand: 'Samsung',
    model: 'MZ-V8V500BW',
    costPrice: 950000,
    sellingPrice: 1350000,
    stock: 6,
    minStock: 4,
    warehouseLocation: 'Kệ C1 - Ngăn SSD 02',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 60,
    serials: ['SS980-NV512-8812', 'SS980-NV512-8813', 'SS980-NV512-8814']
  },
  {
    id: 'sp-007',
    code: 'LK-FAN-DELL5570',
    name: 'Quạt Tản Nhiệt CPU Laptop Dell Inspiron 5570 / 5575',
    category: 'Quạt',
    brand: 'Sunon / Dell OEM',
    model: 'DC28000K9D0',
    costPrice: 110000,
    sellingPrice: 280000,
    stock: 5,
    minStock: 3,
    warehouseLocation: 'Kệ D2 - Khay Fan 03',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 6
  },
  {
    id: 'sp-008',
    code: 'LK-SCREEN-156-144',
    name: 'Màn hình Laptop 15.6 inch IPS FHD 144Hz 40-pin (Gaming)',
    category: 'Màn hình',
    brand: 'BOE / LG Display',
    model: 'NV156FHM-NX4',
    costPrice: 1450000,
    sellingPrice: 2150000,
    stock: 2,
    minStock: 3,
    warehouseLocation: 'Kệ E1 - Tủ Màn Hình',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 12
  },
  {
    id: 'sp-009',
    code: 'LK-PSU-650W',
    name: 'Nguồn Máy Tính Xigmatek X-Power III 650 600W',
    category: 'Nguồn máy tính',
    brand: 'Xigmatek',
    model: 'EN45990',
    costPrice: 620000,
    sellingPrice: 850000,
    stock: 4,
    minStock: 3,
    warehouseLocation: 'Kệ D1 - Nguồn PC',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 36
  },
  {
    id: 'sp-010',
    code: 'LK-BAT-ASUS-C31N',
    name: 'Pin Laptop ASUS ZenBook UX430 / UX430UA (C31N1620 50Wh)',
    category: 'Pin laptop',
    brand: 'ASUS OEM',
    model: 'C31N1620',
    costPrice: 480000,
    sellingPrice: 790000,
    stock: 1,
    minStock: 3,
    warehouseLocation: 'Kệ E2 - Tủ Pin Laptop',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    warrantyMonths: 12
  },
  {
    id: 'sp-011',
    code: 'LK-IC-EC-IT8586',
    name: 'Chip I/O SIO / EC ITE IT8586E FXA (Đã nạp FW chuẩn)',
    category: 'EC',
    brand: 'ITE Tech',
    model: 'IT8586E-FXA QFP-128',
    costPrice: 65000,
    sellingPrice: 260000,
    stock: 4,
    minStock: 6,
    warehouseLocation: 'Kệ A1 - Khay SIO',
    supplierId: 'ncc-002',
    supplierName: 'Tân Phát Electronic IC & Chipset',
    warrantyMonths: 1
  }
];

export const initialRepairOrders: RepairOrder[] = [
  {
    id: 'sr-000125',
    code: 'SR000125',
    createdAt: '2026-08-23T09:15:00',
    customerId: 'kh-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    deviceType: 'laptop',
    brand: 'Dell',
    model: 'Inspiron 5570 i5-8250U',
    serialNumber: 'DL5570-884219',
    password: '123456(hoặc enter)',
    appearanceCondition: 'Mặt A xước nhẹ, mất 1 ốc đáy, bản lề hơi cứng',
    accessoriesIncluded: 'Sạc Oval 65W zin Dell, túi xách',
    reportedIssue: 'Laptop cắm sạc đèn sạc nháy tắt, bấm nút nguồn không có phản hồi gì, máy mất nguồn hoàn toàn.',
    issueCategory: 'Không lên nguồn',
    assignedTechnicianId: 'usr-2',
    assignedTechnicianName: 'Nguyễn Văn Hải (KTV Trưởng)',
    appointmentDate: '2026-08-25T16:00:00',
    status: 'dang_sua',
    urgency: 'urgent',
    techSheet: {
      inputVoltage: '19.5V',
      standbyCurrent: '0.005A -> Chập đường B+ 19V',
      vcore: '0V (Chưa mở)',
      ramVoltage: '0V',
      vgaVoltage: '0V',
      chipsetVoltage: '0V',
      biosStatus: 'ROM 8MB Zin ok',
      ecStatus: 'IT8587E OK, có chân 3.3V',
      vrmStatus: 'Chập MOSFET đầu vào PQ101 (AON6414)',
      tempC: 'Bình thường',
      boardCondition: 'Mainboard LA-F115P zin chưa sửa chữa',
      diagnosedFault: 'Chập cặp MOSFET cách ly nguồn đầu vào 19V B+ và đứt cầu trở gánh PR100',
      rootCause: 'Khách dùng sạc lô bên ngoài bị tăng áp đột ngột đánh thủng MOSFET',
      damagedParts: '2x MOSFET AON6414, 1x Tụ lọc gốm 10uF 25V',
      repairMethod: 'Xả bỏ tụ chập, thay thế cặp MOSFET AON6414 mới, vệ sinh đo thông mạch đường B+ lên 19.5V chuẩn.',
      techNotes: 'Đã cô lập mạch xong, chờ thay MOSFET và test tải 24h.'
    },
    images: {
      before: ['https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'],
      board: ['https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80']
    },
    usedParts: [
      {
        productId: 'sp-001',
        productCode: 'LK-MOSFET-AON',
        productName: 'MOSFET AON6414A (Kênh N 30V 50A)',
        quantity: 2,
        costPrice: 15000,
        unitPrice: 85000,
        warrantyMonths: 3
      }
    ],
    laborFee: 350000,
    otherServicesFee: 100000, // Vệ sinh tra keo tản nhiệt MX-4
    discount: 0,
    totalAmount: 620000,
    paidAmount: 200000,
    remainingDebt: 420000,
    warrantyPeriod: '3 tháng',
    warrantyCode: 'BH-SR000125',
    statusHistory: [
      { id: 'h1', status: 'tiep_nhan', timestamp: '2026-08-23T09:15:00', updatedBy: 'Phạm Tuyết Mai', notes: 'Tiếp nhận máy có sạc zin' },
      { id: 'h2', status: 'dang_kiem_tra', timestamp: '2026-08-23T10:30:00', updatedBy: 'Nguyễn Văn Hải', notes: 'Đo phát hiện chập MOSFET B+ 19V' },
      { id: 'h3', status: 'bao_gia', timestamp: '2026-08-23T11:00:00', updatedBy: 'Phạm Tuyết Mai', notes: 'Báo giá 620.000đ - Khách đã cọc 200k' },
      { id: 'h4', status: 'dang_sua', timestamp: '2026-08-24T08:30:00', updatedBy: 'Nguyễn Văn Hải', notes: 'Đang tiến hành hàn thay linh kiện' }
    ],
    payments: [
      { id: 'pm-1', date: '2026-08-23T11:15:00', amount: 200000, method: 'transfer', note: 'Khách cọc tiền sửa', recordedBy: 'Phạm Tuyết Mai' }
    ]
  },
  {
    id: 'sr-000124',
    code: 'SR000124',
    createdAt: '2026-08-22T14:20:00',
    customerId: 'kh-002',
    customerName: 'Trần Văn B',
    customerPhone: '0988776655',
    deviceType: 'vga',
    brand: 'ASUS ROG Strix',
    model: 'GeForce RTX 3080 10GB OC Gaming',
    serialNumber: 'ROG3080-STRIX-99120',
    appearanceCondition: 'Card nguyên tem void, tản nhiệt bám bụi, không cong vênh',
    accessoriesIncluded: 'Không phụ kiện (chỉ củ card VGA)',
    reportedIssue: 'Bật máy lên màn hình bị sọc rác hình (artifact) xanh lá cây, vào Windows cài driver NVIDIA bị đơ màn hình đen hoặc mã lỗi Code 43.',
    issueCategory: 'Lỗi VRAM',
    assignedTechnicianId: 'usr-4',
    assignedTechnicianName: 'Lê Hoàng Nam (KTV VGA/Chipset)',
    appointmentDate: '2026-08-25T11:00:00',
    status: 'dang_test',
    urgency: 'normal',
    techSheet: {
      inputVoltage: '12V PCIe & 3x 8-Pin OK',
      standbyCurrent: '0.65A',
      vcore: 'NVVDD 0.85V OK',
      ramVoltage: 'FBVDDQ 1.35V OK',
      vgaVoltage: '1.8V PEX OK',
      tempC: 'Furmark 4K max 68°C',
      boardCondition: 'Mạch PCB sạch đẹp, chưa từng khò hàn',
      diagnosedFault: 'Chạy tool MATS/MODS phát hiện lỗi ô nhớ chip VRAM Bank B0 (Samsung GDDR6)',
      rootCause: 'Nhiệt độ VRAM thời gian dài > 105°C làm đứt bi ngầm chân BGA hoặc chết chip',
      damagedParts: '1x Chip VRAM Samsung K4Z80325BC-HC14',
      repairMethod: 'Bốc chip VRAM Bank B0 bằng máy hàn BGA chuyên dụng, làm lại chân chì bi chì 0.45mm và thay chip VRAM mới, dán lại Thermal Pad Gelid 15W/mK.',
      techNotes: 'Đã qua bài test MATS pass 100%, Furmark 60 phút không rác hình.'
    },
    images: {
      before: ['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80'],
      board: ['https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80']
    },
    usedParts: [
      {
        productId: 'sp-003',
        productCode: 'LK-VRAM-SAMS6G',
        productName: 'Chip VRAM Samsung GDDR6 1GB K4Z80325BC',
        quantity: 1,
        costPrice: 220000,
        unitPrice: 650000,
        warrantyMonths: 3
      }
    ],
    laborFee: 650000,
    otherServicesFee: 200000, // Thay pad tản nhiệt cao cấp
    discount: 50000,
    totalAmount: 1450000,
    paidAmount: 1450000,
    remainingDebt: 0,
    warrantyPeriod: '3 tháng',
    warrantyCode: 'BH-SR000124',
    statusHistory: [
      { id: 'h1', status: 'tiep_nhan', timestamp: '2026-08-22T14:20:00', updatedBy: 'Phạm Tuyết Mai' },
      { id: 'h2', status: 'dang_kiem_tra', timestamp: '2026-08-22T16:00:00', updatedBy: 'Lê Hoàng Nam', notes: 'MATS log error on Bank B0' },
      { id: 'h3', status: 'dang_sua', timestamp: '2026-08-23T09:00:00', updatedBy: 'Lê Hoàng Nam', notes: 'Thay chip VRAM B0 thành công' },
      { id: 'h4', status: 'dang_test', timestamp: '2026-08-24T10:00:00', updatedBy: 'Lê Hoàng Nam', notes: 'Chạy 3DMark TimeSpy & Furmark' }
    ],
    payments: [
      { id: 'pm-2', date: '2026-08-22T17:00:00', amount: 1450000, method: 'qr', note: 'Khách thanh toán chuyển khoản đủ qua VietQR', recordedBy: 'Phạm Tuyết Mai' }
    ]
  },
  {
    id: 'sr-000123',
    code: 'SR000123',
    createdAt: '2026-08-20T10:00:00',
    completedDate: '2026-08-21T15:30:00',
    customerId: 'kh-003',
    customerName: 'Lê Văn C',
    customerPhone: '0912345678',
    deviceType: 'pc',
    brand: 'Custom PC Gaming',
    model: 'Core i5 12400F / B660M / RTX 2060',
    appearanceCondition: 'Thùng case kính cường lực, bụi bám dày đặc',
    accessoriesIncluded: 'Dây nguồn PC 3 chấu',
    reportedIssue: 'Chơi game CS2 / Valorant được 15 phút là bị sập nguồn tối thui màn hình, quạt rú ầm ĩ.',
    issueCategory: 'Nhiệt độ cao',
    assignedTechnicianId: 'usr-3',
    assignedTechnicianName: 'Trần Minh Tuấn (KTV Phần Cứng)',
    appointmentDate: '2026-08-21T17:00:00',
    status: 'cho_khach_nhan',
    urgency: 'normal',
    techSheet: {
      tempC: 'Trước sửa 98°C -> Sau sửa 58°C full load',
      boardCondition: 'Keo tản nhiệt CPU khô cứng như đá, quạt tản bị kẹt bụi',
      diagnosedFault: 'Quá nhiệt CPU ngắt bảo vệ PROCHOT',
      repairMethod: 'Vệ sinh toàn bộ dàn máy, thổi bụi, tra keo gốm Thermal Grizzly Kryonaut, lắp thêm 2 fan thổi luồng gió mát.',
      techNotes: 'Máy chạy êm ru, nhiệt độ mát mẻ.'
    },
    usedParts: [],
    laborFee: 200000,
    otherServicesFee: 150000,
    discount: 0,
    totalAmount: 350000,
    paidAmount: 0,
    remainingDebt: 350000,
    warrantyPeriod: '1 tháng',
    warrantyCode: 'BH-SR000123',
    statusHistory: [
      { id: 'h1', status: 'tiep_nhan', timestamp: '2026-08-20T10:00:00', updatedBy: 'Phạm Tuyết Mai' },
      { id: 'h2', status: 'sua_xong', timestamp: '2026-08-21T14:00:00', updatedBy: 'Trần Minh Tuấn' },
      { id: 'h3', status: 'cho_khach_nhan', timestamp: '2026-08-21T15:30:00', updatedBy: 'Trần Minh Tuấn', notes: 'Đã báo khách qua Zalo/SMS' }
    ],
    payments: []
  },
  {
    id: 'sr-000122',
    code: 'SR000122',
    createdAt: '2026-08-18T11:00:00',
    completedDate: '2026-08-19T10:00:00',
    deliveredDate: '2026-08-19T14:30:00',
    customerId: 'kh-004',
    customerName: 'Công ty CP Công Nghệ NextGen (Anh Hùng)',
    customerPhone: '0945678901',
    deviceType: 'mainboard',
    brand: 'MSI',
    model: 'B450 TOMAHAWK MAX Socket AM4',
    serialNumber: 'MSIB450-MAX-771120',
    reportedIssue: 'Mainboard cắm nguồn đèn CPU Debug LED sáng đỏ, không POST, quạt quay liên tục nhưng không hiển thị màn hình.',
    issueCategory: 'Lỗi BIOS',
    assignedTechnicianId: 'usr-2',
    assignedTechnicianName: 'Nguyễn Văn Hải (KTV Trưởng)',
    appointmentDate: '2026-08-19T16:00:00',
    status: 'da_giao',
    urgency: 'normal',
    techSheet: {
      inputVoltage: '24-pin ATX & 8-pin CPU OK',
      biosStatus: 'Corrupted BIOS ROM',
      repairMethod: 'Nạp lại chip ROM BIOS 128Mb bằng máy nạp RT809F bản BIOS AGESA 1.2.0.7 mới nhất.',
      techNotes: 'Main boot vào BIOS ngon lành, nhận đủ RAM dual channel.'
    },
    usedParts: [
      {
        productId: 'sp-004',
        productCode: 'LK-BIOS-25Q128',
        productName: 'Chip ROM BIOS Winbond 25Q128JVPQ',
        quantity: 1,
        costPrice: 25000,
        unitPrice: 120000,
        warrantyMonths: 3
      }
    ],
    laborFee: 200000,
    otherServicesFee: 50000,
    discount: 0,
    totalAmount: 370000,
    paidAmount: 370000,
    remainingDebt: 0,
    warrantyPeriod: '3 tháng',
    warrantyCode: 'BH-SR000122',
    warrantyExpiry: '2026-11-19',
    statusHistory: [
      { id: 'h1', status: 'tiep_nhan', timestamp: '2026-08-18T11:00:00', updatedBy: 'Phạm Tuyết Mai' },
      { id: 'h2', status: 'sua_xong', timestamp: '2026-08-19T10:00:00', updatedBy: 'Nguyễn Văn Hải' },
      { id: 'h3', status: 'da_giao', timestamp: '2026-08-19T14:30:00', updatedBy: 'Phạm Tuyết Mai', notes: 'Khách đã lấy mainboard và thanh toán' }
    ],
    payments: [
      { id: 'pm-3', date: '2026-08-19T14:30:00', amount: 370000, method: 'cash', note: 'Thu tiền mặt tại quầy', recordedBy: 'Phạm Tuyết Mai' }
    ]
  },
  {
    id: 'sr-000121',
    code: 'SR000121',
    createdAt: '2026-08-15T09:00:00',
    customerId: 'kh-005',
    customerName: 'Đặng Thùy Linh',
    customerPhone: '0934567890',
    deviceType: 'laptop',
    brand: 'ASUS',
    model: 'ZenBook UX430UA',
    serialNumber: 'UX430-882194',
    reportedIssue: 'Pin chai phồng đội touchpad, rút sạc là sập nguồn ngay lập tức.',
    issueCategory: 'Thay linh kiện',
    assignedTechnicianId: 'usr-3',
    assignedTechnicianName: 'Trần Minh Tuấn (KTV Phần Cứng)',
    appointmentDate: '2026-08-15T15:00:00',
    status: 'da_giao',
    urgency: 'normal',
    usedParts: [
      {
        productId: 'sp-010',
        productCode: 'LK-BAT-ASUS-C31N',
        productName: 'Pin Laptop ASUS ZenBook UX430',
        quantity: 1,
        costPrice: 480000,
        unitPrice: 790000,
        warrantyMonths: 12
      }
    ],
    laborFee: 100000,
    otherServicesFee: 0,
    discount: 40000,
    totalAmount: 850000,
    paidAmount: 850000,
    remainingDebt: 0,
    warrantyPeriod: '12 tháng',
    warrantyCode: 'BH-SR000121',
    warrantyExpiry: '2027-08-15',
    statusHistory: [
      { id: 'h1', status: 'da_giao', timestamp: '2026-08-15T16:00:00', updatedBy: 'Phạm Tuyết Mai' }
    ],
    payments: [
      { id: 'pm-4', date: '2026-08-15T16:00:00', amount: 850000, method: 'transfer', note: 'Chuyển khoản Vietcombank', recordedBy: 'Phạm Tuyết Mai' }
    ]
  }
];

export const initialStockIns: StockIn[] = [
  {
    id: 'pn-001',
    code: 'PN0001',
    date: '2026-08-20T10:00:00',
    supplierId: 'ncc-001',
    supplierName: 'Công ty TNHH Linh Kiện Vi Tính Miền Bắc',
    items: [
      { productId: 'sp-005', productCode: 'LK-RAM-DDR4-8G', productName: 'RAM Laptop Kingston Fury 8GB DDR4', quantity: 10, costPrice: 420000, totalPrice: 4200000 },
      { productId: 'sp-006', productCode: 'LK-SSD-NVME-512', productName: 'Ổ Cứng SSD Samsung 980 NVMe 500GB', quantity: 5, costPrice: 950000, totalPrice: 4750000 }
    ],
    totalAmount: 8950000,
    discount: 0,
    paidAmount: 5000000,
    remainingDebt: 3950000,
    note: 'Nhập lô RAM và SSD chính hãng, công nợ 15 ngày',
    createdBy: 'Vũ Quốc Dũng'
  }
];

export const initialStockOuts: StockOut[] = [
  {
    id: 'px-001',
    code: 'PX0001',
    date: '2026-08-23T10:30:00',
    reason: 'repair',
    repairOrderId: 'sr-000125',
    items: [
      { productId: 'sp-001', productCode: 'LK-MOSFET-AON', productName: 'MOSFET AON6414A', quantity: 2, costPrice: 15000, sellingPrice: 85000, totalPrice: 170000 }
    ],
    totalAmount: 170000,
    note: 'Xuất 2 MOSFET cho đơn sửa chữa laptop Dell SR000125',
    createdBy: 'Nguyễn Văn Hải'
  }
];

export const initialSaleInvoices: SaleInvoice[] = [
  {
    id: 'hd-001',
    code: 'HD0001',
    date: '2026-08-22T16:30:00',
    customerId: 'kh-001',
    customerName: 'Nguyễn Văn A',
    customerPhone: '0901234567',
    items: [
      { productId: 'sp-005', productCode: 'LK-RAM-DDR4-8G', productName: 'RAM Laptop Kingston Fury 8GB DDR4', quantity: 1, unitPrice: 620000, totalPrice: 620000, warrantyMonths: 36 }
    ],
    totalAmount: 620000,
    discount: 20000,
    paidAmount: 600000,
    remainingDebt: 0,
    paymentMethod: 'cash',
    createdBy: 'Phạm Tuyết Mai',
    note: 'Khách mua về tự cắm thêm'
  }
];

export const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'inventory',
    title: 'Cảnh báo tồn kho tối thiểu!',
    message: 'Linh kiện "MOSFET AON6414A" chỉ còn 3 cái trong kho (Mức tối thiểu: 15). Cần nhập thêm 12 cái.',
    level: 'urgent',
    timestamp: '2026-08-24T08:00:00',
    read: false,
    linkTab: 'low_stock'
  },
  {
    id: 'notif-2',
    type: 'repair',
    title: 'Máy chờ khách nhận lâu ngày',
    message: 'Đơn #SR000123 (PC Gaming Lê Văn C) đã sửa xong 4 ngày chưa có người đến lấy.',
    level: 'warning',
    timestamp: '2026-08-24T09:30:00',
    read: false,
    linkTab: 'waiting_pickup',
    orderId: 'sr-000123'
  },
  {
    id: 'notif-3',
    type: 'debt',
    title: 'Nhắc công nợ khách hàng',
    message: 'Khách hàng "NextGen Tech" còn nợ 2.400.000đ sửa chữa vượt quá hạn 10 ngày.',
    level: 'urgent',
    timestamp: '2026-08-23T15:00:00',
    read: false,
    linkTab: 'debts_collect'
  },
  {
    id: 'notif-4',
    type: 'repair',
    title: 'Có phiếu sửa chữa mới',
    message: 'Tiếp nhận Laptop Dell Inspiron 5570 (#SR000125) phân công KTV Nguyễn Văn Hải.',
    level: 'info',
    timestamp: '2026-08-23T09:15:00',
    read: true,
    linkTab: 'repairs',
    orderId: 'sr-000125'
  }
];

export const initialPrinters: PrinterConfig[] = [
  {
    id: 'prn-1',
    name: 'Máy in nhiệt Hóa đơn Thu Ngân (WiFi Xprinter XP-N160II)',
    ip: '192.168.1.200',
    port: 9100,
    paperSize: '80mm',
    connectionType: 'wifi_lan',
    isDefault: true
  },
  {
    id: 'prn-2',
    name: 'Máy in Phiếu kỹ thuật & Tem dán máy (K58 LAN)',
    ip: '192.168.1.201',
    port: 9100,
    paperSize: '58mm',
    connectionType: 'wifi_lan',
    isDefault: false
  },
  {
    id: 'prn-3',
    name: 'Máy in Hợp đồng & Báo giá A4 (Canon LBP2900 / WiFi)',
    ip: '192.168.1.205',
    port: 9100,
    paperSize: 'A4',
    connectionType: 'wifi_lan',
    isDefault: false
  }
];

export const initialStoreSettings: StoreSettings = {
  storeName: 'TRUNG TÂM SỬA CHỮA MÁY TÍNH & ĐIỆN TỬ KIOTFIX',
  phone: '0988.111.222',
  hotline: '1900 6868',
  address: 'Số 88 Phố Chùa Láng, P. Láng Thượng, Q. Đống Đa, TP. Hà Nội',
  email: 'hotro@kiotfix.vn',
  website: 'https://kiotfix.vn',
  bankName: 'Ngân hàng TMCP Quân Đội (MB Bank)',
  bankAccount: '0988111222888',
  bankAccountName: 'NGUYEN QUAN TRI',
  qrCodeUrl: 'https://api.vietqr.io/image/970422-0988111222888-9d2L6iC.jpg',
  defaultWarranty: '3 tháng',
  printHeaderNote: 'CHUYÊN SỬA CHỮA LAPTOP - PC - VGA - MAINBOARD - NẠP BIOS CHUYÊN NGHIỆP',
  printFooterNote: 'Cảm ơn Quý khách! Vui lòng giữ phiếu này khi nhận lại máy. Bảo hành theo tem & số điện thoại.'
};

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-08-23T09:15:00',
    userId: 'usr-5',
    userName: 'Phạm Tuyết Mai',
    action: 'Tạo phiếu sửa chữa',
    module: 'Đơn sửa chữa',
    details: 'Tạo phiếu tiếp nhận #SR000125 - Laptop Dell Inspiron 5570 cho khách Nguyễn Văn A'
  },
  {
    id: 'log-2',
    timestamp: '2026-08-23T10:30:00',
    userId: 'usr-2',
    userName: 'Nguyễn Văn Hải',
    action: 'Cập nhật nhật ký kỹ thuật',
    module: 'Khám máy',
    details: 'Đo nguồn ghi nhận chập MOSFET B+ 19V, đề xuất thay 2 MOSFET AON6414'
  },
  {
    id: 'log-3',
    timestamp: '2026-08-23T10:35:00',
    userId: 'usr-2',
    userName: 'Nguyễn Văn Hải',
    action: 'Xuất kho linh kiện',
    module: 'Kho linh kiện',
    details: 'Tự động trừ 2x MOSFET AON6414 (LK-MOSFET-AON) cho đơn #SR000125'
  }
];
