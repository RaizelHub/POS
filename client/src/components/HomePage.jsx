import Navbar from './home/Navbar';
import Hero from './home/Hero';
import DashboardPreview from './home/DashboardPreview';
import Screenshots from './home/Screenshots';
import FeatureGrid from './home/FeatureGrid';
import BusinessTypes from './home/BusinessTypes';
import Workflow from './home/Workflow';
import CTA from './home/CTA';
import Footer from './home/Footer';

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-white font-sans text-slate-800 antialiased selection:bg-emerald-500/20 selection:text-emerald-950">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureGrid />
        <DashboardPreview />
        <Screenshots />
        <Workflow />
        <BusinessTypes />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
