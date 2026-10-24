import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Ponuka from "@/components/Ponuka";
import Benefits from "@/components/Benefits";
import AboutUs from "@/components/AboutUs";
import Team from "@/components/Team";
import ZadaniaIntro from "@/components/ZadaniaIntro";
import Timeline from "@/components/Timeline";
import KPISection from "@/components/KPISection";
import SWOT from "@/components/SWOT";
import GanttChart from "@/components/GanttChart";
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
        <ZadaniaIntro />
        <Timeline />
        <KPISection />
        <SWOT />
        <GanttChart />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
