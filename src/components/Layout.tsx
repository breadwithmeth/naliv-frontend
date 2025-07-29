import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import BottomNavigation from './BottomNavigation';

export default function Layout() {
  const location = useLocation();
  
  // Страницы с собственными заголовками (включая главную)
  const pagesWithOwnHeaders = ['/', '/profile', '/catalog', '/about', '/auth', '/stores', '/cart'];
  const hasOwnHeader = pagesWithOwnHeaders.includes(location.pathname) || 
                       location.pathname.startsWith('/category/') ||
                       location.pathname.startsWith('/item/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Основной контент */}
      <main className={hasOwnHeader ? '' : 'pt-20 pb-20'}>
        <Outlet />
      </main>

      {/* Мобильная навигация */}
      <BottomNavigation />
      <Toaster />
    </div>
  );
}
