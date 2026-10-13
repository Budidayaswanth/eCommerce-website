import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';
import Loader from '../common/Loader';
import { RiAddLine, RiArrowUpLine, RiArrowDownLine, RiDeleteBinLine, RiEditLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const BannerManager = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    link: '/explore',
    active: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const data = await adminService.getBanners();
      setBanners(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const moveUp = (index) => {
    if (index === 0) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index - 1];
    newBanners[index - 1] = temp;
    setBanners(newBanners);
    toast.success('Banner order updated');
  };

  const moveDown = (index) => {
    if (index === banners.length - 1) return;
    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[index + 1];
    newBanners[index + 1] = temp;
    setBanners(newBanners);
    toast.success('Banner order updated');
  };

  const handleDelete = async (id) => {
    await adminService.deleteBanner(id);
    setBanners(banners.filter((b) => b.id !== id));
    toast.success('Banner removed');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.image) {
      toast.error('Title and banner image URL are required');
      return;
    }

    await adminService.saveBanner(formData);
    setIsModalOpen(false);
    setFormData({ title: '', subtitle: '', image: '', link: '/explore', active: true });
    fetchBanners();
    toast.success('Banner saved successfully');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-primary-dark)', margin: 0 }}>
            Homepage Banner & Campaign Hero Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            Control hero carousels, marketing callouts, and seasonal promotion links.
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)} icon={<RiAddLine />}>
          Add Hero Banner
        </Button>
      </div>

      {loading ? (
        <Loader size="md" message="Loading banners..." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {banners.map((ban, idx) => (
            <div
              key={ban.id}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-card)',
                padding: '16px 20px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-xs)',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <img
                  src={ban.image}
                  alt={ban.title}
                  style={{ width: '120px', height: '65px', borderRadius: '8px', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '1rem', color: 'var(--color-primary-dark)' }}>
                    {ban.title}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                    {ban.subtitle}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-primary)', marginTop: '4px' }}>
                    Links to: {ban.link}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => moveUp(idx)}
                  disabled={idx === 0}
                  style={{ padding: '6px', color: idx === 0 ? '#B0BEC5' : 'var(--color-primary-dark)' }}
                  title="Move Up"
                >
                  <RiArrowUpLine size={20} />
                </button>
                <button
                  onClick={() => moveDown(idx)}
                  disabled={idx === banners.length - 1}
                  style={{ padding: '6px', color: idx === banners.length - 1 ? '#B0BEC5' : 'var(--color-primary-dark)' }}
                  title="Move Down"
                >
                  <RiArrowDownLine size={20} />
                </button>
                <button
                  onClick={() => handleDelete(ban.id)}
                  style={{ padding: '6px', color: 'var(--color-accent)' }}
                  title="Delete Banner"
                >
                  <RiDeleteBinLine size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Banner Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Hero Banner">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Input
            label="Banner Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Festive Coating Bonanza"
            required
          />
          <Input
            label="Subtitle / Description"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="e.g. Flat 25% Off on all textures"
          />
          <Input
            label="Banner Image URL"
            value={formData.image}
            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
            placeholder="https://images.unsplash.com/..."
            required
          />
          <Input
            label="Destination Path"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/explore/interior-paints"
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Banner
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BannerManager;
