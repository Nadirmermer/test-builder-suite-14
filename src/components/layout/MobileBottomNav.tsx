
import { NavLink, useLocation } from 'react-router-dom';
import { FiUsers, FiClipboard, FiSettings, FiHome } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const navigationItems = [
  {
    name: 'Anasayfa',
    href: '/',
    icon: FiHome,
  },
  {
    name: 'Danışanlar',
    href: '/danisanlar',
    icon: FiUsers,
  },
  {
    name: 'Testler',
    href: '/testler',
    icon: FiClipboard,
  },
  {
    name: 'Ayarlar',
    href: '/ayarlar',
    icon: FiSettings,
  }
];

export default function MobileBottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="grid grid-cols-4 h-16">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center transition-colors",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
