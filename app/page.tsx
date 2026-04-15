import { Header } from "@/components/home/header";
import { HeroSection } from "@/components/home/hero";
import { Footer } from "@/components/home/footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1">
        <HeroSection />
      </main>
      <Footer />
    </div>
  );
}
