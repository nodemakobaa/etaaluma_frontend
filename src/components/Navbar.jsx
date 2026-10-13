import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../assets/logo.png'; 

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Function ya ku-scroll mpaka kwenye section ikiwa upo homepage
  const scrollToSection = (id) => {
    setIsOpen(false); // Kufunga menu ya simu ikibonyezwa
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-slate-900 text-white py-4 px-6 md:px-8 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Brand Logo / Home Link */}
      <Link to="/" className="flex items-center space-x-3 text-xl font-bold tracking-wide">
        <img 
          src={logoImage} 
          alt="E-Taaluma Logo" 
          className="w-10 h-10 rounded-full object-cover border-2 border-orange-500 shadow-sm" 
        />
        <span className="text-xl">
          E-<span className="text-emerald-500">Taaluma</span>
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden md:flex items-center space-x-6 text-sm font-medium">
        <Link 
          to="/" 
          className="hover:text-emerald-400 transition cursor-pointer"
        >
          Home
        </Link>

        <button 
          onClick={() => scrollToSection('about')} 
          className="hover:text-emerald-400 transition cursor-pointer bg-transparent border-0 text-white"
        >
          About Us
        </button>

        <button 
          onClick={() => scrollToSection('features')} 
          className="hover:text-emerald-400 transition cursor-pointer bg-transparent border-0 text-white"
        >
          Features
        </button>

        <button 
          onClick={() => scrollToSection('contacts')} 
          className="hover:text-emerald-400 transition cursor-pointer bg-transparent border-0 text-white"
        >
          Contacts
        </button>

        <Link 
          to="/login" 
          className="hover:text-emerald-400 transition cursor-pointer px-3 py-1 rounded"
        >
          Login
        </Link>

        <Link 
          to="/register" 
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold transition cursor-pointer shadow-sm"
        >
          Register School
        </Link>
      </div>

      {/* Hamburger Button for Mobile */}
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="md:hidden text-slate-300 focus:outline-none text-2xl bg-transparent border-0"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      {/* Mobile Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-900 border-t border-slate-800 shadow-lg py-4 px-6 flex flex-col space-y-4 md:hidden">
          <Link 
            to="/" 
            onClick={() => setIsOpen(false)}
            className="hover:text-emerald-400 transition"
          >
            Home
          </Link>

          <button 
            onClick={() => scrollToSection('about')} 
            className="text-left hover:text-emerald-400 transition bg-transparent border-0 text-white p-0"
          >
            About Us
          </button>

          <button 
            onClick={() => scrollToSection('features')} 
            className="text-left hover:text-emerald-400 transition bg-transparent border-0 text-white p-0"
          >
            Features
          </button>

          <button 
            onClick={() => scrollToSection('contacts')} 
            className="text-left hover:text-emerald-400 transition bg-transparent border-0 text-white p-0"
          >
            Contacts
          </button>

          <Link 
            to="/login" 
            onClick={() => setIsOpen(false)}
            className="hover:text-emerald-400 transition font-semibold text-emerald-400"
          >
            Login
          </Link>

          <Link 
            to="/register" 
            onClick={() => setIsOpen(false)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-center px-4 py-2 rounded-lg font-semibold transition shadow-sm"
          >
            Register School
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;