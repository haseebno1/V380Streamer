import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Bell, Plus } from "lucide-react";
import { useState } from "react";
import AddCameraDialog from "@/components/dashboard/add-camera-dialog";

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
}

export default function Topbar({ setSidebarOpen }: TopbarProps) {
  const [isAddCameraOpen, setIsAddCameraOpen] = useState(false);
  
  return (
    <>
      <div className="relative z-10 flex h-16 flex-shrink-0 bg-white shadow">
        <button
          type="button"
          className="border-r border-slate-200 px-4 text-slate-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary md:hidden"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="flex flex-1 justify-between px-4">
          <div className="flex flex-1">
            <div className="flex w-full md:ml-0">
              <label htmlFor="search-field" className="sr-only">Search cameras</label>
              <div className="relative w-full text-slate-400 focus-within:text-slate-600">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5" />
                </div>
                <Input
                  id="search-field"
                  className="block h-full w-full border-transparent py-2 pl-10 pr-3 text-slate-900 placeholder-slate-500 focus:border-transparent focus:placeholder-slate-400 focus:outline-none focus:ring-0 sm:text-sm"
                  placeholder="Search cameras"
                  type="search"
                />
              </div>
            </div>
          </div>
          
          <div className="ml-4 flex items-center md:ml-6">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-400 hover:text-slate-500"
              aria-label="View notifications"
            >
              <Bell className="h-6 w-6" />
            </Button>
            
            <Button
              onClick={() => setIsAddCameraOpen(true)}
              className="ml-3 inline-flex items-center rounded-md px-3 py-2 text-sm font-medium"
            >
              <Plus className="-ml-0.5 mr-2 h-4 w-4" />
              Add Camera
            </Button>
          </div>
        </div>
      </div>

      <AddCameraDialog open={isAddCameraOpen} onOpenChange={setIsAddCameraOpen} />
    </>
  );
}
