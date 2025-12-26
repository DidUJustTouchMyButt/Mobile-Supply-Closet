import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { Button } from './Button';
import { generateUtilizationPlan } from '../services/geminiService';
import { ChefHat, ClipboardList, X } from 'lucide-react';

interface AssistantPanelProps {
  items: InventoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const AssistantPanel: React.FC<AssistantPanelProps> = ({ items, isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string | null>(null);
  const [mode, setMode] = useState<'recipe' | 'audit' | null>(null);

  const handleGenerate = async (type: 'recipe' | 'audit') => {
    setMode(type);
    setLoading(true);
    setContent(null);
    try {
      // Filter for items with positive quantity
      const availableItems = items.filter(i => i.quantity > 0);
      const result = await generateUtilizationPlan(availableItems, type);
      setContent(result);
    } catch (e) {
      setContent("Error generating content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-[480px] bg-white shadow-2xl z-40 transform transition-transform duration-300 flex flex-col">
      <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Pantry Assistant</h2>
          <p className="text-emerald-100 text-sm">Powered by Gemini 2.5 Flash</p>
        </div>
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => handleGenerate('recipe')}
            disabled={loading}
            className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'recipe' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mb-3 text-orange-600">
              <ChefHat className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Recipe Suggestions</h3>
            <p className="text-xs text-gray-500 mt-1">Create meals from surplus inventory for clients.</p>
          </button>

          <button 
             onClick={() => handleGenerate('audit')}
             disabled={loading}
             className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'audit' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'}`}
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-blue-600">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-gray-900">Needs Analysis</h3>
            <p className="text-xs text-gray-500 mt-1">Identify gaps and what to ask donors for.</p>
          </button>
        </div>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
            <p className="animate-pulse">Analyzing inventory...</p>
          </div>
        )}

        {content && !loading && (
          <div className="prose prose-emerald prose-sm max-w-none">
             <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        )}
        
        {!content && !loading && (
          <div className="text-center text-gray-400 py-12">
            <p>Select an option above to analyze your current inventory.</p>
          </div>
        )}
      </div>
    </div>
  );
};
