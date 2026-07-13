import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { FaBox, FaExclamationTriangle, FaFileExcel, FaArrowDown, FaSync } from 'react-icons/fa';
import dayjs from 'dayjs';
import config from '../config';

function InventoryManager() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [supplierName, setSupplierName] = useState('SUELTO Official Supplier');
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    fetchLowStock();
  }, []);

  const fetchLowStock = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${config.apiUrl}/api/products/low-stock`);
      // Initialize reorderQty field for each item
      const items = res.data.map(item => ({
        ...item,
        reorderQty: Math.max(10, (item.lowStockThreshold || 5) * 3 - (item.quantity || 0))
      }));
      setLowStockItems(items);
    } catch (err) {
      console.error('Error fetching low stock:', err);
      setAlert({ type: 'error', message: 'Failed to retrieve low-stock catalog.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = (id, value) => {
    const val = parseInt(value) || 0;
    setLowStockItems(prev =>
      prev.map(item => (item._id === id ? { ...item, reorderQty: Math.max(0, val) } : item))
    );
  };

  const handleExportPO = () => {
    if (lowStockItems.length === 0) {
      setAlert({ type: 'error', message: 'No items in the low-stock list to purchase.' });
      return;
    }

    try {
      setExporting(true);
      const poRef = `PO-${dayjs().format('YYYYMMDD')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const wb = XLSX.utils.book_new();

      const poHeader = [
        ['SUELTO RETAIL SYSTEMS - PURCHASE ORDER'],
        [`PO Reference: ${poRef}`],
        [`Supplier Name: ${supplierName}`],
        [`Generated Date: ${dayjs().format('MMMM D, YYYY, h:mm A')}`],
        [''],
        ['Barcode / SKU', 'Product Name', 'Category', 'Current Stock', 'Threshold', 'Reorder Qty']
      ];

      const poRows = lowStockItems.map(item => [
        item.barcode || 'N/A',
        item.name,
        item.category || 'Uncategorized',
        item.quantity,
        item.lowStockThreshold || 0,
        item.reorderQty
      ]);

      const wsData = [...poHeader, ...poRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Simple column widths formatting
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
      saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `SUELTO_Purchase_Order_${dayjs().format('YYYYMMDD')}.xlsx`);

      setAlert({ type: 'success', message: 'Supplier Excel PO exported successfully!' });
    } catch (err) {
      console.error('Error exporting PO:', err);
      setAlert({ type: 'error', message: 'Could not export Excel PO sheet.' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* Header and alert block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FaBox className="text-amber-500" /> Auto-Restock & PO Manager
          </h2>
          <p className="text-slate-500 text-xs mt-1">Review inventory items currently running below restock thresholds and generate supplier Purchase Orders (PO).</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLowStock}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-650 hover:text-slate-900 transition-colors"
            title="Refresh List"
          >
            <FaSync />
          </button>
          <button
            onClick={handleExportPO}
            disabled={exporting || lowStockItems.length === 0}
            className="bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <FaFileExcel /> Export Excel PO
          </button>
        </div>
      </div>

      {alert && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm ${alert.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
          <span className="text-sm font-semibold">{alert.message}</span>
        </div>
      )}

      {/* Supplier Configuration Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Purchase Order Parameters</h3>
        <div className="max-w-md">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Supplier Name</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-sm rounded-lg px-3 py-2 outline-none transition-all"
            placeholder="e.g. SUELTO Coffee Roasters Inc."
          />
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : lowStockItems.length === 0 ? (
        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center space-y-2">
          <FaBox className="text-emerald-500 text-4xl mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Inventory Stocks Healthy</h3>
          <p className="text-slate-550 text-xs max-w-sm mx-auto">No products are currently under the warning low-stock threshold. Restock metrics are clean!</p>
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
                {lowStockItems.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 flex items-center gap-3">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded-lg border border-slate-200" />
                      ) : (
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 flex items-center justify-center font-bold rounded-lg text-sm border border-amber-100">
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
                          className="w-20 bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white text-sm font-semibold rounded-lg px-2.5 py-1.5 text-center outline-none transition-all"
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
  );
}

export default InventoryManager;
