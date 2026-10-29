import { Link } from 'react-router-dom';
import { Mail, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--panel)] pt-16 pb-8 font-sans transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-1">
            <Link to="/" className="font-headline text-3xl font-bold tracking-tight block mb-4 text-[var(--text)]">
              Nova<span className="text-[#FF334F] ml-1">Plata</span>
            </Link>
            <p className="text-[var(--muted)] text-sm mb-6 max-w-xs leading-relaxed">
              La plataforma financiera inteligente que te ayuda a tomar el control de tu futuro, hoy.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-[var(--muted)] hover:text-[#FFB8BE] transition-colors"><Globe size={20} /></a>
              <a href="#" className="text-[var(--muted)] hover:text-[#FFB8BE] transition-colors"><Mail size={20} /></a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Producto</h4>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Características</a></li>
              <li><a href="#ia" className="hover:text-[var(--text)] transition-colors">Nova IA</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Precios</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Seguridad</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Compañía</h4>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Sobre nosotros</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Carreras</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Contacto</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-[var(--muted)]">
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Términos de servicio</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Política de privacidad</a></li>
              <li><a href="#" className="hover:text-[var(--text)] transition-colors">Cookies</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[var(--muted)]">
          <p>© 2026 Nova Plata. Todos los derechos reservados.</p>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <p>Versión 1.0.1</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
