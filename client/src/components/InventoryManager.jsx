import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { 
  FaBox, FaExclamationTriangle, FaFileExcel, FaSync, 
  FaTruck, FaPlus, FaTrash, FaEdit, FaTimes, FaSearch, FaCheck 
} from 'react-icons/fa';
import dayjs from 'dayjs';
import config from '../config';

function InventoryManager() {
  // Tab control: 'po' or 'suppliers'
  const [activeTab, setActiveTab] = useState('po');
  
  // Data states
  const [lowStockItems, setLowStockItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('all');
  
  // Loading states
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [savingSupplier, setSavingSupplier] = useState(false);
  
  // Overlay/Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState(null); // null = Add, non-null = Edit
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSelectedProducts, setFormSelectedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Alerts
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchLowStock();
    fetchSuppliers();
    fetchAllProducts();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoadingItems(true);
      const res = await axios.get(`${config.apiUrl}/api/products/low-stock`);
      const items = res.data.map(item => ({
        ...item,
        reorderQty: Math.max(10, (item.lowStockThreshold || 5) * 3 - (item.quantity || 0))
      }));
      setLowStockItems(items);
    } catch (err) {
      console.error('Error fetching low stock:', err);
      showAlert('error', 'Failed to retrieve low-stock catalog.');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      setLoadingSuppliers(true);
      const res = await axios.get(`${config.apiUrl}/api/suppliers`);
      setSuppliers(res.data);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      showAlert('error', 'Failed to retrieve suppliers directory.');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const res = await axios.get(`${config.apiUrl}/api/products`);
      setAllProducts(res.data);
    } catch (err) {
      console.error('Error fetching all products:', err);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleQtyChange = (id, value) => {
    const val = parseInt(value) || 0;
    setLowStockItems(prev =>
      prev.map(item => (item._id === id ? { ...item, reorderQty: Math.max(0, val) } : item))
    );
  };

  // Filter low-stock items by selected supplier
  const getFilteredLowStock = () => {
    if (selectedSupplierId === 'all') {
      return lowStockItems;
    }
    const currentSupplier = suppliers.find(s => s._id === selectedSupplierId);
    if (!currentSupplier) return lowStockItems;

    const supplierProductIds = (currentSupplier.products || []).map(p => typeof p === 'object' ? p._id : p);
    return lowStockItems.filter(item => supplierProductIds.includes(item._id));
  };

  // Export Purchase Order Excel Sheet
  const handleExportPO = () => {
    const filteredItems = getFilteredLowStock();
    if (filteredItems.length === 0) {
      showAlert('error', 'No items in the low-stock list matches the chosen supplier.');
      return;
    }

    let resolvedSupplierName = 'SUELTO General Supplier';
    let resolvedEmail = 'N/A';
    let resolvedPhone = 'N/A';

    if (selectedSupplierId !== 'all') {
      const supplier = suppliers.find(s => s._id === selectedSupplierId);
      if (supplier) {
        resolvedSupplierName = supplier.name;
        resolvedEmail = supplier.contactEmail || 'N/A';
        resolvedPhone = supplier.contactPhone || 'N/A';
      }
    }

    try {
      setExporting(true);
      const poRef = `PO-${dayjs().format('YYYYMMDD')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const wb = XLSX.utils.book_new();

      const poHeader = [
        ['SUELTO RETAIL SYSTEMS - PURCHASE ORDER'],
        [`PO Reference: ${poRef}`],
        [`Supplier Name: ${resolvedSupplierName}`],
        [`Supplier Email: ${resolvedEmail}`],
        [`Supplier Phone: ${resolvedPhone}`],
        [`Generated Date: ${dayjs().format('MMMM D, YYYY, h:mm A')}`],
        [''],
        ['Barcode / SKU', 'Product Name', 'Category', 'Current Stock', 'Threshold', 'Reorder Qty']
      ];

      const poRows = filteredItems.map(item => [
        item.barcode || 'N/A',
        item.name,
        item.category || 'Uncategorized',
        item.quantity,
        item.lowStockThreshold || 0,
        item.reorderQty
      ]);

      const wsData = [...poHeader, ...poRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      const colWidths = [
        { wch: 18 }, // Barcode
        { wch: 30 }, // Product Name
        { wch: 18 }, // Category
        { wch: 14 }, // Current Stock
        { wch: 12 }, // Threshold
        { wch: 14 }  // Reorder Qty
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Purchase Order');
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `SUELTO_PO_${resolvedSupplierName.replace(/\s+/g, '_')}_${dayjs().format('YYYYMMDD')}.xlsx`);

      showAlert('success', 'Supplier Excel PO exported successfully!');
    } catch (err) {
      console.error('Error exporting PO:', err);
      showAlert('error', 'Could not export Excel PO sheet.');
    } finally {
      setExporting(false);
    }
  };

  // Open modal for adding a new supplier
  const handleOpenAddModal = () => {
    setEditingSupplierId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormSelectedProducts([]);
    setSearchTerm('');
    setIsModalOpen(true);
  };

  // Open modal for editing a supplier
  const handleOpenEditModal = (supplier) => {
    setEditingSupplierId(supplier._id);
    setFormName(supplier.name);
    setFormEmail(supplier.contactEmail || '');
    setFormPhone(supplier.contactPhone || '');
    // Map populated product list or product IDs to array
    const linkedIds = (supplier.products || []).map(p => typeof p === 'object' ? p._id : p);
    setFormSelectedProducts(linkedIds);
    setSearchTerm('');
    setIsModalOpen(true);
  };

  // Toggle selection of product in the supplier creation form
  const handleToggleProduct = (productId) => {
    setFormSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all products currently visible in search
  const handleSelectAllVisible = (visibleIds) => {
    setFormSelectedProducts(prev => {
      const unique = new Set([...prev, ...visibleIds]);
      return Array.from(unique);
    });
  };

  // Unselect all products currently visible in search
  const handleUnselectAllVisible = (visibleIds) => {
    setFormSelectedProducts(prev => 
      prev.filter(id => !visibleIds.includes(id))
    );
  };

  // Save Supplier form submission
  const handleSaveSupplier = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showAlert('error', 'Supplier name is required.');
      return;
    }

    try {
      setSavingSupplier(true);
      const payload = {
        name: formName.trim(),
        contactEmail: formEmail.trim(),
        contactPhone: formPhone.trim(),
        products: formSelectedProducts
      };

      if (editingSupplierId) {
        // Edit Supplier
        await axios.put(`${config.apiUrl}/api/suppliers/${editingSupplierId}`, payload);
        showAlert('success', 'Supplier updated successfully!');
      } else {
        // Add Supplier
        await axios.post(`${config.apiUrl}/api/suppliers`, payload);
        showAlert('success', 'Supplier created successfully!');
      }

      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      console.error('Error saving supplier:', err);
      const errorMsg = err.response?.data?.message || 'Error occurred while saving supplier.';
      showAlert('error', errorMsg);
    } finally {
      setSavingSupplier(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`${config.apiUrl}/api/suppliers/${id}`);
      showAlert('success', 'Supplier deleted successfully.');
      fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      showAlert('error', 'Failed to delete supplier.');
    }
  };

  const filteredCatalogForSearch = allProducts.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FaBox className="text-teal-650" /> Auto-Restock & PO Manager
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            Associate suppliers with your inventory catalog and compile detailed purchase spreadsheet sheets.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200/60">
          <button
            onClick={() => setActiveTab('po')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'po' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Generate PO
          </button>
          <button
            onClick={() => setActiveTab('suppliers')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'suppliers' 
                ? 'bg-white text-slate-800 shadow-sm' 
                : 'text-slate-500 hover:text-slate-850'
            }`}
          >
            Manage Suppliers
          </button>
        </div>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm transition-all ${
          alert.type === 'success' 
            ? 'bg-emerald-50 border-emerald-250 text-emerald-800' 
            : 'bg-rose-50 border-rose-250 text-rose-800'
        }`}>
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* TAB 1: PURCHASE ORDERS */}
      {activeTab === 'po' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Supplier Selector Parameters */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Filter by Associated Supplier
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg px-3 py-2.5 outline-none transition-all focus:bg-white focus:border-teal-700 focus:ring-1 focus:ring-teal-700 cursor-pointer"
              >
                <option value="all">All Suppliers (Display Unfiltered Catalog)</option>
                {suppliers.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.products?.length || 0} products)</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={fetchLowStock}
                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition-colors"
                title="Refresh stock data"
              >
                <FaSync className={loadingItems ? 'animate-spin' : ''} />
              </button>

              <button
                onClick={handleExportPO}
                disabled={exporting || getFilteredLowStock().length === 0}
                className="bg-teal-700 hover:bg-teal-650 text-white text-xs font-bold px-5 py-3 rounded-lg shadow-sm flex items-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              >
                <FaFileExcel /> Export Supplier Excel PO
              </button>
            </div>
          </div>

          {/* Low Stock Items List */}
          {loadingItems ? (
            <div className="flex items-center justify-center min-h-[250px]">
              <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : getFilteredLowStock().length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <FaBox className="text-slate-400 text-4xl mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Low-Stock Items Found</h3>
              <p className="text-slate-500 text-xs max-w-md mx-auto">
                {selectedSupplierId === 'all' 
                  ? 'All products are currently stocked above their reorder thresholds.'
                  : 'There are no low-stock products associated with this supplier.'}
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="px-6 py-4">Product details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Current stock</th>
                      <th className="px-6 py-4">Min. Threshold</th>
                      <th className="px-6 py-4">Reorder amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {getFilteredLowStock().map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 flex items-center gap-3">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                          ) : (
                            <div className="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center font-bold rounded-lg text-sm border border-slate-200">
                              {item.name[0]}
                            </div>
                          )}
                          <div>
                            <p className="text-slate-900 font-semibold leading-none">{item.name}</p>
                            <p className="text-slate-500 text-[11px] font-normal mt-1">Barcode: {item.barcode || 'N/A'}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-slate-700 bg-slate-100 text-[11px] font-semibold px-2 py-0.5 rounded-full uppercase">
                            {item.category || 'General'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-rose-600 font-semibold">
                            <FaExclamationTriangle className="text-xs" /> {item.quantity} units left
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-650">
                          {item.lowStockThreshold || 0} units
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              value={item.reorderQty}
                              min={0}
                              onChange={(e) => handleQtyChange(item._id, e.target.value)}
                              className="w-20 bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:bg-white text-sm font-semibold rounded-lg px-2.5 py-1.5 text-center outline-none transition-all"
                            />
                            <span className="text-slate-400 text-xs">units</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MANAGE SUPPLIERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Supplier Directory Header actions */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700">Suppliers Directory ({suppliers.length})</h3>
            <button
              onClick={handleOpenAddModal}
              className="bg-teal-700 hover:bg-teal-650 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition-all active:scale-98"
            >
              <FaPlus /> Add Supplier
            </button>
          </div>

          {loadingSuppliers ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : suppliers.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center space-y-3">
              <FaTruck className="text-slate-400 text-4xl mx-auto" />
              <h3 className="text-base font-bold text-slate-800">No Suppliers Configured</h3>
              <p className="text-slate-550 text-xs max-w-sm mx-auto">
                Get started by creating suppliers and linking them to products from your catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {suppliers.map(sup => (
                <div key={sup._id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-350 transition-colors gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-750">
                          <FaTruck />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm leading-tight">{sup.name}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                            {sup.products?.length || 0} associated items
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(sup)}
                          className="p-2 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-colors"
                          title="Edit Supplier"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteSupplier(sup._id)}
                          className="p-2 border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition-colors"
                          title="Delete Supplier"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>

                    {/* Contacts info details */}
                    <div className="grid grid-cols-2 gap-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 font-semibold">
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase">Contact Email</span>
                        <span className="truncate block mt-0.5 text-slate-700">{sup.contactEmail || 'Not Provided'}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-slate-400 uppercase">Contact Phone</span>
                        <span className="truncate block mt-0.5 text-slate-700">{sup.contactPhone || 'Not Provided'}</span>
                      </div>
                    </div>
                  </div>

                  {/* List of associated products */}
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-100/80">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide mb-1.5">Associated Catalog:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                      {(sup.products || []).length === 0 ? (
                        <span className="text-[10px] text-slate-400 font-semibold italic">No products mapped yet</span>
                      ) : (
                        sup.products.map(p => {
                          const prodName = typeof p === 'object' ? p.name : p;
                          return (
                            <span key={typeof p === 'object' ? p._id : p} className="bg-white border border-slate-200 rounded px-2 py-0.5 text-[9px] text-slate-600 font-bold max-w-[150px] truncate">
                              {prodName}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Supplier Modal: Handles Add & Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                <FaTruck className="text-teal-655" />
                {editingSupplierId ? 'Modify Supplier Parameters' : 'Register New Supplier'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-450 hover:bg-slate-150 rounded-lg transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleSaveSupplier} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Supplier Info Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supplier Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                    placeholder="Enter supplier contact name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Email Address</label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                    placeholder="name@supplier.com"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Phone Line</label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-teal-700 focus:ring-1 focus:ring-teal-700 outline-none focus:bg-white text-xs font-semibold rounded-lg px-3 py-2 transition-all"
                    placeholder="+63 900 0000 000"
                  />
                </div>
              </div>

              {/* Product Association mapping */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">Associate Store Products</h4>
                    <p className="text-slate-500 text-[10px] mt-0.5">Select the products that are supplied by this vendor.</p>
                  </div>
                  
                  {/* Search products bar */}
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 text-xs">
                      <FaSearch />
                    </span>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 outline-none transition-all focus:border-teal-700 focus:ring-1 focus:ring-teal-700 focus:bg-white"
                      placeholder="Search barcode or name..."
                    />
                  </div>
                </div>

                {/* Bulk select visible options */}
                {filteredCatalogForSearch.length > 0 && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-450 uppercase tracking-wide">
                    <span>Batch:</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllVisible(filteredCatalogForSearch.map(p => p._id))}
                      className="text-teal-700 hover:text-teal-850"
                    >
                      Select All Filtered
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => handleUnselectAllVisible(filteredCatalogForSearch.map(p => p._id))}
                      className="text-slate-500 hover:text-slate-700"
                    >
                      Deselect All Filtered
                    </button>
                  </div>
                )}

                {/* Grid checklist list */}
                <div className="border border-slate-200 rounded-xl max-h-60 overflow-y-auto divide-y divide-slate-100 bg-slate-50 p-1">
                  {filteredCatalogForSearch.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 font-semibold text-xs italic">
                      No matching products in catalog
                    </div>
                  ) : (
                    filteredCatalogForSearch.map(product => {
                      const isChecked = formSelectedProducts.includes(product._id);
                      return (
                        <div
                          key={product._id}
                          onClick={() => handleToggleProduct(product._id)}
                          className={`flex items-center justify-between px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked 
                              ? 'bg-teal-50/50 hover:bg-teal-50 text-teal-950 font-bold' 
                              : 'hover:bg-slate-100 text-slate-750'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs">{product.name}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase bg-white border border-slate-200 px-1 py-0.2 rounded">
                              {product.category}
                            </span>
                          </div>
                          
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                            isChecked 
                              ? 'bg-teal-700 border-teal-700 text-white' 
                              : 'border-slate-300 bg-white'
                          }`}>
                            {isChecked && <FaCheck className="text-[10px]" />}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="text-[10px] text-slate-450 font-semibold text-right">
                  Selected count: {formSelectedProducts.length} items
                </div>

              </div>

              {/* Submit panel buttons */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-800 text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingSupplier}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-650 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all active:scale-98"
                >
                  {savingSupplier ? 'Saving...' : editingSupplierId ? 'Save Changes' : 'Register Supplier'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default InventoryManager;
