import React from 'react';
import Navbar from './home/Navbar';
import Hero from './home/Hero';
import ProductShowcase from './home/ProductShowcase';
import CoreOperations from './home/CoreOperations';
import ProductTour from './home/ProductTour';
import Workflow from './home/Workflow';
import StoreTypes from './home/StoreTypes';
import OfflineCapability from './home/OfflineCapability';
import CTA from './home/CTA';
import Footer from './home/Footer';

/**
 * SUELTO POS — Landing Page
 * Creative Concept: "SUELTO / RETAIL OPERATIONS JOURNAL"
 * Architectural Flat Surfaces, Editorial Typography, Zero Gradients
 */
const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#F2F0E9] text-[#242824] font-sans antialiased flex flex-col selection:bg-[#242824] selection:text-[#FFFFFF]">
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <ProductShowcase />
        <CoreOperations />
        <ProductTour />
        <Workflow />
        <StoreTypes />
        <OfflineCapability />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
