import React from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Button from '../common/Button';
import { RiArrowRightLine } from 'react-icons/ri';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const SLIDES = [
  {
    id: 1,
    title: 'Royal Elegance for Majestic Living',
    subtitle: 'Ultra-luxurious Teflon surface emulsions with zero stains and velvet matte sheen.',
    cta: 'Explore Interior Paints',
    link: '/explore/interior-paints',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
    tag: 'FESTIVE COLLECTION 2026',
  },
  {
    id: 2,
    title: 'Unconquerable All-Weather Protection',
    subtitle: 'Engineered with nano-silicone barrier for 10-year monsoon & UV color lock.',
    cta: 'Discover Exterior Shield',
    link: '/explore/exterior-paints',
    image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1600&auto=format&fit=crop&q=80',
    tag: 'EXTERIOR INNOVATION',
  },
  {
    id: 3,
    title: 'Artisan Metallic Textures & Velvet Stucco',
    subtitle: 'Enrich feature walls with Venetian trowel styles and shimmering gold flakes.',
    cta: 'Browse Designer Finishes',
    link: '/explore/textures',
    image: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1600&auto=format&fit=crop&q=80',
    tag: 'DESIGNER SPECIAL',
  },
];

const HeroBanner = () => {
  return (
    <div
      style={{
        width: '100%',
        borderRadius: 'var(--radius-card)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '40px',
      }}
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        pagination={{ clickable: true }}
        navigation
        loop
        style={{ width: '100%', height: '500px' }}
        className="hero-swiper-container"
      >
        {SLIDES.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                backgroundImage: `url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {/* Deep Navy/Black Gradient Overlay for readability */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(90deg, rgba(13, 19, 84, 0.92) 0%, rgba(26, 35, 126, 0.65) 50%, rgba(0, 0, 0, 0.2) 100%)',
                }}
              />

              {/* Text & CTA */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 2,
                  maxWidth: '680px',
                  padding: '0 48px',
                  color: '#FFFFFF',
                }}
                className="hero-text-content"
              >
                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: 'rgba(255, 215, 0, 0.2)',
                    color: 'var(--color-secondary)',
                    fontWeight: '700',
                    fontSize: '0.75rem',
                    letterSpacing: '1.5px',
                    marginBottom: '16px',
                    border: '1px solid rgba(255, 215, 0, 0.4)',
                  }}
                >
                  {slide.tag}
                </div>

                <h1
                  style={{
                    color: '#FFFFFF',
                    fontSize: '2.6rem',
                    fontWeight: '800',
                    lineHeight: 1.15,
                    marginBottom: '16px',
                    textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  }}
                  className="hero-title"
                >
                  {slide.title}
                </h1>

                <p
                  style={{
                    fontSize: '1.05rem',
                    color: '#E0E0E0',
                    lineHeight: 1.6,
                    marginBottom: '28px',
                    maxWidth: '540px',
                  }}
                  className="hero-desc"
                >
                  {slide.subtitle}
                </p>

                <Link to={slide.link}>
                  <Button variant="accent" size="lg" endIcon={<RiArrowRightLine />}>
                    {slide.cta}
                  </Button>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-swiper-container .swiper-button-next,
        .hero-swiper-container .swiper-button-prev {
          color: var(--color-secondary) !important;
          background-color: rgba(26, 35, 126, 0.6);
          width: 44px;
          height: 44px;
          border-radius: 50%;
        }
        .hero-swiper-container .swiper-button-next:after,
        .hero-swiper-container .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: bold;
        }
        .hero-swiper-container .swiper-pagination-bullet-active {
          background: var(--color-secondary) !important;
          width: 24px;
          border-radius: 4px;
        }
        @media (max-width: 768px) {
          .hero-swiper-container {
            height: 320px !important;
          }
          .hero-text-content {
            padding: 0 20px !important;
          }
          .hero-title {
            font-size: 1.5rem !important;
            margin-bottom: 8px !important;
          }
          .hero-desc {
            font-size: 0.8125rem !important;
            margin-bottom: 16px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HeroBanner;
