
import React from 'react';
import { MaterialType } from '../types';
import { AVAILABLE_THICKNESSES } from '../constants';

interface SidebarProps {
  selectedMaterial: MaterialType;
  setSelectedMaterial: (m: MaterialType) => void;
  selectedThickness: number;
  setSelectedThickness: (t: number) => void;
  quantity: number;
  setQuantity: (q: number) => void;
  isBendingEnabled: boolean;
  setIsBendingEnabled: (b: boolean) => void;
  bendsPerPart: number;
  setBendsPerPart: (n: number) => void;
  paintingSides: number;
  setPaintingSides: (n: number) => void;
  isGalvanizingEnabled: boolean;
  setIsGalvanizingEnabled: (b: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  selectedMaterial, 
  setSelectedMaterial, 
  selectedThickness, 
  setSelectedThickness,
  quantity,
  setQuantity,
  isBendingEnabled,
  setIsBendingEnabled,
  bendsPerPart,
  setBendsPerPart,
  paintingSides,
  setPaintingSides,
  isGalvanizingEnabled,
  setIsGalvanizingEnabled
}) => {
  return (
    <div className="flex flex-col gap-8">
      {/* Material Selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Материал</label>
        <div className="flex flex-col gap-2">
          {Object.values(MaterialType).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedMaterial(type)}
              className={`text-left px-4 py-3.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all border-2 ${
                selectedMaterial === type 
                ? 'bg-brand-500 text-white border-brand-500 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100 active:bg-slate-50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Thickness Selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Толщина (мм)</label>
        <div className="grid grid-cols-4 md:grid-cols-4 gap-1.5">
          {AVAILABLE_THICKNESSES.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedThickness(t)}
              className={`py-3 rounded-lg text-[10px] font-black transition-all border-2 ${
                selectedThickness === t 
                ? 'border-brand-500 bg-brand-50 text-brand-700' 
                : 'border-slate-50 bg-slate-50 text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Bending Control */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Гибка металла</label>
          <button 
            onClick={() => setIsBendingEnabled(!isBendingEnabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${isBendingEnabled ? 'bg-brand-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isBendingEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
        
        {isBendingEnabled && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
             <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Кол-во гибов на 1 шт</label>
             <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
                <button onClick={() => setBendsPerPart(Math.max(0, bendsPerPart - 1))} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 active:bg-slate-100 font-bold">-</button>
                <input type="number" min="0" value={bendsPerPart} onChange={(e) => setBendsPerPart(Math.max(0, parseInt(e.target.value) || 0))} className="flex-1 bg-transparent text-center font-black text-slate-900 focus:outline-none" />
                <button onClick={() => setBendsPerPart(bendsPerPart + 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 active:bg-slate-100 font-bold">+</button>
             </div>
          </div>
        )}
      </div>

      {/* Painting Selection */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Полимерная покраска (500₽/м² сторона)</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[0, 1, 2].map((sides) => (
            <button
              key={sides}
              onClick={() => setPaintingSides(sides)}
              className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border-2 ${
                paintingSides === sides 
                ? 'bg-brand-500 text-white border-brand-500 shadow-md' 
                : 'bg-white text-slate-500 border-slate-100'
              }`}
            >
              {sides === 0 ? 'Нет' : sides === 1 ? '1 сторона' : '2 стороны'}
            </button>
          ))}
        </div>
      </div>

      {/* Galvanizing Control */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Цинкование детали</label>
            <span className="text-[8px] text-slate-400 uppercase font-bold tracking-tighter">120 ₽ за кг заготовки</span>
          </div>
          <button 
            onClick={() => setIsGalvanizingEnabled(!isGalvanizingEnabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${isGalvanizingEnabled ? 'bg-brand-500' : 'bg-slate-200'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isGalvanizingEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      {/* Quantity Control */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Кол-во деталей</label>
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 active:bg-slate-100 font-bold">-</button>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} className="flex-1 bg-transparent text-center font-black text-slate-900 focus:outline-none" />
          <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-600 active:bg-slate-100 font-bold">+</button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
