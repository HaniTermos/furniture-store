import LenisProvider from '@/components/layout/LenisProvider';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LenisProvider>
            <Navbar />
            <CartDrawer />
            <main>{children}</main>
            <Footer />
        </LenisProvider>
    );
}
