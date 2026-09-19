import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function ya ku-scroll mpaka kwenye section ikiwa upo homepage
  const scrollToSection = (id) => {
    if (location.pathname !== '/') {
      // Kama haupo Homepage, rudi kwanza home kisha navigate
      navigate('/', { state: { scrollTo: id } });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <nav className="bg-slate-900 text-white py-4 px-8 flex justify-between items-center shadow-md sticky top-0 z-50">
      {/* Brand Logo / Home Link */}
      <Link to="/" className="flex items-center space-x-2 text-xl font-bold tracking-wide">
        <span className="text-2xl">🏫</span>
        <span>E-Taaluma</span>
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6 text-sm font-medium">
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
    </nav>
  );
};

export default Navbar;
