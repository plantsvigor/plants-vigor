import { ReactNode, lazy, Suspense } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";

const PlantChatWidget = lazy(() => import("../plant-ai/PlantChatWidget"));

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
      <Suspense fallback={null}>
        <PlantChatWidget />
      </Suspense>
    </div>
  );
}
