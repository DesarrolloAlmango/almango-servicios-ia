
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
    if (id === 'inicio') {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      const element = document.getElementById(id);
      if (element) {
        // Get the element's position
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - 100; // Adjust offset for header
        
        // Set up animation variables
        const startTime = performance.now();
        const startScrollY = window.scrollY;
        const duration = 1000; // Slightly shorter duration
        
        // Ease-in cubic function that starts slow and accelerates
        function easeInCubic(t: number): number {
          return t * t * t;
        }
        
        // Animation function that runs on each frame
        function scrollAnimation(currentTime: number) {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Apply the ease-in cubic function
          const easedProgress = easeInCubic(progress);
          
          // Apply easing and scroll
          window.scrollTo({
            top: startScrollY + (offsetPosition - startScrollY) * easedProgress,
          });
          
          // Continue animation until complete
          if (progress < 1) {
            requestAnimationFrame(scrollAnimation);
          }
        }
        
        // Start the animation
        requestAnimationFrame(scrollAnimation);
      }
    }
    setIsMobileMenuOpen(false);
  };

  return <header className={cn('fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b font-serif', 
    isScrolled ? 'bg-primary shadow-md py-2 border-black border-b-8' : 'bg-primary py-4 border-black border-b-8')}>
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center">
          <img alt="ALMANGO Logo" src="/lovable-uploads/10976e12-6bf7-48d0-b947-61ef37b1289b.png" className="h-14 transition-all duration-300 object-scale-down" />
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <button onClick={() => scrollToSection('inicio')} className="uppercase text-sm text-white hover:text-gray-900 transition-colors font-semibold">
            Inicio
          </button>
          <button onClick={() => scrollToSection('nuestros-servicios')} className="uppercase text-sm text-white hover:text-gray-900 transition-colors font-semibold">
            Servicios
          </button>
          <button onClick={() => scrollToSection('quienes-somos')} className="uppercase text-sm text-white hover:text-gray-900 transition-colors font-semibold">
            ¿Quienes somos?
          </button>
          <button onClick={() => scrollToSection('formar-parte')} className="uppercase text-sm text-white hover:text-gray-900 transition-colors font-semibold">
            Formar parte
          </button>
          <button onClick={() => scrollToSection('contacto')} className="uppercase text-sm text-white hover:text-gray-900 transition-colors font-semibold">
            Contacto
          </button>
        </nav>
        
        {/* Social Links */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="https://www.facebook.com/almango.com.uy" target="_blank" rel="noreferrer" className="text-white hover:text-gray-900 transition-colors" aria-label="Facebook">
            <Facebook size={20} />
          </a>
          <a href="https://www.instagram.com/almangoservicios/" target="_blank" rel="noreferrer" className="text-white hover:text-gray-900 transition-colors" aria-label="Instagram">
            <Instagram size={20} />
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button className="text-white focus:outline-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} aria-label="Toggle menu">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMobileMenuOpen && <div className="md:hidden bg-primary shadow-lg absolute top-full left-0 right-0 border-b border-black/30">
          <div className="flex flex-col py-4 px-6 space-y-4">
            <button onClick={() => scrollToSection('inicio')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left">
              Inicio
            </button>
            <button onClick={() => scrollToSection('nuestros-servicios')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left">
              Servicios
            </button>
            <button onClick={() => scrollToSection('quienes-somos')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left">
              ¿Quienes somos?
            </button>
            <button onClick={() => scrollToSection('formar-parte')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left">
              Formar parte
            </button>
            <button onClick={() => scrollToSection('contacto')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left">
              Contacto
            </button>
            
            {/* Mobile Social Links */}
            <div className="flex space-x-4 pt-2">
              <a href="https://www.facebook.com/almango.com.uy" target="_blank" rel="noreferrer" className="text-white hover:text-gray-900 transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://www.instagram.com/almangoservicios/" target="_blank" rel="noreferrer" className="text-white hover:text-gray-900 transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>}
    </header>;
};

export default Header;
