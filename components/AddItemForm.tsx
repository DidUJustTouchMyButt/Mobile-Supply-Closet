import React, { useState } from 'react';
import { InventoryItem, ItemCategory, UnitType, Location } from '../types';
import { Button } from './Button';
import { Sparkles, Plus, Save, X, Info } from 'lucide-react';
import { analyzeItemInput } from '../services/geminiService';

interface AddItemFormProps {
  initialData?: InventoryItem | null;
  locations: Location[];
  currentLocationId: string;
  onSave: (item: Omit<InventoryItem, 'id' | 'addedDate'>) => void;
  onClose: () => void;
}

export const AddItemForm: React.FC<AddItemFormProps> = ({ initialData, locations, currentLocationId, onSave, onClose }) => {
  const [rawInput, setRawInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    locationId: initialData?.locationId || (currentLocationId !== 'all' ? currentLocationId : locations[0]?.id),
    category: initialData?.category || ItemCategory.FOOD,
    quantity: initialData?.quantity || 0,
    targetQuantity: initialData?.targetQuantity || 10,
    unit: initialData?.unit || UnitType.COUNT,
    expirationDate: initialData?.expirationDate || '',
    lastDeliveryDate: initialData?.lastDeliveryDate || '',
    notes: initialData?.notes || ''
  });

  const handleMagicFill = async () => {
    if (!rawInput.trim()) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeItemInput(rawInput);
      
      let expDateStr = '';
      if (result.estimatedShelfLifeDays && result.estimatedShelfLifeDays < 3650) {
          const d = new Date();
          d.setDate(d.getDate() + result.estimatedShelfLifeDays);
          expDateStr = d.toISOString().split('T')[0];
      }

      setFormData(prev => ({
        ...prev,
        name: result.name,
        category: result.category as ItemCategory,
        unit: result.suggestedUnit as UnitType,
        expirationDate: expDateStr,
        targetQuantity: prev.targetQuantity || 10, // Keep existing or default
        notes: `Auto-categorized from: "${rawInput}"`
      }));
    } catch (e) {
      console.error("Magic fill failed", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Inventory Item' : 'Add Inventory Item'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto">
          {!initialData && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
              <label className="block text-sm font-medium text-indigo-900 mb-2">
                <Sparkles className="w-4 h-4 inline mr-1 text-indigo-600" />
                Smart Fill
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. 'Case of 24 cans of tuna'" 
                  className="flex-1 rounded-lg border-gray-300 border p-2 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                />
                <Button 
                  onClick={handleMagicFill} 
                  disabled={!rawInput || isAnalyzing}
                  isLoading={isAnalyzing}
                  variant="secondary"
                  size="sm"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 border-indigo-200"
                >
                  Analyze
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <select 
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={formData.locationId}
                  onChange={e => setFormData({...formData, locationId: e.target.value})}
                  required
                >
                  {locations.map(loc => (
                    <option key={loc.id} value={loc.id}>{loc.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2 sm:col-span-1">
                 <label className="block text-sm font-medium text-gray-700">Item Name</label>
                 <input 
                  type="text" 
                  required 
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select 
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value as ItemCategory})}
                >
                  {Object.values(ItemCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Unit</label>
                <select 
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={formData.unit}
                  onChange={e => setFormData({...formData, unit: e.target.value as UnitType})}
                >
                  {Object.values(UnitType).map(u => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Expiration (Opt)</label>
                <input 
                  type="date" 
                  className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                  value={formData.expirationDate}
                  onChange={e => setFormData({...formData, expirationDate: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                Inventory Agreement
                <div className="group relative ml-2">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                  <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg z-10 mb-1">
                    Set the target quantity agreed upon with the location manager.
                  </span>
                </div>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">On Hand</label>
                  <input 
                    type="number" 
                    min="0"
                    step="0.1"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 font-medium"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase">Target (Agreed)</label>
                  <input 
                    type="number" 
                    min="1"
                    step="1"
                    required
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 font-medium"
                    value={formData.targetQuantity}
                    onChange={e => setFormData({...formData, targetQuantity: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-xs font-medium text-gray-500 uppercase">Last Delivery</label>
                  <input 
                    type="date" 
                    className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                    value={formData.lastDeliveryDate}
                    onChange={e => setFormData({...formData, lastDeliveryDate: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
             <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <input 
                type="text" 
                className="mt-1 block w-full rounded-lg border-gray-300 border p-2 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
              />
            </div>

            <div className="flex justify-end pt-4 space-x-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="submit" icon={initialData ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}>
                {initialData ? 'Save Changes' : 'Add Item'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};