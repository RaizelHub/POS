import React from 'react';
import Navbar from './home/Navbar';
import Hero from './home/Hero';
import DashboardPreview from './home/DashboardPreview';
import Screenshots from './home/Screenshots';
import FeatureGrid from './home/FeatureGrid';
import BusinessTypes from './home/BusinessTypes';
import Workflow from './home/Workflow';
import Testimonials from './home/Testimonials';
import CTA from './home/CTA';
import Footer from './home/Footer';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 antialiased selection:bg-emerald-500/10 selection:text-emerald-800 flex flex-col justify-between">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureGrid />
        <DashboardPreview />
        <Screenshots />
        <Workflow />
        <BusinessTypes />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
