import React, { useState } from 'react';
import {
  Wrench,
  LayoutDashboard,
  ClipboardList,
  Users,
  Package,
  ArrowDownToLine,
  ArrowUpFromLine,
  ShoppingCart,
  Receipt,
  Cpu,
  UserCheck,
  ShieldCheck,
  BarChart3,
  Settings,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
  const { activeTab, setActiveTab, repairOrders, products, customers } = useApp();

  // Counts for alert badges
  const pendingRepairsCount = repairOrders.filter(
    (o) => !['da_giao', 'huy_khong_sua'].includes(o.status)
  ).length;

  const waitingPickupCount = repairOrders.filter((o) => o.status === 'cho_khach_nhan').length;

  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  const debtCustomersCount = customers.filter((c) => c.debt > 0).length;

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard, category: 'main' },
    { id: 'repairs', label: 'Đơn sửa chữa', icon: Wrench, badge: pendingRepairsCount, badgeColor: 'bg-blue-600', category: 'main' },
    { id: 'customers', label: 'Khách hàng', icon: Users, category: 'main' },
    { id: 'products', label: 'Hàng hóa & LK', icon: Package, category: 'main' },
    { id: 'stock_in', label: 'Nhập kho', icon: ArrowDownToLine, category: 'inventory' },
    { id: 'stock_out', label: 'Xuất kho', icon: ArrowUpFromLine, category: 'inventory' },
    { id: 'pos', label: 'Bán hàng (POS)', icon: ShoppingCart, category: 'sales' },
    { id: 'debts', label: 'Công nợ', icon: Receipt, badge: debtCustomersCount > 0 ? debtCustomersCount : undefined, badgeColor: 'bg-amber-600', category: 'finance' },
    { id: 'technicians', label: 'Kỹ thuật viên', icon: UserCheck, category: 'operations' },
    { id: 'warranties', label: 'Bảo hành', icon: ShieldCheck, category: 'operations' },
    { id: 'reports', label: 'Báo cáo', icon: BarChart3, category: 'analytics' },
    { id: 'settings', label: 'Cài đặt & Máy in', icon: Settings, category: 'settings' },
  ];

  const quickFilterViews = [
    { id: 'pending_urgent', label: 'Khách cần sửa gấp', icon: Flame, badge: pendingRepairsCount, color: 'text-red-600 hover:bg-red-50' },
    { id: 'waiting_pickup', label: 'Máy chờ khách nhận', icon: Clock, badge: waitingPickupCount, color: 'text-cyan-700 hover:bg-cyan-50' },
    { id: 'low_stock', label: 'Hàng cần nhập thêm', icon: AlertTriangle, badge: lowStockCount, color: 'text-amber-700 hover:bg-amber-50' },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 select-none z-30 shadow-xl border-r border-slate-800 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950">
        <div
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
          onClick={() => setActiveTab('dashboard')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 shrink-0">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-lg text-white tracking-wide flex items-center gap-1.5">
                Kiot<span className="text-blue-400">Fix</span>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">PRO</span>
              </span>
              <span className="text-[11px] text-slate-400 truncate">Quản Lý Sửa Chữa PC & LK</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Quick Status Focus Views */}
      {!collapsed && (
        <div className="p-3 border-b border-slate-800 bg-slate-900/50">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2 mb-1.5">
            Màn hình ưu tiên
          </div>
          <div className="space-y-1">
            {quickFilterViews.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-blue-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive
                          ? 'bg-white text-blue-700'
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-900/30 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                }`}
              />
              {!collapsed && (
                <div className="flex-1 flex items-center justify-between overflow-hidden text-left">
                  <span className="truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold text-white shadow-sm shrink-0 ${
                        item.badgeColor || 'bg-blue-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Technical Helper Pill */}
      {!collapsed && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-br from-blue-950/80 to-indigo-950/80 border border-blue-800/40 text-xs">
          <div className="flex items-center gap-1.5 text-blue-300 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Chẩn đoán mạch</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Hỗ trợ tra cứu điện áp IC, sơ đồ mạch & mã lỗi GPU/VRAM ngay trong phiếu sửa.
          </p>
        </div>
      )}
    </aside>
  );
};
