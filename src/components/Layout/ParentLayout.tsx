import { Outlet } from "react-router-dom";
import ParentHeader from "../Header/ParentHeader";
import Footer from "../Footer/Footer";

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <ParentHeader />
            <main className="flex-grow">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
