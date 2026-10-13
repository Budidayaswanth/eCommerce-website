import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import StarRating from '../common/StarRating';
import { RiDoubleQuotesL } from 'react-icons/ri';

import 'swiper/css';
import 'swiper/css/pagination';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Vikramaditya Roy',
    role: 'Architect & Interior Designer, Bangalore',
    quote: 'We specified Leo Paints Royale Velvet Touch across a 6,500 sq.ft duplex. The light refraction and smoothness surpassed even international luxury coatings.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Meera Nambiar',
    role: 'Homeowner, Kochi',
    quote: 'Coastal rains ruined our exterior plaster every year. After applying Ultima WeatherShield two monsoons ago, not a single damp patch has appeared. Outstanding!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Arjun Singhal',
    role: 'Commercial Contractor, Delhi NCR',
    quote: 'The computerized shade consistency is remarkable. We ordered 120 cans across multiple batches and every single can was 100% true to swatch.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  },
];

const Testimonials = () => {
  return (
    <section style={{ marginBottom: '48px' }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 28px' }}>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '700',
            color: 'var(--color-secondary-dark)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Customer Experiences
        </span>
        <h2 style={{ color: 'var(--color-primary-dark)', fontSize: '1.625rem', marginTop: '4px' }}>
          Loved by Architects & Homeowners
        </h2>
      </div>

      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={24}
        slidesPerView={1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        style={{ paddingBottom: '36px' }}
      >
        {TESTIMONIALS.map((t) => (
          <SwiperSlide key={t.id}>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-card)',
                padding: '28px',
                boxShadow: 'var(--shadow-card)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                border: '1px solid var(--color-border-light)',
                position: 'relative',
              }}
            >
              <RiDoubleQuotesL
                size={36}
                style={{ color: 'var(--color-primary-subtle)', position: 'absolute', top: '16px', right: '16px' }}
              />

              <div>
                <StarRating rating={t.rating} size={16} />
                <p
                  style={{
                    color: 'var(--color-text-primary)',
                    fontSize: '0.9375rem',
                    lineHeight: 1.6,
                    fontStyle: 'italic',
                    margin: '16px 0 24px',
                  }}
                >
                  "{t.quote}"
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--color-secondary)',
                  }}
                />
                <div>
                  <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--color-primary-dark)' }}>
                    {t.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    {t.role}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Testimonials;
