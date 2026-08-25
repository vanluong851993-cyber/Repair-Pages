import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Plus,
  ShoppingCart,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  ChevronDown,
  ExternalLink,
  Laptop,
  Check,
  Shield,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatTimeAgo } from '../utils/formatters';

interface HeaderProps {
  onOpenNewRepairModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewRepairModal }) => {
  const {
    currentUser,
    setCurrentUser,
    users,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    searchGlobalQuery,
    setSearchGlobalQuery,
    setActiveTab,
    repairOrders,
    customers,
    setSelectedOrderId,
    settings
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadNotifs = notifications.filter((n) => !n.read);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter global search results
  const filteredRepairs = searchGlobalQuery.trim().length > 1
    ? repairOrders.filter(
        (o) =>
          o.code.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
          o.customerName.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
          o.customerPhone.includes(searchGlobalQuery) ||
          o.model.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
          (o.serialNumber && o.serialNumber.toLowerCase().includes(searchGlobalQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  const filteredCustomers = searchGlobalQuery.trim().length > 1
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(searchGlobalQuery.toLowerCase()) ||
          c.phone.includes(searchGlobalQuery) ||
          c.code.toLowerCase().includes(searchGlobalQuery.toLowerCase())
      ).slice(0, 3)
    : [];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between shadow-xs z-20">
      {/* Left: Global Search Engine */}
      <div className="flex-1 max-w-xl relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm nhanh: SĐT khách, Mã phiếu (SR000125), Model, Serial/IMEI..."
            value={searchGlobalQuery}
            onChange={(e) => {
              setSearchGlobalQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Global Search Results Dropdown */}
        {showSearchResults && searchGlobalQuery.trim().length > 1 && (
          <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-50 max-h-96 overflow-y-auto">
            {filteredRepairs.length === 0 && filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Không tìm thấy phiếu sửa chữa hay khách hàng nào khớp với "<strong>{searchGlobalQuery}</strong>".
              </div>
            ) : (
              <div className="space-y-3">
                {filteredRepairs.length > 0 && (
                  <div>
                    <div className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-1">
                      Phiếu sửa chữa ({filteredRepairs.length})
                    </div>
                    {filteredRepairs.map((order) => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedOrderId(order.id);
                          setActiveTab('repairs');
                          setShowSearchResults(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                            {order.code.slice(-3)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                              <span>{order.code}</span>
                              <span className="text-slate-400 font-normal">|</span>
                              <span>{order.brand} {order.model}</span>
                            </div>
                            <div className="text-xs text-slate-500">
                              Khách: {order.customerName} ({order.customerPhone})
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {filteredCustomers.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <div className="text-[11px] font-bold uppercase text-slate-400 px-2 mb-1">
                      Khách hàng ({filteredCustomers.length})
                    </div>
                    {filteredCustomers.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setActiveTab('customers');
                          setShowSearchResults(false);
                        }}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-indigo-50 cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-800">
                            {cust.name} <span className="text-xs font-normal text-slate-400">({cust.code})</span>
                          </div>
                          <div className="text-xs text-slate-500">SĐT: {cust.phone} - {cust.address}</div>
                        </div>
                        <div className="text-xs font-semibold text-slate-700">
                          {cust.totalRepairs} đơn đã sửa
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Action Button: New Repair Order */}
        <button
          id="btn-quick-new-repair"
          onClick={onOpenNewRepairModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm px-3.5 py-2 rounded-xl shadow-md shadow-blue-500/20 transition-all cursor-pointer hover:shadow-lg active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tiếp nhận máy mới</span>
        </button>

        {/* Quick POS Bán hàng Button */}
        <button
          onClick={() => setActiveTab('pos')}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-3 py-2 rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer active:scale-95"
          title="Bán lẻ linh kiện / POS"
        >
          <ShoppingCart className="w-4 h-4" />
          <span className="hidden md:inline">Bán lẻ POS</span>
        </button>

        {/* Notification Bell Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 relative transition-colors cursor-pointer"
            title="Thông báo hệ thống"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <span>Thông báo</span>
                  <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 font-semibold">
                    {unreadNotifs.length} mới
                  </span>
                </div>
                {unreadNotifs.length > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    Đọc tất cả
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-2 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">Không có thông báo nào</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) setActiveTab(notif.linkTab);
                        if (notif.orderId) setSelectedOrderId(notif.orderId);
                        setShowNotifDropdown(false);
                      }}
                      className={`p-2.5 rounded-xl cursor-pointer transition-colors border ${
                        notif.read
                          ? 'bg-white border-slate-100 hover:bg-slate-50'
                          : notif.level === 'urgent'
                          ? 'bg-red-50/70 border-red-200'
                          : 'bg-blue-50/70 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            notif.level === 'urgent'
                              ? 'bg-red-500 text-white'
                              : notif.level === 'warning'
                              ? 'bg-amber-500 text-white'
                              : 'bg-blue-500 text-white'
                          }`}
                        >
                          {notif.level === 'urgent' ? (
                            <AlertTriangle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-slate-800 flex items-center justify-between">
                            <span className="truncate">{notif.title}</span>
                            {!notif.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 ml-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher */}
        <div className="relative border-l border-slate-200 pl-3" ref={userRef}>
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden lg:flex flex-col text-left">
              <span className="text-xs font-semibold text-slate-800 leading-tight truncate max-w-[120px]">
                {currentUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-medium text-slate-500 uppercase">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2 border-b border-slate-100 mb-1">
                <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Shield className="w-3 h-3 text-blue-600" />
                  <span>Quyền hạn: <strong className="uppercase">{currentUser.role}</strong></span>
                </div>
              </div>

              <div className="text-[10px] font-bold uppercase text-slate-400 px-2 py-1">
                Chuyển tài khoản / Phân quyền
              </div>

              <div className="space-y-0.5">
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      setCurrentUser(u);
                      setShowUserDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                      currentUser.id === u.id
                        ? 'bg-blue-50 text-blue-700 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div>{u.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal uppercase">{u.role}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
