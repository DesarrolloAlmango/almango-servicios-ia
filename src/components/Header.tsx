
import { useState, useEffect } from 'react';
import { Menu, Briefcase, Users, FileText, LogIn, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Handle scroll event
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Determine if scrolled beyond threshold
      if (currentScrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Hide header when scrolling down, show when scrolling up
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up or at the top
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

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
            top: startScrollY + (offsetPosition - startScrollY) * easedProgress
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
    
    // Close the sheet when a navigation option is clicked
    setIsSheetOpen(false);
  };

  const redirectToExternalURL = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    
    // Close the sheet when a navigation option is clicked
    setIsSheetOpen(false);
  };

  // Handle navigation to the services page
  const navigateToServices = () => {
    // Navigate to the services page - using window.location.href for a full page navigation
    window.location.href = '/servicios';
    
    // Close the sheet when a navigation option is clicked
    setIsSheetOpen(false);
  };

  return <header className={cn('top-0 left-0 right-0 z-50 transition-all duration-300 border-b font-sans', isScrolled ? 'bg-primary shadow-md py-0 border-black border-b-8' : 'bg-primary py-1 border-black border-b-8', isVisible ? 'fixed' : 'fixed -translate-y-full')}>
      <div className="container mx-auto flex justify-between items-center px-4 relative">
        {/* Logo */}
        <div className="flex items-center overflow-visible -ml-2">
          <img alt="ALMANGO Logo" src="/lovable-uploads/10976e12-6bf7-48d0-b947-61ef37b1289b.png" className="h-16 transition-all duration-300 object-scale-down transform translate-y-0.5" />
        </div>
        
        {/* Hamburger menu for both mobile and desktop */}
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <button className="text-white focus:outline-none" aria-label="Toggle menu">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="bg-primary text-white border-r border-black/30 p-0 z-[200]">
            <div className="flex flex-col py-4 px-6 h-full z-[200]">
              {/* Navigation links */}
              <div className="mt-6 flex flex-col space-y-6">
                <button onClick={() => scrollToSection('inicio')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                  Inicio
                </button>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="formar-parte" className="border-b-0">
                    <AccordionTrigger className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                      <Briefcase size={18} />
                      <span>Formar Parte</span>
                    </AccordionTrigger>
                    <AccordionContent className="pl-6">
                      <button onClick={() => redirectToExternalURL('https://almango.com.uy/altas/altacomercio.html')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2 w-full">
                        <Briefcase size={16} />
                        <span>Comercio</span>
                      </button>
                      <button onClick={() => redirectToExternalURL('https://almango.com.uy/altas/altaprestador.html')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2 w-full">
                        <Users size={16} />
                        <span>Profesionales</span>
                      </button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <button onClick={() => navigateToServices()} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                  <FileText size={18} />
                  <span>Solicitar Servicio</span>
                </button>
                
                <button onClick={() => redirectToExternalURL('https://app.almango.com.uy/wwpbaseobjects.login.aspx')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                  <LogIn size={18} />
                  <span>Login</span>
                </button>
                
                <button onClick={() => redirectToExternalURL('https://almango.com.uy/altas/')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                  <UserPlus size={18} />
                  <span>Registro</span>
                </button>
                
                <button onClick={() => scrollToSection('contacto')} className="uppercase text-sm font-medium py-2 text-white hover:text-gray-900 transition-colors text-left flex items-center gap-2">
                  Contacto
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>;
};
export default Header;
