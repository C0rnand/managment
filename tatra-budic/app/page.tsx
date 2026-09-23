import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductSection from "@/components/ProductSection";
import Benefits from "@/components/Benefits";
import AboutUs from "@/components/AboutUs";
import ContactForm from "@/components/ContactForm";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ProductSection />
        <Benefits />
        <AboutUs />
        <ContactForm />
      </main>
      <Footer />
    </>
  );
}
