// ============================================================
// Pana Rabbids - Stock Page (Simple & Clean)
// Visual stock management with product cards and +/- buttons
// Persists stock changes to localStorage
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProducts } from '../../data/productDataService';
import { notifyStockRestored } from '../../services/notificationService';

const STORAGE_KEY = 'pana_stock';

interface ProductStock {
  productId: number;
  productName: string;
  imageUrl: string;
  variants: {
    id: number;
    label: string;
    defaultStock: number;
  }[];
}

function loadStock(): Record<number, number> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function saveStock(values: Record<number, number>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
}

export default function StockPage() {
  // Group variants by product for cleaner display
  const productStocks: ProductStock[] = useMemo(() => {
    return getProducts().map((p) => {
      const primaryImg = p.images.find((img) => img.isPrimary) || p.images[0];
      return {
        productId: p.id,
        productName: p.name,
        imageUrl: primaryImg?.imageUrl || '',
        variants: p.variants.map((v) => ({
          id: v.id,
          label: `${v.size} / ${v.color}`,
          defaultStock: v.stock,
        })),
      };
    });
  }, []);

  const [stockValues, setStockValues] = useState<Record<number, number>>(
    () => {
      const saved = loadStock();
      const initial: Record<number, number> = {};
      productStocks.forEach((p) => p.variants.forEach((v) => {
        initial[v.id] = saved[v.id] !== undefined ? saved[v.id] : v.defaultStock;
      }));
      return initial;
    }
  );

  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');
  const [showToast, setShowToast] = useState('');

  const adjustStock = useCallback((id: number, delta: number) => {
    setStockValues((prev) => {
      const oldValue = prev[id] ?? 0;
      const newValue = Math.max(0, oldValue + delta);
      const updated = { ...prev, [id]: newValue };
      saveStock(updated);
      // Notify subscribers if stock restored from 0
      if (oldValue === 0 && newValue > 0) {
        try { notifyStockRestored(id); } catch { /* ignore */ }
      }
      return updated;
    });
  }, []);

  const setStockDirect = useCallback((id: number, value: number) => {
    setStockValues((prev) => {
      const oldValue = prev[id] ?? 0;
      const newValue = Math.max(0, value);
      const updated = { ...prev, [id]: newValue };
      saveStock(updated);
      // Notify subscribers if stock restored from 0
      if (oldValue === 0 && newValue > 0) {
        try { notifyStockRestored(id); } catch { /* ignore */ }
      }
      return updated;
    });
  }, []);

  const getStockColor = (stock: number) => {
    if (stock === 0) return '#E53E3E';
    if (stock < 5) return '#F59E0B';
    return '#38A169';
  };

  // Filter products
  const filteredProducts = useMemo(() => {
    return productStocks.filter((p) => {
      if (filter === 'all') return true;
      return p.variants.some((v) => {
        const stock = stockValues[v.id] ?? v.defaultStock;
        if (filter === 'out') return stock === 0;
        if (filter === 'low') return stock > 0 && stock < 5;
        return true;
      });
    });
  }, [productStocks, stockValues, filter]);

  // Stats
  const totalVariants = productStocks.reduce((sum, p) => sum + p.variants.length, 0);
  const lowCount = productStocks.reduce((sum, p) => sum + p.variants.filter((v) => { const s = stockValues[v.id] ?? v.defaultStock; return s > 0 && s < 5; }).length, 0);
  const outCount = productStocks.reduce((sum, p) => sum + p.variants.filter((v) => (stockValues[v.id] ?? v.defaultStock) === 0).length, 0);
  const totalUnits = Object.values(stockValues).reduce((sum, v) => sum + v, 0);

  const handleResetAll = () => {
    const initial: Record<number, number> = {};
    productStocks.forEach((p) => p.variants.forEach((v) => { initial[v.id] = v.defaultStock; }));
    setStockValues(initial);
    saveStock(initial);
    setShowToast('Stock restaurado a valores originales');
    setTimeout(() => setShowToast(''), 2500);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed', top: 20, right: 20, zIndex: 1000,
              background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(56,161,105,0.3)',
              borderRadius: 12, padding: '12px 20px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{ fontSize: 16 }}>&#9989;</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
            Inventario
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', margin: '4px 0 0' }}>
            {totalVariants} variantes &middot; {totalUnits} unidades en total
          </p>
        </div>
        <button
          onClick={handleResetAll}
          style={{
            padding: '8px 16px', borderRadius: 8, border: 'none', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            background: 'rgba(250,250,250,0.06)', color: 'rgba(250,250,250,0.5)', transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.1)'; (e.currentTarget as HTMLElement).style.color = '#FAFAFA'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.5)'; }}
        >
          Restaurar stock
        </button>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            background: filter === 'all' ? 'rgba(250,250,250,0.12)' : 'rgba(250,250,250,0.04)',
            color: filter === 'all' ? '#FAFAFA' : 'rgba(250,250,250,0.5)',
            transition: 'all 0.2s',
          }}
        >
          Todos ({totalVariants})
        </button>
        {lowCount > 0 && (
          <button
            onClick={() => setFilter('low')}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === 'low' ? '#F59E0B' : 'rgba(245,158,11,0.1)',
              color: filter === 'low' ? '#0D0D0D' : '#F59E0B',
              transition: 'all 0.2s',
            }}
          >
            Stock Bajo ({lowCount})
          </button>
        )}
        {outCount > 0 && (
          <button
            onClick={() => setFilter('out')}
            style={{
              padding: '8px 16px', borderRadius: 10, border: 'none', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: filter === 'out' ? '#E53E3E' : 'rgba(229,62,62,0.1)',
              color: filter === 'out' ? '#FAFAFA' : '#E53E3E',
              transition: 'all 0.2s',
            }}
          >
            Agotados ({outCount})
          </button>
        )}
      </div>

      {/* Product Stock Cards */}
      <div style={{ display: 'grid', gap: 14 }}>
        {filteredProducts.map((product, i) => {
          const totalStock = product.variants.reduce((sum, v) => sum + (stockValues[v.id] ?? v.defaultStock), 0);

          return (
            <motion.div
              key={product.productId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{
                background: 'rgba(250,250,250,0.03)',
                border: '1px solid rgba(250,250,250,0.06)',
                borderRadius: 14, overflow: 'hidden',
              }}
            >
              {/* Product header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: '1px solid rgba(250,250,250,0.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'rgba(13,13,13,0.5)', flexShrink: 0 }}>
                  {product.imageUrl && <img src={product.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA' }}>{product.productName}</div>
                </div>
                <div style={{
                  padding: '4px 12px', borderRadius: 8, fontSize: 14, fontWeight: 700,
                  fontFamily: "'JetBrains Mono', monospace",
                  background: totalStock === 0 ? 'rgba(229,62,62,0.1)' : totalStock < 10 ? 'rgba(245,158,11,0.1)' : 'rgba(56,161,105,0.1)',
                  color: totalStock === 0 ? '#E53E3E' : totalStock < 10 ? '#F59E0B' : '#38A169',
                }}>
                  {totalStock} total
                </div>
              </div>

              {/* Variants */}
              <div style={{ padding: '10px 18px 14px' }}>
                {product.variants.map((variant) => {
                  const stock = stockValues[variant.id] ?? variant.defaultStock;
                  // Filter individual variants when filter is active
                  if (filter === 'low' && !(stock > 0 && stock < 5)) return null;
                  if (filter === 'out' && stock !== 0) return null;

                  return (
                    <div
                      key={variant.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '8px 0',
                        borderBottom: '1px solid rgba(250,250,250,0.03)',
                      }}
                    >
                      {/* Variant label */}
                      <div style={{ flex: 1, fontSize: 13, color: 'rgba(250,250,250,0.6)' }}>
                        {variant.label}
                      </div>

                      {/* Stock controls */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          onClick={() => adjustStock(variant.id, -1)}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(250,250,250,0.06)', color: 'rgba(250,250,250,0.5)',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(229,62,62,0.15)'; (e.currentTarget as HTMLElement).style.color = '#E53E3E'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.5)'; }}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={stock}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val)) setStockDirect(variant.id, val);
                          }}
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 18, fontWeight: 700,
                            color: getStockColor(stock),
                            minWidth: 50, width: 50, textAlign: 'center',
                            background: 'transparent', border: 'none', outline: 'none',
                            padding: 0, margin: 0,
                          }}
                        />
                        <button
                          onClick={() => adjustStock(variant.id, 1)}
                          style={{
                            width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
                            background: 'rgba(250,250,250,0.06)', color: 'rgba(250,250,250,0.5)',
                            fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(56,161,105,0.15)'; (e.currentTarget as HTMLElement).style.color = '#38A169'; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.5)'; }}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(250,250,250,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#128230;</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>Todo en orden</div>
          <div style={{ fontSize: 13 }}>No hay productos con stock bajo o agotado</div>
        </div>
      )}
    </div>
  );
}
