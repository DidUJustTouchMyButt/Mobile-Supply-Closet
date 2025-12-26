import React from 'react';
import { InventoryItem, ItemCategory, Location } from '../types';
import { Trash2, Edit2, AlertTriangle, Archive, CheckCircle2, Truck } from 'lucide-react';
import { Button } from './Button';

interface InventoryListProps {
  items: InventoryItem[];
  locations: Location[];
  onDelete: (id: string) => void;
  onEdit: (item: InventoryItem) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({ items, locations, onDelete, onEdit }) => {
  
  const getLocationName = (id: string) => {
    return locations.find(l => l.id === id)?.name || 'Unknown Location';
  };

  const getStockStatus = (current: number, target: number) => {
    if (target === 0) return { label: 'No Target', color: 'text-gray-500 bg-gray-100' };
    const ratio = current / target;
    if (ratio >= 1) return { label: 'Filled', color: 'text-emerald-700 bg-emerald-50 border border-emerald-200' };
    if (ratio >= 0.5) return { label: 'Low', color: 'text-amber-700 bg-amber-50 border border-amber-200' };
    return { label: 'Critical', color: 'text-red-700 bg-red-50 border border-red-200' };
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
        <Archive className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">Select a location and add inventory to get started.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Levels</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => {
              const status = getStockStatus(item.quantity, item.targetQuantity);
              const isCritical = status.label === 'Critical';

              return (
                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${isCritical ? 'bg-red-50/30' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit mt-1
                        ${item.category === ItemCategory.FOOD ? 'bg-green-100 text-green-800' : 
                          item.category === ItemCategory.CLOTHING ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {item.category}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getLocationName(item.locationId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-4">
                      <div>
                         <p className="text-xs text-gray-500 uppercase">On Hand</p>
                         <p className="text-lg font-bold text-gray-900">{item.quantity}</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200"></div>
                      <div>
                         <p className="text-xs text-gray-500 uppercase">Target</p>
                         <p className="text-sm font-medium text-gray-600">{item.targetQuantity}</p>
                      </div>
                      <div className="text-xs text-gray-400 self-end mb-1">{item.unit}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
                      {status.label === 'Filled' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                      {status.label === 'Critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                      {status.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.lastDeliveryDate ? (
                      <div className="flex items-center text-sm text-gray-600">
                        <Truck className="w-4 h-4 mr-2 text-gray-400" />
                        {item.lastDeliveryDate}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">No date set</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                       <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="!p-1">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                       </Button>
                       <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="!p-1 text-red-600 hover:text-red-800">
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};