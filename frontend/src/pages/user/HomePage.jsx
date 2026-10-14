import React from 'react';
import HeroBanner from '../../components/home/HeroBanner';
import CategoryGrid from '../../components/home/CategoryGrid';
import PromotionalBanners from '../../components/home/PromotionalBanners';
import FeaturedProducts from '../../components/home/FeaturedProducts';
import TrendingColors from '../../components/home/TrendingColors';
import Testimonials from '../../components/home/Testimonials';
import BrandPromise from '../../components/home/BrandPromise';
import Footer from '../../components/layout/Footer';

const HomePage = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <HeroBanner />
      <CategoryGrid />
      <PromotionalBanners />
      <FeaturedProducts />
      <TrendingColors />
      <Testimonials />
      <BrandPromise />
      <Footer />
    </div>
  );
};

export default HomePage;
