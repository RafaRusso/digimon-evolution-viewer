import React, { useState, useEffect } from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useParams,
  NavLink,
  useOutletContext,
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Search, Grid3X3, TreePine, Heart, X, Star } from 'lucide-react';
import { Toaster } from 'sonner';

import DigimonSearch from './components/DigimonSearch';
import DigimonList from './components/DigimonList';
import EvolutionView from './components/EvolutionView';
import FavoritesPage from './components/FavoritesPage';
import ApiStatus from './components/ApiStatus';
import { useFavoritesCount } from './hooks/useFavorites';
import { getAssetImageUrl } from './lib/utils';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

// --- PÁGINAS DO ROTEADOR ---
function SearchPage() {
  const { handleSelect, openImagePreview } = useOutletContext();
  return <DigimonSearch onDigimonSelect={handleSelect} onImagePreview={openImagePreview} />;
}

function ListPage() {
  const { handleSelect, openImagePreview } = useOutletContext();
  return <DigimonList onDigimonSelect={handleSelect} onImagePreview={openImagePreview} />;
}

function FavoritesPageWrapper() {
  const { handleSelect, openImagePreview } = useOutletContext();
  return <FavoritesPage onDigimonSelect={handleSelect} onImagePreview={openImagePreview} />;
}

function EvolutionPage() {
  const { digimonName } = useParams();
  const { handleSelect, openImagePreview } = useOutletContext();
  return <EvolutionView key={digimonName} digimon={{ name: digimonName }} onDigimonSelect={handleSelect} onImagePreview={openImagePreview} />;
}

// Componente para mostrar contador de favoritos
function FavoritesNavButton() {
  const { data: favoritesCount = 0 } = useFavoritesCount();
  
  return (
    <div className="relative">
      <Heart className="nav-icon" />
      <span className="nav-text">Favoritos</span>
      {favoritesCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {favoritesCount > 99 ? '99+' : favoritesCount}
        </span>
      )}
    </div>
  );
}

// --- COMPONENTE DE LAYOUT PRINCIPAL ---
function MainLayout() {
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedDigimonName, setSelectedDigimonName] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const { digimonName: paramDigimonName } = useParams();

  useEffect(() => {
    if (paramDigimonName) {
      setSelectedDigimonName(paramDigimonName);
    }
  }, [paramDigimonName]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100); // Aumentei um pouco o gatilho do scroll
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSelect = (digimon) => {
    setSelectedDigimonName(digimon.name);
    navigate(`/evolution/${digimon.name}`);
  };

  const openImagePreview = (digimon) => {
    if (digimon.image_url) {
      const processedUrl = getAssetImageUrl(digimon.image_url);
      setImagePreview({ url: processedUrl, alt: digimon.name });
    }
  };

  const closeImagePreview = () => setImagePreview(null);

  return (
    <div className="digimon-bg">
      <nav className={`navigation-container ${isScrolled ? 'scrolled' : ''}`}>
        <div className="navigation-content">
          <NavLink to="/" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
            <Search className="nav-icon" />
            <span className="nav-text">Buscar</span>
          </NavLink>
          <NavLink to="/list" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
            <Grid3X3 className="nav-icon" />
            <span className="nav-text">Listar Todos</span>
          </NavLink>
          <NavLink to="/favorites" className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
          <Star className="nav-icon" />
          <span className="nav-text">Favoritos</span>
          </NavLink>
          {selectedDigimonName && (
            <NavLink to={`/evolution/${selectedDigimonName}`} className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}>
              <TreePine className="nav-icon" />
              <span className="nav-text">{selectedDigimonName}</span>
            </NavLink>
          )}
        </div>
      </nav>
      
      <header className="header-container">
        <div className="container mx-auto px-4 text-center">
          <h1 className="header-title text-5xl font-bold text-white">
            Digimon Evolution Lines
          </h1>
          <p className="mt-2 text-lg text-gray-200 header-title">
            Explore evoluções, requisitos e árvores visuais.
          </p>
        </div>
      </header>

      <div className="main-layout">
        <div className="content-island">
          <main className="page-content">
            <Outlet context={{ openImagePreview, handleSelect }} />
          </main>
        </div>
        
        <div className="pt-8 pb-4 text-center">
          <ApiStatus />
        </div>
      </div>

      {imagePreview && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeImagePreview}
        >
          <div className="relative max-w-4xl max-h-full bg-gray-900/70 rounded-xl border border-white/10 p-4">
            <button onClick={closeImagePreview} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors">
              <X className="w-8 h-8" />
            </button>
            <div className="text-center text-white font-semibold mb-3">{imagePreview.alt}</div>
            <img
              src={imagePreview.url}
              alt={imagePreview.alt}
              className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-2xl mx-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// --- CONFIGURAÇÃO DO ROTEADOR ---
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <SearchPage /> },
      { path: 'list', element: <ListPage /> },
      { path: 'favorites', element: <FavoritesPageWrapper /> },
      { path: 'evolution/:digimonName', element: <EvolutionPage /> },
    ],
  },
]);

// --- COMPONENTE APP PRINCIPAL ---
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster richColors position="bottom-right" />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
