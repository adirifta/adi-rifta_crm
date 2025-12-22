'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Home, 
  Users, 
  Package, 
  Briefcase, 
  UserCheck,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  Bell,
  ChevronDown
} from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isAuthenticated, getUserRole, logout } from '@/lib/auth';
import './globals.css';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Projects', href: '/projects', icon: Briefcase },
  { name: 'Customers', href: '/customers', icon: UserCheck },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Cek authentication hanya di client side
    const checkAuth = () => {
      const auth = isAuthenticated();
      const role = getUserRole();
      const userStr = localStorage.getItem('user');
      
      setIsAuth(auth);
      setUserRole(role);
      
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
      
      setLoading(false);
      
      // Jika tidak authenticated dan bukan di halaman login/register, redirect ke login
      if (!auth && !['/login', '/register'].includes(pathname)) {
        router.push('/login');
      }
      
      // Jika sudah authenticated dan di halaman login/register, redirect ke dashboard
      if (auth && ['/login', '/register'].includes(pathname)) {
        router.push('/dashboard');
      }
    };
    
    checkAuth();
    
    // Simulate notifications
    setNotifications([
      { id: 1, title: 'New lead assigned', message: 'You have been assigned a new lead', time: '2 min ago', read: false },
      { id: 2, title: 'Project approved', message: 'Your project has been approved by manager', time: '1 hour ago', read: false },
      { id: 3, title: 'Meeting reminder', message: 'Client meeting scheduled for tomorrow', time: '3 hours ago', read: true },
    ]);
  }, [pathname, router]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  const isActive = (href) => {
    return pathname === href || pathname?.startsWith(href + '/');
  };

  const markNotificationAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Tampilkan loading spinner saat checking auth
  if (loading) {
    return (
      <html lang="en">
        <body className="bg-gray-50">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
        </body>
      </html>
    );
  }

  // Jika di halaman login/register, render tanpa layout
  if (['/login', '/register'].includes(pathname)) {
    return (
      <html lang="en">
        <body>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </body>
      </html>
    );
  }

  // Jika tidak authenticated, redirect sudah dihandle di useEffect
  if (!isAuth) {
    return null; // atau loading spinner
  }

  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="min-h-screen flex">
          {/* Mobile sidebar overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75 transition-opacity"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar for mobile */}
          <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
            <div className="flex h-full flex-col bg-white shadow-xl">
              <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-3 text-xl font-bold text-gray-900">PT. Smart CRM</span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md text-gray-500 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <nav className="flex-1 space-y-1 px-4 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              {/* User profile in mobile sidebar */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Static sidebar for desktop */}
          <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
              <div className="flex h-16 flex-shrink-0 items-center px-4 border-b border-gray-200">
                <div className="h-8 w-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold text-gray-900">PT. Smart CRM</span>
              </div>
              
              <nav className="flex-1 space-y-1 px-4 py-6">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive(item.href) ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    {item.name}
                  </Link>
                ))}
              </nav>
              
              {/* User profile in desktop sidebar */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-700">{user?.name || 'User'}</p>
                    <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        <Link
                          href="/profile"
                          prefetch={false}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="h-4 w-4 inline mr-2" />
                          Your Profile
                        </Link>
                        <Link
                          href="/settings"
                          prefetch={false}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings className="h-4 w-4 inline mr-2" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            handleLogout();
                            setShowUserMenu(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          <LogOut className="h-4 w-4 inline mr-2" />
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="flex flex-1 flex-col lg:pl-64">
            {/* Top navigation bar */}
            <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
              <button
                type="button"
                className="px-4 text-gray-500 hover:text-gray-600 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex flex-1 justify-between px-4 lg:px-8">
                <div className="flex flex-1 items-center">
                  <h1 className="text-lg font-semibold text-gray-900 hidden lg:block">
                    {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                  </h1>
                </div>
                
                <div className="ml-4 flex items-center lg:ml-6 space-x-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-1 text-gray-400 hover:text-gray-600"
                    >
                      <Bell className="h-6 w-6" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs text-white flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                    
                    {showNotifications && (
                      <div className="absolute right-0 mt-2 w-80 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <h3 className="text-sm font-medium text-gray-900">Notifications</h3>
                          </div>
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                  !notification.read ? 'bg-blue-50' : ''
                                }`}
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                                <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                              </div>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-center text-sm text-gray-500">
                              No notifications
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* User profile dropdown for mobile */}
                  <div className="relative lg:hidden">
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className="flex items-center text-gray-400 hover:text-gray-600"
                    >
                      <User className="h-6 w-6" />
                    </button>
                    
                    {showUserMenu && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                          <p className="text-xs text-gray-500 capitalize">{userRole}</p>
                        </div>
                        <Link
                          href="/profile"
                          prefetch={false}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Your Profile
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Main content area */}
            <main className="flex-1">
              <div className="py-6">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
        
        <ToastContainer 
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </body>
    </html>
  );
}