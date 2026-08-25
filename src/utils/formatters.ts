import { DeviceType, RepairStatus } from '../types';

export function formatVND(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
}

export function formatTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return 'vừa xong';
  const d = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diffSec < 60) return `${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} phút trước`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} giờ trước`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} ngày trước`;
}

export function formatDateTime(dateStr: string | undefined): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

export function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '---';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function getDaysDiff(dateStr: string | undefined): number {
  if (!dateStr) return 0;
  const d = new Date(dateStr);
  const now = new Date();
  const diffTime = now.getTime() - d.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export const deviceTypeLabels: Record<DeviceType, string> = {
  laptop: 'Laptop / Notebook',
  pc: 'Máy tính để bàn (PC)',
  vga: 'Card đồ họa (VGA/GPU)',
  mainboard: 'Bo mạch chủ (Mainboard)',
  power_supply: 'Nguồn máy tính (PSU)',
  monitor: 'Màn hình LCD/Gaming',
  macbook: 'MacBook / iMac',
  bios_programmer: 'Nạp ROM BIOS',
  other: 'Thiết bị điện tử khác',
};

export const repairStatusConfig: Record<RepairStatus, { label: string; color: string; bg: string; border: string }> = {
  tiep_nhan: { label: 'Tiếp nhận', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  cho_kiem_tra: { label: 'Chờ kiểm tra', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  dang_kiem_tra: { label: 'Đang kiểm tra', color: 'text-yellow-800', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  bao_gia: { label: 'Báo giá', color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' },
  cho_khach_duyet: { label: 'Chờ khách duyệt', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  dang_sua: { label: 'Đang sửa', color: 'text-blue-800', bg: 'bg-blue-100', border: 'border-blue-300' },
  cho_linh_kien: { label: 'Chờ linh kiện', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' },
  sua_xong: { label: 'Sửa xong', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  dang_test: { label: 'Đang test tải', color: 'text-teal-700', bg: 'bg-teal-50', border: 'border-teal-200' },
  cho_khach_nhan: { label: 'Chờ khách nhận', color: 'text-cyan-800', bg: 'bg-cyan-100', border: 'border-cyan-300' },
  da_giao: { label: 'Đã giao khách', color: 'text-emerald-800', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  bao_hanh: { label: 'Bảo hành lại', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
  huy_khong_sua: { label: 'Không sửa / Hủy', color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-300' },
};

export function exportToCSV(filename: string, rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\uFEFF'; // BOM for UTF-8 Excel support
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export function generateVietQRUrl(bankAccount: string, bankName: string, amount: number, memo: string, accountName: string) {
  // Common bank BIN codes
  const bankBin = '970422'; // MB Bank default or generic
  return `https://img.vietqr.io/image/${bankBin}-${bankAccount}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`;
}
