import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { navs } from "../constants/constants";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center">
        <span className="text-2xl font-bold">N</span>
        <button onClick={toggleMenu} aria-label="Toggle Menu">
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static top-0 left-0 z-50 h-screen w-20 bg-black transition-transform duration-300 transform 
        ${isOpen ? "translate-y-0" : "-translate-y-full"} md:translate-y-0 md:flex flex-col items-center py-6 space-y-6`}>

        <Link to="/">
          <div className="text-white text-3xl font-bold cursor-pointer m-8">N</div>
        </Link>

        {/* Navigation Items */}
        {navs.map((nav) => (
          <Link
            key={nav.id}
            to={nav.href}
            className={`flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 transition ${isActive(nav.href) ? "bg-gray-700" : ""
              }`}
            title={nav.title}
          >
            {nav.icon}
          </Link>
        ))}

        {/* Logout button */}
        <button
          onClick={() => {
            // logout logic
            alert("Logging out...");
          }}
          className="mt-auto text-white hover:text-red-500 transition"
          title="Logout"
        >
          <LogOut size={24} />
        </button>
      </aside>

      {/* Overlay sa mobile */}
      {isOpen && (
        <div
          onClick={toggleMenu}
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        ></div>
      )}
    </>
  );
};

export default Sidebar;
