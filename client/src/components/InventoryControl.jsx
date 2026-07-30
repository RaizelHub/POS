import { useEffect, useMemo, useState } from 'react';
import { FaBoxes, FaClipboardCheck, FaExchangeAlt, FaTruckLoading } from 'react-icons/fa';
import api from '../utils/api';

const movementLabels = {
  receiving: 'Received',
  adjustment: 'Adjusted',
  cycle_count: 'Counted',
  wastage: 'Wastage',
  sale: 'Sale',
  return: 'Return',
  void: 'Void',
};

const InventoryControl = () => {
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [mode, setMode] = useState('receiving');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [reason, setReason] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [productsResponse, movementsResponse] = await Promise.all([
      api.get('/api/products'),
      api.get('/api/inventory/movements?limit=100'),
    ]);
    setProducts(productsResponse.data);
    setMovements(movementsResponse.data);
  };

  useEffect(() => {
    load().catch(() => setError('Unable to load inventory controls.'));
  }, []);

  const selectedProduct = useMemo(
    () => products.find((product) => product._id === productId),
    [products, productId]
  );

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!productId) return setError('Choose a product.');

    const numericQuantity = Number(quantity);
    try {
      setSaving(true);
      if (mode === 'receiving') {
        await api.post(`/api/inventory/${productId}/receive`, {
          quantity: numericQuantity,
          unitCost: unitCost === '' ? undefined : Number(unitCost),
          reason: reason || 'Stock received',
        });
      } else if (mode === 'cycle_count') {
        await api.post(`/api/inventory/${productId}/cycle-count`, {
          countedQuantity: numericQuantity,
          reason: reason || 'Physical cycle count',
        });
      } else {
        await api.post(`/api/inventory/${productId}/adjust`, {
          quantityDelta: numericQuantity,
          reason,
          isWastage: mode === 'wastage',
        });
      }
      setNotice('Inventory operation recorded in the movement ledger.');
      setQuantity('');
      setUnitCost('');
      setReason('');
      await load();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Inventory operation failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Stock control</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">Inventory movements</h1>
        <p className="mt-1 text-sm text-slate-500">Receive, count, and adjust stock with a permanent audit trail.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <form onSubmit={submit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            {[
              ['receiving', 'Receive', FaTruckLoading],
              ['adjustment', 'Adjust', FaExchangeAlt],
              ['cycle_count', 'Count', FaClipboardCheck],
              ['wastage', 'Wastage', FaBoxes],
            ].map(([value, label, Icon]) => (
              <button
                key={value}
                type="button"
                onClick={() => setMode(value)}
                className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs font-bold ${mode === value ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Icon /> {label}
              </button>
            ))}
          </div>

          <label className="block text-xs font-bold text-slate-700">
            Product
            <select value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm">
              <option value="">Choose product</option>
              {products.map((product) => <option key={product._id} value={product._id}>{product.name} · {product.quantity} on hand</option>)}
            </select>
          </label>

          {selectedProduct && (
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              Current stock: <strong className="text-slate-950">{selectedProduct.quantity}</strong> · SKU {selectedProduct.sku || '—'}
            </div>
          )}

          <label className="block text-xs font-bold text-slate-700">
            {mode === 'cycle_count' ? 'Counted quantity' : mode === 'receiving' ? 'Quantity received' : 'Quantity change'}
            <input required type="number" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder={mode === 'adjustment' || mode === 'wastage' ? 'Use -2 or 3' : '0'} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </label>

          {mode === 'receiving' && (
            <label className="block text-xs font-bold text-slate-700">
              Unit cost (optional)
              <input type="number" min="0" step="0.01" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
          )}

          <label className="block text-xs font-bold text-slate-700">
            Reason
            <textarea required={mode === 'adjustment' || mode === 'wastage'} value={reason} onChange={(event) => setReason(event.target.value)} rows="3" className="mt-2 w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
          </label>

          {error && <p className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">{error}</p>}
          {notice && <p className="rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">{notice}</p>}
          <button disabled={saving} className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Recording…' : 'Record movement'}
          </button>
        </form>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-bold text-slate-950">Recent movement ledger</h2>
            <p className="mt-1 text-xs text-slate-500">The latest 100 stock-changing events.</p>
          </div>
          <div className="max-h-[650px] divide-y divide-slate-100 overflow-y-auto">
            {movements.map((movement) => (
              <div key={movement._id} className="grid grid-cols-[1fr_auto] gap-4 p-4 text-xs">
                <div>
                  <p className="font-bold text-slate-900">{movement.productId?.name || 'Archived product'}</p>
                  <p className="mt-1 text-slate-500">{movementLabels[movement.type] || movement.type} · {movement.reason || 'No note'}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{new Date(movement.createdAt).toLocaleString('en-PH')}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${movement.quantityDelta >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{movement.quantityDelta >= 0 ? '+' : ''}{movement.quantityDelta}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{movement.resultingQuantity} on hand</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default InventoryControl;

