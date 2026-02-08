// ============================================================
// Pana Rabbids - Products Page (Admin)
// Grouped by category, inline image editing via URL,
// all changes persist to localStorage
// ============================================================

import { useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getProducts,
  getCategories,
  updateProductImage,
  toggleProductActive,
  addProductImage,
  removeProductImage,
  setPrimaryImage,
  updateProductGalleryImage,
  resetProduct,
} from '../../data/productDataService';
import { formatCOP } from '../../utils/formatCurrency';
import type { Product, ProductImage as ProductImageType } from '../../types/product';

// ── Reusable styles ─────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', background: 'rgba(250,250,250,0.04)',
  border: '1px solid rgba(250,250,250,0.08)', borderRadius: 8, color: '#FAFAFA',
  fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [editingImage, setEditingImage] = useState<number | null>(null); // productId being edited
  const [imageUrl, setImageUrl] = useState('');
  const [showToast, setShowToast] = useState('');
  // Force re-render when data changes in localStorage
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion(v => v + 1), []);

  const categories = useMemo(() => getCategories(), [version]);
  const allProducts = useMemo(() => getProducts(), [version]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter((p) => {
      if (deletedIds.includes(p.id)) return false;
      const matchesSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = categoryFilter === '' || p.categoryId === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, search, categoryFilter, deletedIds]);

  // Group products by category
  const groupedProducts = useMemo(() => {
    const groups: { category: { id: number; name: string }; products: Product[] }[] = [];
    const catMap = new Map<number, Product[]>();

    for (const p of filteredProducts) {
      const catId = p.categoryId;
      if (!catMap.has(catId)) catMap.set(catId, []);
      catMap.get(catId)!.push(p);
    }

    // Sort by category sortOrder
    const sortedCats = categories
      .filter(c => catMap.has(c.id))
      .sort((a, b) => a.sortOrder - b.sortOrder);

    for (const cat of sortedCats) {
      groups.push({
        category: { id: cat.id, name: cat.name },
        products: catMap.get(cat.id) || [],
      });
    }

    return groups;
  }, [filteredProducts, categories]);

  const handleToggleActive = (id: number) => {
    toggleProductActive(id);
    refresh();
  };

  const handleDelete = (id: number) => {
    setDeletedIds((prev) => [...prev, id]);
    setDeleteConfirm(null);
  };

  const handleOpenImageEditor = (productId: number) => {
    if (editingImage === productId) {
      setEditingImage(null);
      setImageUrl('');
    } else {
      setEditingImage(productId);
      setImageUrl('');
    }
  };

  const handleSetPrimaryImage = (productId: number, url: string) => {
    if (!url.trim()) return;
    updateProductImage(productId, url.trim());
    refresh();
    setImageUrl('');
    toast('Imagen principal actualizada');
  };

  const handleAddImage = (productId: number, url: string) => {
    if (!url.trim()) return;
    addProductImage(productId, url.trim());
    refresh();
    setImageUrl('');
    toast('Imagen agregada a la galeria');
  };

  const handleRemoveImage = (productId: number, idx: number) => {
    removeProductImage(productId, idx);
    refresh();
    toast('Imagen eliminada');
  };

  const handleSetAsPrimary = (productId: number, idx: number) => {
    setPrimaryImage(productId, idx);
    refresh();
    toast('Imagen principal cambiada');
  };

  const handleChangeGalleryImage = (productId: number, idx: number, url: string) => {
    if (!url.trim()) return;
    updateProductGalleryImage(productId, idx, url.trim());
    refresh();
    toast('Imagen actualizada');
  };

  const handleResetProduct = (productId: number) => {
    resetProduct(productId);
    refresh();
    toast('Producto restaurado a valores originales');
  };

  const toast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  const getTotalStock = (product: Product) =>
    product.variants.reduce((sum, v) => sum + v.stock, 0);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
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
              borderRadius: 12, padding: '12px 18px', boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
              display: 'flex', alignItems: 'center', gap: 10,
            }}
          >
            <span style={{ fontSize: 16 }}>&#9989;</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#FAFAFA' }}>{showToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#FAFAFA', margin: 0, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
            Mis Productos
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(250,250,250,0.4)', margin: '4px 0 0' }}>
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} en {groupedProducts.length} categoria{groupedProducts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/admin/products/new" style={{ textDecoration: 'none' }}>
          <motion.span
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              background: 'linear-gradient(135deg, #C4A35A, #D4B86A)', borderRadius: 10,
              color: '#0D0D0D', fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 4px 20px rgba(196,163,90,0.25)' }}
            whileTap={{ scale: 0.97 }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Producto
          </motion.span>
        </Link>
      </div>

      {/* Search + Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 280px', position: 'relative' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(250,250,250,0.3)" strokeWidth="2" strokeLinecap="round" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '11px 14px 11px 40px', background: 'rgba(250,250,250,0.04)',
              border: '1px solid rgba(250,250,250,0.08)', borderRadius: 10, color: '#FAFAFA',
              fontSize: 14, outline: 'none', boxSizing: 'border-box' as const,
            }}
            onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value))}
          style={{
            padding: '11px 14px', background: '#1A1A2E',
            border: '1px solid rgba(250,250,250,0.08)', borderRadius: 10, color: '#FAFAFA',
            fontSize: 14, outline: 'none', minWidth: 170, cursor: 'pointer', boxSizing: 'border-box' as const,
          }}
        >
          <option value="" style={{ background: '#1A1A2E', color: '#FAFAFA' }}>Todas las categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products grouped by category */}
      {groupedProducts.map(({ category, products }) => (
        <div key={category.id} style={{ marginBottom: 28 }}>
          {/* Category Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12,
            padding: '10px 16px',
            background: 'rgba(196,163,90,0.06)',
            border: '1px solid rgba(196,163,90,0.12)',
            borderRadius: 10,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#C4A35A', flexShrink: 0,
            }} />
            <span style={{
              fontSize: 15, fontWeight: 700, color: '#C4A35A',
              fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
              {category.name}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>
              {products.length} producto{products.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Product cards in this category */}
          <div style={{ display: 'grid', gap: 8 }}>
            {products.map((product, i) => (
              <ProductRow
                key={product.id}
                product={product}
                index={i}
                isEditing={editingImage === product.id}
                imageUrl={imageUrl}
                onImageUrlChange={setImageUrl}
                onToggleActive={handleToggleActive}
                onDelete={setDeleteConfirm}
                onToggleEditor={handleOpenImageEditor}
                onSetPrimaryImage={handleSetPrimaryImage}
                onAddImage={handleAddImage}
                onRemoveImage={handleRemoveImage}
                onSetAsPrimary={handleSetAsPrimary}
                onChangeGalleryImage={handleChangeGalleryImage}
                onResetProduct={handleResetProduct}
                getTotalStock={getTotalStock}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(250,250,250,0.3)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>&#128722;</div>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'rgba(250,250,250,0.5)' }}>No se encontraron productos</div>
          <div style={{ fontSize: 13 }}>Intenta con otra busqueda</div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: '#1A1A2E', border: '1px solid rgba(250,250,250,0.1)',
                borderRadius: 14, padding: 32, maxWidth: 400, width: '100%', textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ fontSize: 44, marginBottom: 14 }}>&#128465;</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#FAFAFA', marginBottom: 8 }}>
                Eliminar producto?
              </div>
              <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.5)', marginBottom: 28, lineHeight: 1.5 }}>
                Este producto se eliminara de tu tienda. Esta accion no se puede deshacer.
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  style={{
                    padding: '10px 24px', background: 'rgba(250,250,250,0.06)', border: '1px solid rgba(250,250,250,0.1)',
                    borderRadius: 10, color: '#FAFAFA', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  style={{
                    padding: '10px 24px', background: '#E53E3E', border: 'none',
                    borderRadius: 10, color: '#FAFAFA', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Si, eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Product Row Component ───────────────────────────────────
interface ProductRowProps {
  product: Product;
  index: number;
  isEditing: boolean;
  imageUrl: string;
  onImageUrlChange: (url: string) => void;
  onToggleActive: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleEditor: (id: number) => void;
  onSetPrimaryImage: (id: number, url: string) => void;
  onAddImage: (id: number, url: string) => void;
  onRemoveImage: (id: number, idx: number) => void;
  onSetAsPrimary: (id: number, idx: number) => void;
  onChangeGalleryImage: (id: number, idx: number, url: string) => void;
  onResetProduct: (id: number) => void;
  getTotalStock: (p: Product) => number;
}

function ProductRow({
  product, index, isEditing, imageUrl, onImageUrlChange,
  onToggleActive, onDelete, onToggleEditor,
  onSetPrimaryImage, onAddImage, onRemoveImage, onSetAsPrimary,
  onChangeGalleryImage, onResetProduct, getTotalStock,
}: ProductRowProps) {
  const totalStock = getTotalStock(product);
  const primaryImg = product.images.find((img) => img.isPrimary) || product.images[0];
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editUrl, setEditUrl] = useState('');

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.02 }}
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          background: isEditing ? 'rgba(196,163,90,0.06)' : 'rgba(250,250,250,0.03)',
          border: `1px solid ${isEditing ? 'rgba(196,163,90,0.2)' : 'rgba(250,250,250,0.06)'}`,
          borderRadius: isEditing ? '12px 12px 0 0' : 12,
          padding: '14px 18px',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          if (!isEditing) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.05)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(196,163,90,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isEditing) {
            (e.currentTarget as HTMLElement).style.background = 'rgba(250,250,250,0.03)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(250,250,250,0.06)';
          }
        }}
      >
        {/* Image (clickable to edit) */}
        <div
          onClick={() => onToggleEditor(product.id)}
          style={{
            width: 56, height: 56, borderRadius: 10, overflow: 'hidden',
            background: 'rgba(13,13,13,0.5)', flexShrink: 0, cursor: 'pointer',
            border: isEditing ? '2px solid #C4A35A' : '2px solid transparent',
            transition: 'border-color 0.2s',
            position: 'relative',
          }}
          title="Clic para editar imagenes"
        >
          {primaryImg && <img src={primaryImg.imageUrl} alt={primaryImg.altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          {/* Edit overlay */}
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = '0'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C4A35A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#FAFAFA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <span style={{ fontSize: 13, color: '#C4A35A', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>
              {formatCOP(product.basePrice)}
            </span>
            <span style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)' }}>|</span>
            <span style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)' }}>
              {product.images.length} img
            </span>
          </div>
        </div>

        {/* Stock badge */}
        <div style={{
          padding: '5px 12px', borderRadius: 8, fontSize: 13, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          background: totalStock === 0 ? 'rgba(229,62,62,0.1)' : totalStock <= 10 ? 'rgba(245,158,11,0.1)' : 'rgba(56,161,105,0.1)',
          color: totalStock === 0 ? '#E53E3E' : totalStock <= 10 ? '#F59E0B' : '#38A169',
          flexShrink: 0,
        }}>
          {totalStock} und
        </div>

        {/* Active toggle */}
        <button
          onClick={() => onToggleActive(product.id)}
          style={{
            width: 42, height: 24, borderRadius: 12, border: 'none', padding: 0,
            background: product.isActive ? '#38A169' : 'rgba(250,250,250,0.12)',
            position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0,
          }}
          title={product.isActive ? 'Visible en la tienda' : 'Oculto de la tienda'}
        >
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: '#FAFAFA',
            position: 'absolute', top: 3, left: product.isActive ? 21 : 3,
            transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
          }} />
        </button>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {/* Image edit button */}
          <button
            onClick={() => onToggleEditor(product.id)}
            style={{
              padding: '7px 12px',
              background: isEditing ? 'rgba(196,163,90,0.25)' : 'rgba(196,163,90,0.08)',
              color: '#C4A35A',
              borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 5,
            }}
            title="Editar imagenes"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Imagen
          </button>
          <Link
            to={`/admin/productos/${product.id}/editar`}
            style={{
              padding: '7px 14px', background: 'rgba(196,163,90,0.1)', color: '#C4A35A',
              borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: 'none',
            }}
          >
            Editar
          </Link>
          <button
            onClick={() => onDelete(product.id)}
            style={{
              padding: '7px 14px', background: 'rgba(229,62,62,0.08)', color: '#E53E3E',
              borderRadius: 8, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            Eliminar
          </button>
        </div>
      </motion.div>

      {/* Image Editor Panel */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{
              background: 'rgba(196,163,90,0.04)',
              border: '1px solid rgba(196,163,90,0.15)',
              borderTop: 'none',
              borderRadius: '0 0 12px 12px',
              padding: '16px 18px',
            }}>
              {/* Current images gallery */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(250,250,250,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Galeria de imagenes ({product.images.length})
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {product.images.map((img: ProductImageType, idx: number) => (
                    <div key={img.id} style={{ position: 'relative' }}>
                      <div style={{
                        width: 80, height: 80, borderRadius: 8, overflow: 'hidden',
                        border: img.isPrimary ? '2px solid #C4A35A' : '2px solid rgba(250,250,250,0.1)',
                        cursor: 'pointer',
                      }}>
                        <img src={img.imageUrl} alt={img.altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      {img.isPrimary && (
                        <div style={{
                          position: 'absolute', top: -6, left: -6,
                          background: '#C4A35A', color: '#0D0D0D', fontSize: 9, fontWeight: 700,
                          padding: '2px 6px', borderRadius: 6,
                        }}>
                          PRINCIPAL
                        </div>
                      )}
                      {/* Action buttons on hover */}
                      <div style={{
                        display: 'flex', gap: 3, marginTop: 4, justifyContent: 'center',
                      }}>
                        {!img.isPrimary && (
                          <button
                            onClick={() => onSetAsPrimary(product.id, idx)}
                            style={{
                              background: 'rgba(196,163,90,0.15)', border: 'none', borderRadius: 4,
                              color: '#C4A35A', fontSize: 9, padding: '3px 6px', cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Hacer principal"
                          >
                            &#9733;
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setEditingIdx(idx);
                            setEditUrl('');
                          }}
                          style={{
                            background: 'rgba(59,130,246,0.15)', border: 'none', borderRadius: 4,
                            color: '#3B82F6', fontSize: 9, padding: '3px 6px', cursor: 'pointer',
                            fontWeight: 600,
                          }}
                          title="Cambiar URL"
                        >
                          &#9998;
                        </button>
                        {product.images.length > 1 && (
                          <button
                            onClick={() => onRemoveImage(product.id, idx)}
                            style={{
                              background: 'rgba(229,62,62,0.15)', border: 'none', borderRadius: 4,
                              color: '#E53E3E', fontSize: 9, padding: '3px 6px', cursor: 'pointer',
                              fontWeight: 600,
                            }}
                            title="Eliminar"
                          >
                            &#10005;
                          </button>
                        )}
                      </div>
                      {/* Inline URL editor for specific image */}
                      {editingIdx === idx && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 10, marginTop: 4, width: 220 }}>
                          <div style={{
                            background: '#1A1A2E', border: '1px solid rgba(196,163,90,0.2)',
                            borderRadius: 8, padding: 8,
                          }}>
                            <input
                              type="text"
                              value={editUrl}
                              onChange={(e) => setEditUrl(e.target.value)}
                              placeholder="Pegar URL de imagen..."
                              style={{ ...inputStyle, fontSize: 11, padding: '7px 10px', marginBottom: 6 }}
                              onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
                              onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  onChangeGalleryImage(product.id, idx, editUrl);
                                  setEditingIdx(null);
                                }
                                if (e.key === 'Escape') setEditingIdx(null);
                              }}
                            />
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button
                                onClick={() => {
                                  onChangeGalleryImage(product.id, idx, editUrl);
                                  setEditingIdx(null);
                                }}
                                style={{
                                  flex: 1, padding: '5px 0', background: '#C4A35A', border: 'none',
                                  borderRadius: 5, color: '#0D0D0D', fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                }}
                              >
                                Cambiar
                              </button>
                              <button
                                onClick={() => setEditingIdx(null)}
                                style={{
                                  padding: '5px 8px', background: 'rgba(250,250,250,0.06)',
                                  border: '1px solid rgba(250,250,250,0.1)',
                                  borderRadius: 5, color: '#FAFAFA', fontSize: 11, cursor: 'pointer',
                                }}
                              >
                                &#10005;
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Add new image / Change primary */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8, alignItems: 'end',
              }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(250,250,250,0.4)', display: 'block', marginBottom: 4 }}>
                    Pegar URL de imagen
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => onImageUrlChange(e.target.value)}
                    placeholder="https://ejemplo.com/imagen.jpg"
                    style={inputStyle}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(196,163,90,0.4)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(250,250,250,0.08)'; }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        onSetPrimaryImage(product.id, imageUrl);
                      }
                    }}
                  />
                </div>
                <button
                  onClick={() => onSetPrimaryImage(product.id, imageUrl)}
                  disabled={!imageUrl.trim()}
                  style={{
                    padding: '9px 14px',
                    background: imageUrl.trim() ? '#C4A35A' : 'rgba(196,163,90,0.3)',
                    border: 'none', borderRadius: 8, color: '#0D0D0D', fontSize: 12,
                    fontWeight: 700, cursor: imageUrl.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Cambiar principal
                </button>
                <button
                  onClick={() => onAddImage(product.id, imageUrl)}
                  disabled={!imageUrl.trim()}
                  style={{
                    padding: '9px 14px',
                    background: imageUrl.trim() ? 'rgba(56,161,105,0.15)' : 'rgba(56,161,105,0.06)',
                    border: `1px solid ${imageUrl.trim() ? 'rgba(56,161,105,0.3)' : 'rgba(56,161,105,0.1)'}`,
                    borderRadius: 8, color: imageUrl.trim() ? '#38A169' : 'rgba(56,161,105,0.4)',
                    fontSize: 12, fontWeight: 700,
                    cursor: imageUrl.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap',
                  }}
                >
                  + Agregar
                </button>
              </div>

              {/* Image preview */}
              {imageUrl.trim() && (
                <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.4)' }}>Vista previa:</div>
                  <div style={{
                    width: 48, height: 48, borderRadius: 6, overflow: 'hidden',
                    border: '1px solid rgba(196,163,90,0.3)', background: 'rgba(0,0,0,0.3)',
                  }}>
                    <img
                      src={imageUrl.trim()}
                      alt="Preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {imageUrl.trim()}
                  </div>
                </div>
              )}

              {/* Reset to defaults */}
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => onResetProduct(product.id)}
                  style={{
                    padding: '6px 12px', background: 'rgba(250,250,250,0.04)',
                    border: '1px solid rgba(250,250,250,0.08)', borderRadius: 6,
                    color: 'rgba(250,250,250,0.4)', fontSize: 11, cursor: 'pointer',
                  }}
                >
                  Restaurar imagenes originales
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
