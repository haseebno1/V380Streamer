import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Video, 
  FolderArchive, 
  Bell,
  Settings,
  User
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, current: location === "/" },
    { name: "Live Streams", href: "/live-streams", icon: Video, current: location === "/live-streams" },
    { name: "Recordings", href: "/recordings", icon: FolderArchive, current: location === "/recordings" },
    { name: "Alerts", href: "/alerts", icon: Bell, current: location === "/alerts" },
    { name: "Settings", href: "/settings", icon: Settings, current: location === "/settings" }
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar for mobile */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-center h-16 px-4 bg-slate-900">
          <span className="text-xl font-semibold text-white">CameraHub</span>
        </div>
        
        <SidebarContent navigation={navigation} />
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64 bg-slate-800">
          <div className="flex items-center justify-center h-16 px-4 bg-slate-900">
            <span className="text-xl font-semibold text-white">CameraHub</span>
          </div>
          
          <SidebarContent navigation={navigation} />
        </div>
      </div>
    </>
  );
}

interface SidebarContentProps {
  navigation: {
    name: string;
    href: string;
    icon: React.ElementType;
    current: boolean;
  }[];
}

function SidebarContent({ navigation }: SidebarContentProps) {
  return (
    <>
      <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center px-2 py-2 text-sm font-medium rounded-md group",
                item.current 
                  ? "text-white bg-slate-700" 
                  : "text-slate-300 hover:bg-slate-700 hover:text-white"
              )}
            >
              <item.icon 
                className={cn(
                  "w-6 h-6 mr-3",
                  item.current ? "text-slate-300" : "text-slate-400 group-hover:text-slate-300"
                )} 
              />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center p-4 border-t border-slate-700">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white">
            <User size={18} />
          </div>
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-white">Admin User</p>
          <p className="text-xs font-medium text-slate-400">View profile</p>
        </div>
      </div>
    </>
  );
}
