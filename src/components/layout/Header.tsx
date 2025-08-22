import { FiMoon, FiSun, FiMenu } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { useIsMobile } from '@/hooks/use-mobile';
import { toggleDarkMode, toggleSidebar } from '@/store/slices/uiSlice';
export default function Header() {
  const dispatch = useAppDispatch();
  const {
    darkMode
  } = useAppSelector(state => state.ui);
  const isMobile = useIsMobile();
  return <header className="h-16 w-full border-b bg-gradient-subtle border-border flex items-center justify-between px-6 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-medical flex items-center justify-center shadow-medical transition-smooth hover:scale-105">
            <span className="text-white font-bold text-lg">Ψ</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground tracking-tight">PsikoTest</h1>
            <p className="text-xs text-muted-foreground font-medium">Psikolojik Değerlendirme Sistemi</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isMobile && <div className="h-6 w-px bg-border"></div>}
        <Button variant="ghost" size="icon" onClick={() => dispatch(toggleDarkMode())} className="hover:bg-secondary transition-smooth rounded-xl">
          {darkMode ? <FiSun className="h-5 w-5 text-warning transition-smooth" /> : <FiMoon className="h-5 w-5 text-primary transition-smooth" />}
        </Button>
        {!isMobile}
      </div>
    </header>;
}