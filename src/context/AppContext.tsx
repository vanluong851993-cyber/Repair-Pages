import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  RepairOrder,
  Customer,
  Supplier,
  Product,
  StockIn,
  StockOut,
  SaleInvoice,
  NotificationItem,
  PrinterConfig,
  StoreSettings,
  User,
  AuditLog,
  RepairStatus,
  UsedPart
} from '../types';
import {
  initialUsers,
  initialCustomers,
  initialSuppliers,
  initialProducts,
  initialRepairOrders,
  initialStockIns,
  initialStockOuts,
  initialSaleInvoices,
  initialNotifications,
  initialPrinters,
  initialStoreSettings,
  initialAuditLogs
} from '../data/mockData';

interface AppContextType {
  // Current user & role
  currentUser: User;
  setCurrentUser: (user: User) => void;
  users: User[];

  // Entities
  customers: Customer[];
  suppliers: Supplier[];
  products: Product[];
  repairOrders: RepairOrder[];
  stockIns: StockIn[];
  stockOuts: StockOut[];
  saleInvoices: SaleInvoice[];
  notifications: NotificationItem[];
  printers: PrinterConfig[];
  settings: StoreSettings;
  auditLogs: AuditLog[];

  // Repair Order Actions
  createRepairOrder: (order: Omit<RepairOrder, 'id' | 'code' | 'createdAt' | 'statusHistory' | 'payments' | 'totalAmount' | 'remainingDebt'>) => RepairOrder;
  updateRepairOrder: (id: string, updates: Partial<RepairOrder>) => void;
  updateRepairStatus: (id: string, newStatus: RepairStatus, note?: string) => void;
  addPaymentToRepair: (id: string, amount: number, method: 'cash' | 'transfer' | 'qr', note?: string) => void;
  addUsedPartToRepair: (orderId: string, part: UsedPart) => void;
  removeUsedPartFromRepair: (orderId: string, productId: string) => void;

  // Inventory Actions
  createProduct: (product: Omit<Product, 'id' | 'code'>) => Product;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createStockIn: (stockIn: Omit<StockIn, 'id' | 'code' | 'date'>) => StockIn;
  createStockOut: (stockOut: Omit<StockOut, 'id' | 'code' | 'date'>) => StockOut;
  createSaleInvoice: (invoice: Omit<SaleInvoice, 'id' | 'code' | 'date'>) => SaleInvoice;

  // Customer & Supplier Actions
  createCustomer: (cust: Omit<Customer, 'id' | 'code' | 'totalRepairs' | 'totalSpent' | 'debt' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  collectCustomerDebt: (customerId: string, amount: number, method: 'cash' | 'transfer' | 'qr', note?: string) => void;

  createSupplier: (supp: Omit<Supplier, 'id' | 'code' | 'debt' | 'totalPurchases'>) => Supplier;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  paySupplierDebt: (supplierId: string, amount: number, note?: string) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings & Tools
  updateSettings: (newSettings: Partial<StoreSettings>) => void;
  updatePrinters: (printers: PrinterConfig[]) => void;
  testPrinter: (printer: PrinterConfig) => Promise<{ success: boolean; message: string }>;
  backupDatabase: () => void;
  restoreDatabase: (jsonData: string) => boolean;
  resetDatabaseToDefault: () => void;

  // Quick navigation helpers
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchGlobalQuery: string;
  setSearchGlobalQuery: (query: string) => void;
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_PREFIX = 'kiotfix_v1_';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load state from localStorage or initial mock data
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'user');
    return saved ? JSON.parse(saved) : initialUsers[0];
  });

  const [users] = useState<User[]>(initialUsers);

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'customers');
    return saved ? JSON.parse(saved) : initialCustomers;
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : initialSuppliers;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [repairOrders, setRepairOrders] = useState<RepairOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'repairOrders');
    return saved ? JSON.parse(saved) : initialRepairOrders;
  });

  const [stockIns, setStockIns] = useState<StockIn[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'stockIns');
    return saved ? JSON.parse(saved) : initialStockIns;
  });

  const [stockOuts, setStockOuts] = useState<StockOut[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'stockOuts');
    return saved ? JSON.parse(saved) : initialStockOuts;
  });

  const [saleInvoices, setSaleInvoices] = useState<SaleInvoice[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'saleInvoices');
    return saved ? JSON.parse(saved) : initialSaleInvoices;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [printers, setPrinters] = useState<PrinterConfig[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'printers');
    return saved ? JSON.parse(saved) : initialPrinters;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'settings');
    return saved ? JSON.parse(saved) : initialStoreSettings;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'auditLogs');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchGlobalQuery, setSearchGlobalQuery] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'repairOrders', JSON.stringify(repairOrders));
  }, [repairOrders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stockIns', JSON.stringify(stockIns));
  }, [stockIns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'stockOuts', JSON.stringify(stockOuts));
  }, [stockOuts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'saleInvoices', JSON.stringify(saleInvoices));
  }, [saleInvoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'printers', JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'auditLogs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Helper to log actions
  const addAuditLog = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      module,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 99)]);
  };

  // Helper to check low stock and auto notify
  const checkLowStockAlerts = (updatedProducts: Product[]) => {
    updatedProducts.forEach((p) => {
      if (p.stock <= p.minStock) {
        // Check if existing unread notif already exists
        const exists = notifications.some((n) => n.type === 'inventory' && n.title.includes(p.name) && !n.read);
        if (!exists) {
          const newNotif: NotificationItem = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
            type: 'inventory',
            title: `Cảnh báo tồn kho: ${p.name}`,
            message: `Linh kiện "${p.name}" (${p.code}) còn ${p.stock} cái trong kho (Mức tối thiểu: ${p.minStock}). Cần nhập thêm!`,
            level: 'urgent',
            timestamp: new Date().toISOString(),
            read: false,
            linkTab: 'low_stock',
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      }
    });
  };

  // Repair Orders Management
  const createRepairOrder = (orderData: Omit<RepairOrder, 'id' | 'code' | 'createdAt' | 'statusHistory' | 'payments' | 'totalAmount' | 'remainingDebt'>): RepairOrder => {
    const nextNum = repairOrders.length + 126;
    const code = `SR${String(nextNum).padStart(6, '0')}`;
    const id = `sr-${Date.now()}`;
    const now = new Date().toISOString();

    const partsTotal = (orderData.usedParts || []).reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
    const totalAmount = Math.max(0, partsTotal + (orderData.laborFee || 0) + (orderData.otherServicesFee || 0) - (orderData.discount || 0));
    const paidAmount = orderData.paidAmount || 0;
    const remainingDebt = Math.max(0, totalAmount - paidAmount);

    const newOrder: RepairOrder = {
      ...orderData,
      id,
      code,
      createdAt: now,
      totalAmount,
      paidAmount,
      remainingDebt,
      warrantyCode: `BH-${code}`,
      statusHistory: [
        {
          id: 'sh-' + Date.now(),
          status: orderData.status || 'tiep_nhan',
          timestamp: now,
          updatedBy: currentUser.name,
          notes: 'Tiếp nhận thiết bị vào hệ thống',
        },
      ],
      payments: paidAmount > 0 ? [
        {
          id: 'pm-' + Date.now(),
          date: now,
          amount: paidAmount,
          method: 'cash',
          note: 'Đặt cọc / thanh toán khi tiếp nhận',
          recordedBy: currentUser.name,
        }
      ] : [],
    };

    setRepairOrders((prev) => [newOrder, ...prev]);

    // Update customer stats
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === newOrder.customerId || c.phone === newOrder.customerPhone) {
          return {
            ...c,
            totalRepairs: c.totalRepairs + 1,
            totalSpent: c.totalSpent + totalAmount,
            debt: c.debt + remainingDebt,
          };
        }
        return c;
      })
    );

    addAuditLog('Tạo phiếu sửa chữa', 'Đơn sửa chữa', `Tạo phiếu tiếp nhận #${code} - ${newOrder.brand} ${newOrder.model} cho khách ${newOrder.customerName}`);

    // Auto notification
    const notif: NotificationItem = {
      id: 'notif-' + Date.now(),
      type: 'repair',
      title: 'Phiếu sửa chữa mới',
      message: `Đã tiếp nhận ${newOrder.brand} ${newOrder.model} (${code}) từ khách ${newOrder.customerName}.`,
      level: 'info',
      timestamp: now,
      read: false,
      linkTab: 'repairs',
      orderId: id,
    };
    setNotifications((prev) => [notif, ...prev]);

    return newOrder;
  };

  const updateRepairOrder = (id: string, updates: Partial<RepairOrder>) => {
    setRepairOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const updated = { ...order, ...updates };
        // Recalculate totals if financial properties changed
        const partsTotal = (updated.usedParts || []).reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
        updated.totalAmount = Math.max(0, partsTotal + (updated.laborFee || 0) + (updated.otherServicesFee || 0) - (updated.discount || 0));
        updated.remainingDebt = Math.max(0, updated.totalAmount - (updated.paidAmount || 0));
        return updated;
      })
    );
    addAuditLog('Cập nhật phiếu sửa chữa', 'Đơn sửa chữa', `Cập nhật thông tin phiếu sửa chữa ${id}`);
  };

  const updateRepairStatus = (id: string, newStatus: RepairStatus, note?: string) => {
    const now = new Date().toISOString();
    setRepairOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const historyItem = {
          id: 'sh-' + Date.now(),
          status: newStatus,
          timestamp: now,
          updatedBy: currentUser.name,
          notes: note || `Chuyển trạng thái sang "${newStatus}"`,
        };

        const updates: Partial<RepairOrder> = {
          status: newStatus,
          statusHistory: [...order.statusHistory, historyItem],
        };

        if (newStatus === 'sua_xong' && !order.completedDate) {
          updates.completedDate = now;
        }
        if (newStatus === 'da_giao' && !order.deliveredDate) {
          updates.deliveredDate = now;
          // Calculate warranty expiry date
          const months = order.warrantyPeriod.includes('12') ? 12 : order.warrantyPeriod.includes('6') ? 6 : order.warrantyPeriod.includes('3') ? 3 : 1;
          const exp = new Date();
          exp.setMonth(exp.getMonth() + months);
          updates.warrantyExpiry = exp.toISOString().split('T')[0];
        }

        return { ...order, ...updates };
      })
    );
    addAuditLog('Đổi trạng thái đơn sửa', 'Đơn sửa chữa', `Đổi trạng thái phiếu ${id} sang ${newStatus}`);
  };

  const addPaymentToRepair = (id: string, amount: number, method: 'cash' | 'transfer' | 'qr', note?: string) => {
    const now = new Date().toISOString();
    setRepairOrders((prev) =>
      prev.map((order) => {
        if (order.id !== id) return order;
        const newPayment = {
          id: 'pm-' + Date.now(),
          date: now,
          amount,
          method,
          note: note || 'Thanh toán tiền sửa chữa',
          recordedBy: currentUser.name,
        };
        const newPaid = order.paidAmount + amount;
        const newDebt = Math.max(0, order.totalAmount - newPaid);

        // Also adjust customer debt
        setCustomers((cPrev) =>
          cPrev.map((c) => {
            if (c.id === order.customerId || c.phone === order.customerPhone) {
              return {
                ...c,
                debt: Math.max(0, c.debt - amount),
              };
            }
            return c;
          })
        );

        return {
          ...order,
          paidAmount: newPaid,
          remainingDebt: newDebt,
          payments: [...order.payments, newPayment],
        };
      })
    );
    addAuditLog('Thu tiền sửa chữa', 'Tài chính', `Thu ${amount.toLocaleString('vi-VN')}₫ cho phiếu sửa chữa ${id} (${method})`);
  };

  const addUsedPartToRepair = (orderId: string, part: UsedPart) => {
    // 1. Add part to repair order
    setRepairOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const existingPartIndex = order.usedParts.findIndex((p) => p.productId === part.productId);
        let updatedParts = [...order.usedParts];
        if (existingPartIndex >= 0) {
          updatedParts[existingPartIndex] = {
            ...updatedParts[existingPartIndex],
            quantity: updatedParts[existingPartIndex].quantity + part.quantity,
          };
        } else {
          updatedParts.push(part);
        }
        const partsTotal = updatedParts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
        const totalAmount = Math.max(0, partsTotal + (order.laborFee || 0) + (order.otherServicesFee || 0) - (order.discount || 0));
        const remainingDebt = Math.max(0, totalAmount - order.paidAmount);

        return {
          ...order,
          usedParts: updatedParts,
          totalAmount,
          remainingDebt,
        };
      })
    );

    // 2. Automatically deduct stock in products
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        if (prod.id === part.productId) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - part.quantity),
          };
        }
        return prod;
      });
      checkLowStockAlerts(updated);
      return updated;
    });

    // 3. Create stock out record
    const newStockOut: StockOut = {
      id: 'px-' + Date.now(),
      code: `PX${String(stockOuts.length + 1).padStart(4, '0')}`,
      date: new Date().toISOString(),
      reason: 'repair',
      repairOrderId: orderId,
      items: [
        {
          productId: part.productId,
          productCode: part.productCode,
          productName: part.productName,
          quantity: part.quantity,
          costPrice: part.costPrice,
          sellingPrice: part.unitPrice,
          totalPrice: part.quantity * part.unitPrice,
        },
      ],
      totalAmount: part.quantity * part.unitPrice,
      note: `Xuất linh kiện thay thế cho phiếu sửa chữa #${orderId}`,
      createdBy: currentUser.name,
    };
    setStockOuts((prev) => [newStockOut, ...prev]);

    addAuditLog('Lắp linh kiện vào máy', 'Kho & Sửa chữa', `Đã xuất ${part.quantity}x ${part.productName} cho phiếu sửa chữa ${orderId}`);
  };

  const removeUsedPartFromRepair = (orderId: string, productId: string) => {
    let removedQuantity = 0;
    setRepairOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const part = order.usedParts.find((p) => p.productId === productId);
        if (part) removedQuantity = part.quantity;
        const updatedParts = order.usedParts.filter((p) => p.productId !== productId);
        const partsTotal = updatedParts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0);
        const totalAmount = Math.max(0, partsTotal + (order.laborFee || 0) + (order.otherServicesFee || 0) - (order.discount || 0));
        const remainingDebt = Math.max(0, totalAmount - order.paidAmount);
        return {
          ...order,
          usedParts: updatedParts,
          totalAmount,
          remainingDebt,
        };
      })
    );

    if (removedQuantity > 0) {
      // Return stock back to warehouse
      setProducts((prev) =>
        prev.map((prod) => {
          if (prod.id === productId) {
            return {
              ...prod,
              stock: prod.stock + removedQuantity,
            };
          }
          return prod;
        })
      );
      addAuditLog('Hoàn trả linh kiện kho', 'Kho & Sửa chữa', `Đã hoàn trả ${removedQuantity} linh kiện (${productId}) về kho do xóa khỏi đơn ${orderId}`);
    }
  };

  // Product Management
  const createProduct = (productData: Omit<Product, 'id' | 'code'>): Product => {
    const nextNum = products.length + 1;
    const code = `LK-${String(nextNum).padStart(4, '0')}`;
    const newProduct: Product = {
      ...productData,
      id: 'sp-' + Date.now(),
      code,
    };
    setProducts((prev) => [newProduct, ...prev]);
    addAuditLog('Tạo linh kiện mới', 'Hàng hóa', `Thêm mới linh kiện "${newProduct.name}" (${code})`);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      checkLowStockAlerts(updated);
      return updated;
    });
    addAuditLog('Cập nhật linh kiện', 'Hàng hóa', `Cập nhật thông tin linh kiện ID: ${id}`);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Xóa linh kiện', 'Hàng hóa', `Xóa linh kiện ID: ${id}`);
  };

  // Stock In (Nhập kho)
  const createStockIn = (stockInData: Omit<StockIn, 'id' | 'code' | 'date'>): StockIn => {
    const nextNum = stockIns.length + 1;
    const code = `PN${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newStockIn: StockIn = {
      ...stockInData,
      id: 'pn-' + Date.now(),
      code,
      date: now,
    };

    setStockIns((prev) => [newStockIn, ...prev]);

    // 1. Increase product stock & update weighted average cost price
    setProducts((prev) =>
      prev.map((prod) => {
        const item = newStockIn.items.find((it) => it.productId === prod.id);
        if (item) {
          const oldStock = prod.stock;
          const newQty = item.quantity;
          const totalStock = oldStock + newQty;
          const newCostPrice = Math.round((prod.costPrice * oldStock + item.costPrice * newQty) / Math.max(1, totalStock));
          return {
            ...prod,
            stock: totalStock,
            costPrice: newCostPrice,
          };
        }
        return prod;
      })
    );

    // 2. Update supplier debt
    if (newStockIn.remainingDebt > 0) {
      setSuppliers((prev) =>
        prev.map((s) => {
          if (s.id === newStockIn.supplierId) {
            return {
              ...s,
              debt: s.debt + newStockIn.remainingDebt,
              totalPurchases: s.totalPurchases + newStockIn.totalAmount,
            };
          }
          return s;
        })
      );
    }

    addAuditLog('Tạo phiếu nhập kho', 'Nhập kho', `Nhập kho phiếu #${code} từ ${newStockIn.supplierName} - Tổng tiền: ${newStockIn.totalAmount.toLocaleString('vi-VN')}₫`);
    return newStockIn;
  };

  // Stock Out (Xuất kho)
  const createStockOut = (stockOutData: Omit<StockOut, 'id' | 'code' | 'date'>): StockOut => {
    const nextNum = stockOuts.length + 1;
    const code = `PX${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newStockOut: StockOut = {
      ...stockOutData,
      id: 'px-' + Date.now(),
      code,
      date: now,
    };

    setStockOuts((prev) => [newStockOut, ...prev]);

    // Decrease products stock
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        const item = newStockOut.items.find((it) => it.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
          };
        }
        return prod;
      });
      checkLowStockAlerts(updated);
      return updated;
    });

    addAuditLog('Tạo phiếu xuất kho', 'Xuất kho', `Xuất kho phiếu #${code} (${newStockOut.reason}) - Tổng tiền: ${newStockOut.totalAmount.toLocaleString('vi-VN')}₫`);
    return newStockOut;
  };

  // POS Sale Invoice (Bán lẻ)
  const createSaleInvoice = (invoiceData: Omit<SaleInvoice, 'id' | 'code' | 'date'>): SaleInvoice => {
    const nextNum = saleInvoices.length + 1;
    const code = `HD${String(nextNum).padStart(4, '0')}`;
    const now = new Date().toISOString();
    const newInvoice: SaleInvoice = {
      ...invoiceData,
      id: 'hd-' + Date.now(),
      code,
      date: now,
    };

    setSaleInvoices((prev) => [newInvoice, ...prev]);

    // 1. Deduct stock
    setProducts((prev) => {
      const updated = prev.map((prod) => {
        const item = newInvoice.items.find((it) => it.productId === prod.id);
        if (item) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - item.quantity),
          };
        }
        return prod;
      });
      checkLowStockAlerts(updated);
      return updated;
    });

    // 2. Add customer spending / debt
    if (newInvoice.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newInvoice.customerId) {
            return {
              ...c,
              totalSpent: c.totalSpent + newInvoice.totalAmount,
              debt: c.debt + newInvoice.remainingDebt,
            };
          }
          return c;
        })
      );
    }

    addAuditLog('Bán lẻ linh kiện POS', 'Bán hàng', `Tạo hóa đơn bán hàng #${code} cho ${newInvoice.customerName} - ${newInvoice.totalAmount.toLocaleString('vi-VN')}₫`);
    return newInvoice;
  };

  // Customer Management
  const createCustomer = (custData: Omit<Customer, 'id' | 'code' | 'totalRepairs' | 'totalSpent' | 'debt' | 'createdAt'>): Customer => {
    const nextNum = customers.length + 1;
    const code = `KH${String(nextNum).padStart(4, '0')}`;
    const newCust: Customer = {
      ...custData,
      id: 'kh-' + Date.now(),
      code,
      totalRepairs: 0,
      totalSpent: 0,
      debt: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setCustomers((prev) => [newCust, ...prev]);
    addAuditLog('Tạo khách hàng mới', 'Khách hàng', `Thêm khách hàng ${newCust.name} (${newCust.phone})`);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    addAuditLog('Cập nhật khách hàng', 'Khách hàng', `Cập nhật thông tin khách hàng ID: ${id}`);
  };

  const collectCustomerDebt = (customerId: string, amount: number, method: 'cash' | 'transfer' | 'qr', note?: string) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            debt: Math.max(0, c.debt - amount),
          };
        }
        return c;
      })
    );
    addAuditLog('Thu công nợ khách hàng', 'Công nợ', `Thu ${amount.toLocaleString('vi-VN')}₫ từ khách hàng ID: ${customerId} (${method}: ${note || ''})`);
  };

  // Supplier Management
  const createSupplier = (suppData: Omit<Supplier, 'id' | 'code' | 'debt' | 'totalPurchases'>): Supplier => {
    const nextNum = suppliers.length + 1;
    const code = `NCC${String(nextNum).padStart(3, '0')}`;
    const newSupp: Supplier = {
      ...suppData,
      id: 'ncc-' + Date.now(),
      code,
      debt: 0,
      totalPurchases: 0,
    };
    setSuppliers((prev) => [newSupp, ...prev]);
    addAuditLog('Tạo nhà cung cấp', 'Nhà cung cấp', `Thêm nhà cung cấp ${newSupp.name}`);
    return newSupp;
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  };

  const paySupplierDebt = (supplierId: string, amount: number, note?: string) => {
    setSuppliers((prev) =>
      prev.map((s) => {
        if (s.id === supplierId) {
          return {
            ...s,
            debt: Math.max(0, s.debt - amount),
          };
        }
        return s;
      })
    );
    addAuditLog('Chi trả nợ NCC', 'Công nợ', `Chi trả ${amount.toLocaleString('vi-VN')}₫ cho nhà cung cấp ID: ${supplierId} (${note || ''})`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Settings
  const updateSettings = (newSettings: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addAuditLog('Cập nhật cấu hình', 'Cài đặt', 'Cập nhật thông tin cửa hàng / ngân hàng');
  };

  const updatePrinters = (newPrinters: PrinterConfig[]) => {
    setPrinters(newPrinters);
    addAuditLog('Cập nhật máy in', 'Máy in', 'Cập nhật danh sách máy in nhiệt WiFi/LAN');
  };

  const testPrinter = async (printer: PrinterConfig) => {
    try {
      const res = await fetch('/api/printers/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(printer),
      });
      const data = await res.json();
      return data;
    } catch {
      return {
        success: true,
        message: `Mô phỏng in thành công trên máy in [${printer.name}] qua giao thức ESC/POS mạng LAN (${printer.ipAddress}:${printer.port})!`,
      };
    }
  };

  // Backup & Restore
  const backupDatabase = () => {
    const dump = {
      version: '2.5.0',
      exportedAt: new Date().toISOString(),
      customers,
      suppliers,
      products,
      repairOrders,
      stockIns,
      stockOuts,
      saleInvoices,
      notifications,
      printers,
      settings,
      auditLogs,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dump, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `KiotFix_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addAuditLog('Sao lưu dữ liệu', 'Hệ thống', 'Xuất bản sao lưu cơ sở dữ liệu JSON');
  };

  const restoreDatabase = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.customers) setCustomers(parsed.customers);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.products) setProducts(parsed.products);
      if (parsed.repairOrders) setRepairOrders(parsed.repairOrders);
      if (parsed.stockIns) setStockIns(parsed.stockIns);
      if (parsed.stockOuts) setStockOuts(parsed.stockOuts);
      if (parsed.saleInvoices) setSaleInvoices(parsed.saleInvoices);
      if (parsed.printers) setPrinters(parsed.printers);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.auditLogs) setAuditLogs(parsed.auditLogs);
      addAuditLog('Khôi phục dữ liệu', 'Hệ thống', 'Khôi phục cơ sở dữ liệu từ file JSON thành công');
      return true;
    } catch (err) {
      console.error('Failed to parse restore data:', err);
      return false;
    }
  };

  const resetDatabaseToDefault = () => {
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setProducts(initialProducts);
    setRepairOrders(initialRepairOrders);
    setStockIns(initialStockIns);
    setStockOuts(initialStockOuts);
    setSaleInvoices(initialSaleInvoices);
    setNotifications(initialNotifications);
    setPrinters(initialPrinters);
    setSettings(initialStoreSettings);
    setAuditLogs(initialAuditLogs);
    localStorage.clear();
    addAuditLog('Khôi phục dữ liệu mặc định', 'Hệ thống', 'Khôi phục toàn bộ dữ liệu demo chuẩn');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        customers,
        suppliers,
        products,
        repairOrders,
        stockIns,
        stockOuts,
        saleInvoices,
        notifications,
        printers,
        settings,
        auditLogs,
        createRepairOrder,
        updateRepairOrder,
        updateRepairStatus,
        addPaymentToRepair,
        addUsedPartToRepair,
        removeUsedPartFromRepair,
        createProduct,
        updateProduct,
        deleteProduct,
        createStockIn,
        createStockOut,
        createSaleInvoice,
        createCustomer,
        updateCustomer,
        collectCustomerDebt,
        createSupplier,
        updateSupplier,
        paySupplierDebt,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        updatePrinters,
        testPrinter,
        backupDatabase,
        restoreDatabase,
        resetDatabaseToDefault,
        activeTab,
        setActiveTab,
        searchGlobalQuery,
        setSearchGlobalQuery,
        selectedOrderId,
        setSelectedOrderId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
