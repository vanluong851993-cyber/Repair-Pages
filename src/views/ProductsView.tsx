import React, { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Filter,
  FileSpreadsheet,
  AlertTriangle,
  Edit2,
  Trash2,
  Tag,
  Layers,
  MapPin,
  Barcode,
  X,
  Check
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatVND, formatNumber, exportToCSV } from '../utils/formatters';
import { Product } from '../types';

export const ProductsView: React.FC = () => {
  const { products, createProduct, updateProduct, deleteProduct } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    category: 'IC & Chipset',
    costPrice: 0,
    sellingPrice: 0,
    stock: 10,
    minStock: 5,
    unit: 'Cái',
    warehouseLocation: 'Kệ A1 - Ngăn 01',
    warrantyMonths: 3,
    description: '',
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  // Filter products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      (p.barcode && p.barcode.includes(q)) ||
      (p.warehouseLocation && p.warehouseLocation.toLowerCase().includes(q));

    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'IC & Chipset',
      costPrice: 50000,
      sellingPrice: 150000,
      stock: 10,
      minStock: 5,
      unit: 'Cái',
      warehouseLocation: 'Kệ A1 - Ngăn 01',
      warrantyMonths: 3,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData(p);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      createProduct(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleExport = () => {
    const headers = ['Mã linh kiện', 'Tên linh kiện', 'Danh mục', 'Vị trí kho', 'Tồn kho', 'Đơn vị', 'Giá vốn', 'Giá bán', 'Bảo hành (tháng)'];
    const rows = filteredProducts.map((p) => [
      p.code,
      p.name,
      p.category,
      p.warehouseLocation,
      p.stock,
      p.unit,
      p.costPrice,
      p.sellingPrice,
      p.warrantyMonths,
    ]);
    exportToCSV(`Kho_linh_kien_${new Date().toISOString().split('T')[0]}.csv`, [headers, ...rows]);
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Quản Lý Kho Hàng Hóa & Linh Kiện Sửa Chữa</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              {filteredProducts.length} mặt hàng
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý IC, MOSFET, VRAM, bo mạch, màn hình, phụ kiện với vị trí kệ kho & định mức tồn tối thiểu
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span className="hidden md:inline">Xuất Excel</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm linh kiện mới</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã SP (LK001), tên linh kiện (AON6414, TPS51125), mã vạch, vị trí kệ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar text-xs">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-2 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            Tất cả danh mục
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-xl whitespace-nowrap font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                <th className="py-3.5 px-4">Mã / Mã vạch</th>
                <th className="py-3.5 px-4">Tên linh kiện & Hàng hóa</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Vị trí kệ kho</th>
                <th className="py-3.5 px-4 text-center">Tồn kho</th>
                <th className="py-3.5 px-4 text-right">Giá vốn</th>
                <th className="py-3.5 px-4 text-right">Giá bán</th>
                <th className="py-3.5 px-4 text-center">Bảo hành</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLow = p.stock <= p.minStock;
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{p.code}</div>
                      {p.barcode && <div className="text-[10px] text-slate-400">{p.barcode}</div>}
                    </td>

                    <td className="py-3 px-4 max-w-[260px]">
                      <div className="font-bold text-slate-800 truncate">{p.name}</div>
                      {p.description && (
                        <div className="text-[11px] text-slate-400 truncate">{p.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{p.warehouseLocation || 'Chưa xếp'}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs ${
                          isLow
                            ? 'bg-red-100 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {p.stock} {p.unit}
                      </span>
                      {isLow && (
                        <div className="text-[10px] text-red-500 font-semibold mt-0.5">Sắp hết hàng</div>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-500">
                      {formatVND(p.costPrice)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-emerald-700">
                      {formatVND(p.sellingPrice)}
                    </td>

                    <td className="py-3 px-4 text-center text-slate-600">
                      {p.warrantyMonths} tháng
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Bạn có chắc muốn xóa linh kiện "${p.name}"?`)) {
                              deleteProduct(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-5 py-4 bg-emerald-700 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Package className="w-4 h-4" />
                <span>{editingProduct ? 'Chỉnh Sửa Linh Kiện' : 'Thêm Linh Kiện / Hàng Hóa Mới'}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-white hover:bg-emerald-800 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Tên linh kiện / IC / Mainboard *</label>
                  <input
                    type="text"
                    required
                    placeholder="vd: IC Nguồn TPS51125 Dual Step-down Controller"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Danh mục linh kiện:</label>
                  <input
                    type="text"
                    placeholder="vd: IC & Chipset, MOSFET, VRAM, Màn hình, Nguồn..."
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Vị trí kệ kho:</label>
                  <input
                    type="text"
                    placeholder="vd: Kệ A1 - Hộp 03"
                    value={formData.warehouseLocation || ''}
                    onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá vốn nhập (VND):</label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-slate-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Giá bán niêm yết (VND):</label>
                  <input
                    type="number"
                    value={formData.sellingPrice || 0}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Số lượng tồn kho ban đầu:</label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Định mức tồn tối thiểu (báo động):</label>
                  <input
                    type="number"
                    value={formData.minStock || 5}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 font-bold text-red-600"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Thời gian bảo hành (tháng):</label>
                  <input
                    type="number"
                    value={formData.warrantyMonths || 3}
                    onChange={(e) => setFormData({ ...formData, warrantyMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    value={formData.unit || 'Cái'}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {editingProduct ? 'Lưu thay đổi' : 'Tạo linh kiện'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
