import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { formatPrice } from '../../utils/formatters';
import { CATEGORIES, PAINT_TYPES, FINISHES } from '../../utils/constants';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiSearchLine, RiImageAddLine } from 'react-icons/ri';
import useDebounce from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const ProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'interior',
    categoryName: 'Interior Paints',
    paintType: 'Luxury Emulsion',
    finish: 'Matte',
    price: '',
    mrp: '',
    stock: '',
    coverage: '120-140 sq.ft/L',
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
    description: '',
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      setProducts(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category: 'interior',
      categoryName: 'Interior Paints',
      paintType: 'Luxury Emulsion',
      finish: 'Matte',
      price: '',
      mrp: '',
      stock: '',
      coverage: '120-140 sq.ft/L',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&auto=format&fit=crop&q=80',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      categoryName: p.categoryName,
      paintType: p.paintType,
      finish: p.finish,
      price: p.price,
      mrp: p.mrp,
      stock: p.stock,
      coverage: p.coverage,
      image: p.image,
      description: p.description || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you wish to permanently remove this paint SKU?')) {
      await adminService.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Product title and pricing are required');
      return;
    }

    try {
      if (editingProduct) {
        await adminService.updateProduct(editingProduct.id, formData);
        toast.success('Product updated');
      } else {
        await adminService.createProduct(formData);
        toast.success('New product listed successfully');
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const filtered = products.filter((p) => {
    const term = (debouncedSearchTerm || '').toLowerCase();
    const matchesSearch =
      (p.name || '').toLowerCase().includes(term) ||
      (p.paintType || '').toLowerCase().includes(term);
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Paint Product Catalog Management
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Configure finishes, technical specs, coverage indices, and warehouse pricing.
          </p>
        </div>

        <Button variant="primary" onClick={handleOpenAdd} icon={<RiAddLine />}>
          Add New Paint SKU
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-xs)',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Input
            placeholder="Search by paint name or polymer type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<RiSearchLine />}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{
            height: '42px',
            padding: '0 14px',
            borderRadius: 'var(--radius-btn)',
            border: '1.5px solid var(--color-border)',
            backgroundColor: '#FFFFFF',
            fontSize: '0.875rem',
          }}
        >
          <option value="all">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-card)',
          padding: '20px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-border)',
          overflowX: 'auto',
        }}
      >
        {loading ? (
          <Loader size="md" message="Loading catalog..." />
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                <th style={{ padding: '12px 14px' }}>Product</th>
                <th style={{ padding: '12px 14px' }}>Category</th>
                <th style={{ padding: '12px 14px' }}>Sheen Finish</th>
                <th style={{ padding: '12px 14px' }}>Selling Price</th>
                <th style={{ padding: '12px 14px' }}>Stock</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((prod) => (
                <tr key={prod.id} style={{ borderBottom: '1px solid var(--color-border-light)' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={prod.image}
                        alt={prod.name}
                        style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--color-primary-dark)' }}>{prod.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{prod.paintType}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>{prod.categoryName}</td>
                  <td style={{ padding: '12px 14px' }}>{prod.finish}</td>
                  <td style={{ padding: '12px 14px', fontWeight: '700', color: 'var(--color-primary)' }}>
                    {formatPrice(prod.price)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        backgroundColor: prod.stock < 20 ? 'var(--color-danger-bg)' : 'var(--color-success-bg)',
                        color: prod.stock < 20 ? 'var(--color-danger)' : 'var(--color-success)',
                      }}
                    >
                      {prod.stock} units
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEdit(prod)}
                        style={{ padding: '6px', color: 'var(--color-primary)' }}
                        title="Edit product"
                      >
                        <RiEditLine size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        style={{ padding: '6px', color: 'var(--color-danger)' }}
                        title="Delete product"
                      >
                        <RiDeleteBinLine size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Paint Product' : 'Add New Paint SKU'}
        maxWidth="600px"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Product Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Royale Satin Luxury Emulsion"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const cat = CATEGORIES.find((c) => c.id === e.target.value);
                  setFormData({ ...formData, category: e.target.value, categoryName: cat?.name || '' });
                }}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid var(--color-border)' }}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '6px' }}>
                Paint Technology
              </label>
              <select
                value={formData.paintType}
                onChange={(e) => setFormData({ ...formData, paintType: e.target.value })}
                style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '8px', border: '1.5px solid var(--color-border)' }}
              >
                {PAINT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <Input
              label="Selling Price (₹)"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <Input
              label="MRP Listing (₹)"
              type="number"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
            />
            <Input
              label="Warehouse Stock"
              type="number"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              required
            />
          </div>

          <Input
            label="Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            icon={<RiImageAddLine />}
          />

          <Input
            label="Technical Description"
            type="textarea"
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Update SKU' : 'Save & Publish Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ProductManager;
