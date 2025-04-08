import { useState, useEffect } from 'react';
import { Facebook, Instagram, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMobileMenuOpen(false);
  };
  return <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300', isScrolled ? 'bg-gray-900/90 backdrop-blur-sm shadow-md py-2' : 'bg-gray-900/70 backdrop-blur-sm py-4')}>
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <img alt="ALMANGO Logo" src="/lovable-uploads/10976e12-6bf7-48d0-b947-61ef37b1289b.png" className="h-14 transition-all duration-300 object-scale-down" />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => scrollToSection('inicio')} className="uppercase text-sm font-medium text-gray-200 hover:text-primary transition-colors">
            Inicio
          </button>
          <button onClick={() => scrollToSection('servicios')} className="uppercase text-sm font-medium text-gray-200 hover:text-primary transition-colors">
            Servicios
          </button>
          <button onClick={() => scrollToSection('quienes-somos')} className="uppercase text-sm font-medium text-gray-200 hover:text-primary transition-colors">
            ¿Quienes somos?
          </button>
          <button onClick={() => scrollToSection('formar-parte')} className="uppercase text-sm font-medium text-gray-200 hover:text-primary transition-colors">
            Formar parte
          </button>
          <button onClick={() => scrollToSection('contacto')} className="uppercase text-sm font-medium text-gray-200 hover:text-primary transition-colors">
            Contacto
          </button>
        </nav>
        
        {/* Social Links */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://www.facebook.com/almango.com.uy" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Facebook">
            <Facebook size={20} />
          </a>
          <a href="https://www.instagram.com/almangoservicios/" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Instagram">
            <Instagram size={20} />
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <button className="md:hidden text-gray-300 focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden bg-gray-900 shadow-lg absolute top-full left-0 right-0">
          <div className="flex flex-col py-4 px-6 space-y-4">
            <button onClick={() => scrollToSection('inicio')} className="uppercase text-sm font-medium py-2 text-gray-200 hover:text-primary transition-colors text-left">
              Inicio
            </button>
            <button onClick={() => scrollToSection('servicios')} className="uppercase text-sm font-medium py-2 text-gray-200 hover:text-primary transition-colors text-left">
              Servicios
            </button>
            <button onClick={() => scrollToSection('quienes-somos')} className="uppercase text-sm font-medium py-2 text-gray-200 hover:text-primary transition-colors text-left">
              ¿Quienes somos?
            </button>
            <button onClick={() => scrollToSection('formar-parte')} className="uppercase text-sm font-medium py-2 text-gray-200 hover:text-primary transition-colors text-left">
              Formar parte
            </button>
            <button onClick={() => scrollToSection('contacto')} className="uppercase text-sm font-medium py-2 text-gray-200 hover:text-primary transition-colors text-left">
              Contacto
            </button>
            
            {/* Mobile Social Links */}
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/almango.com.uy" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/almangoservicios/" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>}
    </header>;
};
export default Header;