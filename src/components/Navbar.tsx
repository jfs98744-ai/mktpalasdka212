import React, { useState } from 'react';
import { 
  Building2, 
  Home, 
  Search, 
  Users, 
  FileText, 
  Archive, 
  BarChart3, 
  PlusCircle, 
  Settings, 
  Menu, 
  X,
  Download,
  Upload
} from 'lucide-react';

export type TabType = 'dashboard' | 'properties' | 'clients' | 'contracts' | 'archive' | 'reports';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenAddProperty: () => void;
  onOpenSettings: () => void;
  officeName: string;
  availableCount: number;
  clientCount: number;
  contractCount: number;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenAddProperty,
  onOpenSettings,
  officeName,
  availableCount,
  clientCount,
  contractCount,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: TabType; label: string; icon: any; count?: number }[] = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: Home },
    { id: 'properties', label: 'العقارات والمعروضات', icon: Building2, count: availableCount },
    { id: 'clients', label: 'سجل طلبات الزبائن', icon: Users, count: clientCount },
    { id: 'contracts', label: 'المكاتبات والعقود', icon: FileText, count: contractCount },
    { id: 'archive', label: 'الأرشيف والعمليات السابقة', icon: Archive },
    { id: 'reports', label: 'التقارير المالية والتحليلات', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-xl no-print">
      {/* Top Office Header & Quick Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          
          {/* Logo and Office Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-3 group text-right focus:outline-none"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-900/30 group-hover:scale-105 transition-transform duration-200">
                <Building2 className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-xl font-bold text-white tracking-wide">
                    {officeName}
                  </span>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    المنظومة الإلكترونية
                  </span>
                </div>
                <p className="text-xs text-slate-400 hidden sm:block truncate max-w-xs md:max-w-sm">
                  إدارة المكاتب العقارية والأرشفة والمكاتبات الذكية
                </p>
              </div>
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddProperty}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all"
              title="تسجيل عقار جديد في المنظومة"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              <span>تسجيل عقار جديد</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800"
              title="إعدادات المكتب والنسخ الاحتياطي"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 border-t border-slate-800/80 pt-1 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-inner'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 backdrop-blur px-4 pt-3 pb-5 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-3 rounded-xl text-xs font-bold text-right transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-800/90 text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.count !== undefined && item.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-slate-950 text-amber-400' : 'bg-slate-700 text-slate-200'
                    }`}>
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
