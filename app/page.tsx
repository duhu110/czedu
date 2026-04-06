import { Header } from "@/components/home/header";
import { HeroSection } from "@/components/home/hero";
import { BlogsSection } from "@/components/home/blogs-section";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <>
      <Header />
      <HeroSection />
      <BlogsSection />
      <Footer />
    </>
  );
}
