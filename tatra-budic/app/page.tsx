import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Ponuka from "@/components/Ponuka";
import Benefits from "@/components/Benefits";
import AboutUs from "@/components/AboutUs";
import Team from "@/components/Team";
import Timeline from "@/components/Timeline";
import KPISection from "@/components/KPISection";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductSection />
        <Ponuka />
        <Benefits />
        <AboutUs />
        <Team />
        <Timeline />
        <KPISection />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
