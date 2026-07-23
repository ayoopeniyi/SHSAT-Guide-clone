import { ReactNode } from "react";
// import Header from "@/components/Header";
import Footer from "@/components/Footer";
// import MobileStickyFooter from "@/components/MobileStickyFooter";
import Navbar from  "@/components/Navbar";

interface PageLayoutProps {
	children: ReactNode;
	showMobileFooter?: boolean;
}

const PageLayout = ({ children, showMobileFooter = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen  bg-white flex flex-col ">
      {/* <Header /> */}
      <Navbar/>
      <main className="flex-grow">{children}</main>
      <Footer />
      {/* {showMobileFooter && <MobileStickyFooter />} */}
    </div>
  );
};

export default PageLayout;
