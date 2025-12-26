import React, { useState, useEffect, useMemo } from 'react';
import { InventoryItem, ItemCategory, FilterType, Location } from './types';
import { InventoryList } from './components/InventoryList';
import { StatsCard } from './components/StatsCard';
import { AddItemForm } from './components/AddItemForm';
import { Button } from './components/Button';
import { AssistantPanel } from './components/AssistantPanel';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LocationManager } from './components/LocationManager';
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  Plus, 
  Sparkles,
  Search,
  MapPin,
  Share2,
  Settings,
  ChevronRight,
  Menu
} from 'lucide-react';

const generateId = () => Math.random().toString(36).substr(2, 9);

const App: React.FC = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [currentLocationId, setCurrentLocationId] = useState<string>('all');
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [search, setSearch] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedLocs = localStorage.getItem('pantry_locations');
    let loadedLocs = savedLocs ? JSON.parse(savedLocs) : [
      { id: 'loc1', name: 'Main Distribution Hub' }, 
      { id: 'loc2', name: 'Mobile Unit A' }
    ];
    setLocations(loadedLocs);

    const savedItems = localStorage.getItem('pantry_inventory');
    setItems(savedItems ? JSON.parse(savedItems) : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('pantry_inventory', JSON.stringify(items));
      localStorage.setItem('pantry_locations', JSON.stringify(locations));
    }
  }, [items, locations, loading]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Supply Closet Manager',
          text: `Check our inventory: ${items.length} items across ${locations.length} locations.`,
          url: window.location.href,
        });
      } catch (err) { console.error(err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const filteredItems = items.filter(i => {
    const matchesLocation = currentLocationId === 'all' || i.locationId === currentLocationId;
    const matchesCategory = filter === 'ALL' || i.category === filter;
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase());
    return matchesLocation && matchesCategory && matchesSearch;
  });

  const stats = useMemo(() => {
    return {
      total: filteredItems.length,
      low: filteredItems.filter(i => i.quantity < i.targetQuantity).length
    };
  }, [filteredItems]);

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Fixed Header */}
      <header className="bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between z-30 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-600 p-1.5 rounded-lg shadow-sm">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-bold text-slate-900 tracking-tight">Supply Closet</span>
            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Food & General</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1.5">
          <Button variant="ghost" className="p-2" onClick={handleShare}>
            <Share2 className="w-5 h-5 text-slate-500" />
          </Button>
          <Button onClick={() => { setEditingItem(null); setIsAddModalOpen(true); }} className="rounded-xl px-4 h-10 shadow-lg shadow-emerald-100">
            <Plus className="w-5 h-5 sm:mr-1" /> <span className="hidden sm:inline">Add Stock</span>
          </Button>
        </div>
      </header>

      {/* Scrollable Content */}
      <main className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Location Picker */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Storage Location</span>
             <button onClick={() => setIsLocationModalOpen(true)} className="text-emerald-600 text-xs font-bold flex items-center hover:opacity-75">
                <Settings className="w-3.5 h-3.5 mr-1" /> Edit Locations
             </button>
           </div>
           <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-600" />
              <select 
                value={currentLocationId}
                onChange={(e) => setCurrentLocationId(e.target.value)}
                className="w-full pl-9 pr-4 py-3 bg-slate-50 border-none rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 appearance-none text-sm"
              >
                <option value="all">Global (All Hubs)</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
           </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <StatsCard title="Total Skus" value={stats.total} icon={<Package className="w-5 h-5" />} color="blue" />
          <StatsCard title="Refills Needed" value={stats.low} icon={<AlertTriangle className="w-5 h-5" />} color="amber" />
        </div>

        {/* Filter & Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" placeholder="Search by name or category..." 
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-sm bg-white shadow-sm"
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
             <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-wider transition-colors ${filter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>ALL</button>
             {Object.values(ItemCategory).map(c => (
               <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-lg text-[10px] font-black tracking-wider transition-colors whitespace-nowrap ${filter === c ? 'bg-emerald-600 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}>{c.toUpperCase()}</button>
             ))}
          </div>
        </div>

        <InventoryList items={filteredItems} locations={locations} onDelete={setItemToDelete} onEdit={(i) => { setEditingItem(i); setIsAddModalOpen(true); }} />
      </main>

      {/* Floating Action Button (Mobile Assistant) */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3">
         <button 
           onClick={() => setIsAssistantOpen(true)} 
           className="bg-emerald-600 p-4 rounded-full shadow-2xl text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
         >
            <Sparkles className="w-6 h-6" />
         </button>
      </div>

      {/* Modals */}
      {isAddModalOpen && <AddItemForm initialData={editingItem} locations={locations} currentLocationId={currentLocationId} onSave={(data) => {
        if (editingItem) {
          setItems(items.map(i => i.id === editingItem.id ? { ...i, ...data } : i));
        } else {
          setItems([{ ...data, id: generateId(), addedDate: new Date().toISOString() }, ...items]);
        }
        setIsAddModalOpen(false);
      }} onClose={() => setIsAddModalOpen(false)} />}

      {isLocationModalOpen && <LocationManager locations={locations} onAdd={(name) => setLocations([...locations, { id: generateId(), name }])} onDelete={(id) => setLocations(locations.filter(l => l.id !== id))} onClose={() => setIsLocationModalOpen(false)} />}
      
      <ConfirmationModal isOpen={!!itemToDelete} title="Delete Item?" message="This action cannot be undone. Item history will be lost." onConfirm={() => { setItems(items.filter(i => i.id !== itemToDelete)); setItemToDelete(null); }} onCancel={() => setItemToDelete(null)} />
      
      <AssistantPanel items={items} isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} />
    </div>
  );
};

export default App;