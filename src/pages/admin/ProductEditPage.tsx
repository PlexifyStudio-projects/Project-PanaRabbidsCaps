import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getProducts, getCategories, updateProduct, addProductImage, removeProductImage, setPrimaryImage } from '../../data/productDataService';
import { formatCOP } from '../../utils/formatCurrency';

interface VariantForm {
  id: number;
  size: string;
  color: string;
  sku: string;
  priceOverride: string;
  stock: number;
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';
  const PRODUCTS = useMemo(() => getProducts(), []);
  const CATEGORIES = useMemo(() => getCategories(), []);

  const existingProduct = useMemo(() => {
    if (isNew) return null;
    return PRODUCTS.find((p) => p.id === Number(id)) || null;
  }, [id, isNew, PRODUCTS]);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number>(CATEGORIES[0]?.id || 1);
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [variants, setVariants] = useState<VariantForm[]>([]);
  const [specMaterial, setSpecMaterial] = useState('Tela premium / Poliester de alta densidad');
  const [specBordado, setSpecBordado] = useState('3D de alta densidad');
  const [specVisera, setSpecVisera] = useState('Plana / Curva (segun modelo)');
  const [specOrigen, setSpecOrigen] = useState('Importada');
  const [footerNote, setFooterNote] = useState('Todas nuestras gorras vienen con certificado de autenticidad y empaque premium. Calidad garantizada por Pana Rabbids.');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [imageVersion, setImageVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current images (refreshes when imageVersion changes)
  const currentImages = useMemo(() => {
    if (!existingProduct) return [];
    const fresh = getProducts().find(p => p.id === existingProduct.id);
    return fresh?.images || existingProduct.images;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProduct, imageVersion]);

  const processFiles = useCallback((files: FileList | File[]) => {
    if (!existingProduct) return;
    const fileArr = Array.from(files);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    fileArr.forEach(file => {
      if (!validTypes.includes(file.type)) return;
      if (file.size > maxSize) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        addProductImage(existingProduct.id, dataUrl);
        setImageVersion(v => v + 1);
      };
      reader.readAsDataURL(file);
    });
  }, [existingProduct]);

  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setSlug(existingProduct.slug);
      setCategoryId(existingProduct.categoryId);
      setDescription(existingProduct.description);
      setBasePrice(String(existingProduct.basePrice));
      setComparePrice(existingProduct.comparePrice ? String(existingProduct.comparePrice) : '');
      setMetaTitle(existingProduct.metaTitle);
      setMetaDescription(existingProduct.metaDescription);
      setIsActive(existingProduct.isActive);
      setIsFeatured(existingProduct.isFeatured);
      setVariants(
        existingProduct.variants.map((v) => ({
          id: v.id,
          size: v.size,
          color: v.color,
          sku: v.sku,
          priceOverride: v.priceOverride ? String(v.priceOverride) : '',
          stock: v.stock,
        }))
      );
      if (existingProduct.specs) {
        setSpecMaterial(existingProduct.specs['Material'] || 'Tela premium / Poliester de alta densidad');
        setSpecBordado(existingProduct.specs['Bordado'] || '3D de alta densidad');
        setSpecVisera(existingProduct.specs['Visera'] || 'Plana / Curva (segun modelo)');
        setSpecOrigen(existingProduct.specs['Origen'] || 'Importada');
        if (existingProduct.specs['_footerNote'] !== undefined) {
          setFooterNote(existingProduct.specs['_footerNote']);
        }
      }
    }
  }, [existingProduct]);

  useEffect(() => {
    if (isNew || !existingProduct) {
      const generated = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generated);
    }
  }, [name, isNew, existingProduct]);

  const addVariant = () => {
    setVariants((prev) => [...prev, { id: Date.now(), size: '', color: '', sku: '', priceOverride: '', stock: 0 }]);
  };

  const updateVariant = (idx: number, field: keyof VariantForm, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v)));
  };

  const removeVariant = (idx: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!existingProduct) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));

    // Build variant data matching ProductVariant interface
    const variantData = variants.map(v => ({
      id: v.id,
      productId: existingProduct.id,
      name: `${v.size} / ${v.color}`,
      sku: v.sku,
      priceOverride: v.priceOverride ? Number(v.priceOverride) : null,
      size: v.size,
      color: v.color,
      colorHex: existingProduct.variants.find(ev => ev.id === v.id)?.colorHex || '#000000',
      isActive: true,
      stock: v.stock,
    }));

    updateProduct(existingProduct.id, {
      name,
      slug,
      categoryId,
      description,
      basePrice: Number(basePrice) || existingProduct.basePrice,
      comparePrice: comparePrice ? Number(comparePrice) : null,
      metaTitle,
      metaDescription,
      isActive,
      isFeatured,
      variants: variantData,
      specs: {
        Material: specMaterial,
        Bordado: specBordado,
        Visera: specVisera,
        Origen: specOrigen,
        _footerNote: footerNote,
      },
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(26,26,46,0.6)',
    border: '1px solid rgba(250,250,250,0.06)',
    borderRadius: 12,
    padding: 28,
    marginBottom: 24,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    color: '#C4A35A',
    marginBottom: 20,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'rgba(250,250,250,0.6)',
    marginBottom: 6,
    letterSpacing: 0.5,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(13,13,13,0.6)',
    border: '1px solid rgba(250,250,250,0.1)',
    borderRadius: 8,
    color: '#FAFAFA',
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.3s',
    boxSizing: 'border-box' as const,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: 100,
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const focusHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = '#C4A35A';
  };
  const blurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.target.style.borderColor = 'rgba(250,250,250,0.1)';
  };

  const checkboxStyle = (checked: boolean): React.CSSProperties => ({
    width: 22,
    height: 22,
    borderRadius: 6,
    border: checked ? '2px solid #C4A35A' : '2px solid rgba(250,250,250,0.2)',
    background: checked ? 'rgba(196,163,90,0.2)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    flexShrink: 0,
  });

  const variantInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    background: 'rgba(13,13,13,0.5)',
    border: '1px solid rgba(250,250,250,0.08)',
    borderRadius: 6,
    color: '#FAFAFA',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const vThStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(250,250,250,0.4)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
    borderBottom: '1px solid rgba(250,250,250,0.08)',
  };

  return (
    <div style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <Link
          to="/admin/productos"
          style={{ color: 'rgba(250,250,250,0.4)', textDecoration: 'none', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 16, transition: 'color 0.2s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#C4A35A'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(250,250,250,0.4)'; }}
        >
          &larr; Volver a productos
        </Link>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#FAFAFA', margin: 0 }}>
          {isNew ? 'Crear Producto' : `Editar: ${existingProduct?.name || ''}`}
        </h1>
      </div>

      {/* Success Toast */}
      {saved && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ background: 'rgba(56,161,105,0.15)', border: '1px solid rgba(56,161,105,0.3)', borderRadius: 8, padding: '14px 20px', marginBottom: 20, color: '#38A169', fontSize: 14, fontWeight: 600 }}
        >
          Producto guardado exitosamente
        </motion.div>
      )}

      {/* Info General */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Informaci&oacute;n General</div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="Nombre del producto" style={inputStyle} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
          <div>
            <label style={labelStyle}>Slug</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="slug-del-producto" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'rgba(250,250,250,0.5)' }} />
          </div>
          <div>
            <label style={labelStyle}>Categor&iacute;a</label>
            <select value={categoryId} onChange={(e) => setCategoryId(Number(e.target.value))} onFocus={focusHandler as any} onBlur={blurHandler as any} style={{ ...inputStyle, cursor: 'pointer', background: '#1A1A2E' }}>
              {CATEGORIES.map((cat) => (
                <option key={cat.id} value={cat.id} style={{ background: '#1A1A2E', color: '#FAFAFA' }}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>Descripci&oacute;n</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="Descripci&#243;n detallada del producto..." style={textareaStyle} />
        </div>
        <div style={{ marginTop: 18 }}>
          <label style={labelStyle}>Nota al pie de descripci&oacute;n</label>
          <textarea value={footerNote} onChange={(e) => setFooterNote(e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="Texto que aparece debajo de la descripci&#243;n del producto" style={{ ...textareaStyle, minHeight: 60 }} />
          <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', marginTop: 4 }}>Aparece debajo de la descripci&oacute;n en la p&aacute;gina del producto</div>
        </div>
      </div>

      {/* Precios */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Precios</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Precio Base (COP)</label>
            <input type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="0" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} />
            {basePrice && <div style={{ fontSize: 12, color: '#C4A35A', marginTop: 4 }}>{formatCOP(Number(basePrice))}</div>}
          </div>
          <div>
            <label style={labelStyle}>Precio Comparaci&oacute;n (COP)</label>
            <input type="number" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="Opcional" style={{ ...inputStyle, fontFamily: "'JetBrains Mono', monospace" }} />
            {comparePrice && <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)', marginTop: 4, textDecoration: 'line-through' }}>{formatCOP(Number(comparePrice))}</div>}
          </div>
        </div>
      </div>

      {/* SEO */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>SEO</div>
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Meta T&iacute;tulo</label>
          <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} placeholder="T&#237;tulo para motores de b&#250;squeda" style={inputStyle} />
          <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', marginTop: 4 }}>{metaTitle.length}/60 caracteres</div>
        </div>
        <div>
          <label style={labelStyle}>Meta Descripci&oacute;n</label>
          <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} onFocus={focusHandler as any} onBlur={blurHandler as any} placeholder="Descripci&#243;n para motores de b&#250;squeda" style={{ ...textareaStyle, minHeight: 70 }} />
          <div style={{ fontSize: 11, color: 'rgba(250,250,250,0.3)', marginTop: 4 }}>{metaDescription.length}/160 caracteres</div>
        </div>
      </div>

      {/* Especificaciones */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Especificaciones</div>
        <p style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)', marginTop: -12, marginBottom: 16 }}>
          Estos datos aparecen en la pesta&ntilde;a "Detalles" de la p&aacute;gina del producto
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
          <div>
            <label style={labelStyle}>Material</label>
            <input type="text" value={specMaterial} onChange={(e) => setSpecMaterial(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Bordado</label>
            <input type="text" value={specBordado} onChange={(e) => setSpecBordado(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={labelStyle}>Visera</label>
            <input type="text" value={specVisera} onChange={(e) => setSpecVisera(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Origen</label>
            <input type="text" value={specOrigen} onChange={(e) => setSpecOrigen(e.target.value)} onFocus={focusHandler} onBlur={blurHandler} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Imagen */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Im&aacute;genes</div>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files) processFiles(e.target.files);
            e.target.value = '';
          }}
        />
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOver(false);
            if (e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? '#C4A35A' : 'rgba(250,250,250,0.12)'}`,
            borderRadius: 12, padding: '48px 24px', textAlign: 'center',
            transition: 'all 0.3s', background: dragOver ? 'rgba(196,163,90,0.05)' : 'transparent',
            cursor: 'pointer', marginBottom: currentImages.length ? 20 : 0,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 12, opacity: 0.3 }}>&#128247;</div>
          <div style={{ fontSize: 14, color: 'rgba(250,250,250,0.5)', marginBottom: 4 }}>
            {existingProduct
              ? 'Arrastra im\u00E1genes aqu\u00ED o haz clic para subir'
              : 'Guarda el producto primero para agregar im\u00E1genes'}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.3)' }}>JPG, PNG o WebP. M&aacute;ximo 5MB por imagen.</div>
        </div>
        {/* Current images grid with controls */}
        {currentImages.length > 0 && (
          <div>
            <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.4)', marginBottom: 12 }}>
              Im&aacute;genes actuales ({currentImages.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 12 }}>
              {currentImages.map((img, idx) => (
                <div key={img.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', aspectRatio: '1', border: img.isPrimary ? '2px solid #C4A35A' : '1px solid rgba(250,250,250,0.08)' }}>
                  <img src={img.imageUrl} alt={img.altText} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {img.isPrimary && (
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(196,163,90,0.9)', color: '#0D0D0D', fontSize: 9, fontWeight: 700, textAlign: 'center', padding: '3px 0', letterSpacing: 1 }}>
                      PRINCIPAL
                    </div>
                  )}
                  {/* Action buttons */}
                  <div style={{ position: 'absolute', bottom: 6, left: 6, right: 6, display: 'flex', gap: 4, justifyContent: 'center' }}>
                    {!img.isPrimary && existingProduct && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setPrimaryImage(existingProduct.id, idx); setImageVersion(v => v + 1); }}
                        title="Hacer principal"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: 'rgba(0,0,0,0.7)', color: '#C4A35A', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        &#9733;
                      </button>
                    )}
                    {existingProduct && currentImages.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeProductImage(existingProduct.id, idx); setImageVersion(v => v + 1); }}
                        title="Eliminar imagen"
                        style={{
                          width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer',
                          background: 'rgba(0,0,0,0.7)', color: '#E53E3E', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backdropFilter: 'blur(4px)',
                        }}
                      >
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Variantes */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ ...sectionTitleStyle, marginBottom: 0 }}>Variantes</div>
          <button
            onClick={addVariant}
            style={{ padding: '8px 18px', background: 'rgba(196,163,90,0.15)', border: '1px solid rgba(196,163,90,0.3)', borderRadius: 6, color: '#C4A35A', fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 0.5 }}
          >
            + Agregar Variante
          </button>
        </div>

        {variants.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'rgba(250,250,250,0.3)', fontSize: 14 }}>
            No hay variantes. Agrega al menos una variante para el producto.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={vThStyle}>Talla</th>
                  <th style={vThStyle}>Color</th>
                  <th style={vThStyle}>SKU</th>
                  <th style={vThStyle}>Precio Override</th>
                  <th style={vThStyle}>Stock</th>
                  <th style={{ ...vThStyle, width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v, idx) => (
                  <tr key={v.id}>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input type="text" value={v.size} onChange={(e) => updateVariant(idx, 'size', e.target.value)} placeholder="7 1/4" style={variantInputStyle} />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input type="text" value={v.color} onChange={(e) => updateVariant(idx, 'color', e.target.value)} placeholder="Negro" style={variantInputStyle} />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input type="text" value={v.sku} onChange={(e) => updateVariant(idx, 'sku', e.target.value)} placeholder="SKU-XXX" style={{ ...variantInputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input type="number" value={v.priceOverride} onChange={(e) => updateVariant(idx, 'priceOverride', e.target.value)} placeholder="Opcional" style={{ ...variantInputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }} />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <input
                        type="number"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, 'stock', Number(e.target.value))}
                        min={0}
                        style={{ ...variantInputStyle, fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, width: 70, textAlign: 'center', color: v.stock === 0 ? '#E53E3E' : v.stock < 5 ? '#F59E0B' : '#38A169' }}
                      />
                    </td>
                    <td style={{ padding: '8px 6px', verticalAlign: 'middle' }}>
                      <button
                        onClick={() => removeVariant(idx)}
                        style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(229,62,62,0.1)', border: 'none', color: '#E53E3E', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        title="Eliminar variante"
                      >
                        &times;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Opciones */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Opciones</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0' }} onClick={() => setIsActive(!isActive)}>
          <div style={checkboxStyle(isActive)}>
            {isActive && <span style={{ color: '#C4A35A', fontSize: 14, fontWeight: 700 }}>&#10003;</span>}
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#FAFAFA', fontWeight: 500 }}>Activo</div>
            <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>El producto ser&aacute; visible en la tienda</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0' }} onClick={() => setIsFeatured(!isFeatured)}>
          <div style={checkboxStyle(isFeatured)}>
            {isFeatured && <span style={{ color: '#C4A35A', fontSize: 14, fontWeight: 700 }}>&#10003;</span>}
          </div>
          <div>
            <div style={{ fontSize: 14, color: '#FAFAFA', fontWeight: 500 }}>Destacado</div>
            <div style={{ fontSize: 12, color: 'rgba(250,250,250,0.35)' }}>Aparece en la secci&oacute;n de destacados</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 8, paddingBottom: 40 }}>
        <Link to="/admin/productos" style={{ textDecoration: 'none' }}>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ padding: '14px 32px', background: 'transparent', border: '1px solid rgba(250,250,250,0.15)', borderRadius: 8, color: 'rgba(250,250,250,0.6)', fontSize: 14, fontWeight: 600, cursor: 'pointer', letterSpacing: 1 }}
          >
            CANCELAR
          </motion.button>
        </Link>
        <motion.button
          onClick={handleSave}
          disabled={saving}
          whileHover={!saving ? { scale: 1.02, boxShadow: '0 8px 30px rgba(196,163,90,0.3)' } : {}}
          whileTap={!saving ? { scale: 0.98 } : {}}
          style={{
            padding: '14px 40px',
            background: saving ? 'rgba(196,163,90,0.5)' : 'linear-gradient(135deg, #C4A35A, #D4B86A)',
            border: 'none', borderRadius: 8, color: '#0D0D0D', fontSize: 14, fontWeight: 700,
            cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: 2,
          }}
        >
          {saving ? 'GUARDANDO...' : 'GUARDAR'}
        </motion.button>
      </div>
    </div>
  );
}
