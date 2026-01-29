
import React from 'react';
import { CalculationResult, MaterialType, GasType } from '../types';
import { PRICING_DATA } from '../constants';

interface ResultsCardProps {
  calculation: CalculationResult;
}

const ResultsCard: React.FC<ResultsCardProps> = ({ calculation }) => {
  const materialInfo = PRICING_DATA.find(p => p.type === calculation.material);
  const density = materialInfo?.density || 0;

  const getGasRecommendation = (material: MaterialType): string => {
    switch (material) {
      case MaterialType.STEEL:
        return "Рекомендуется Кислород (O2) для получения ровного реза на черной стали. Возможен азот для тонких листов (до 2мм).";
      case MaterialType.STAINLESS:
        return "Используется Азот (N2). Гарантирует отсутствие окалины и сохранение антикоррозийных свойств кромки.";
      case MaterialType.ALUMINUM:
        return "Азот (N2) под высоким давлением — лучший выбор для алюминия (чистая кромка без наплыва).";
      case MaterialType.GALVANIZED:
        return "Азот (N2) предотвращает выгорание цинка вокруг линии реза.";
      default:
        return "Тип газа подбирается индивидуально.";
    }
  };

  return (
    <div className="bg-[#FBFCFE] rounded-[32px] border border-slate-100 p-6 md:p-8 flex flex-col gap-6 shadow-sm">
      <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-brand-500"></div>
        Технологические параметры
      </h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-3 bg-white p-4 rounded-2xl border border-slate-50">
          <ResultItem label="Материал" value={calculation.material} />
          <ResultItem label="Толщина" value={`${calculation.thickness} мм`} />
          <ResultItem label="Тип газа" value={calculation.gasType} highlight />
        </div>

        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
           <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-2">
             <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"></path></svg>
             Рекомендация по газу
           </p>
           <p className="text-[11px] font-medium text-amber-800 leading-relaxed">
             {getGasRecommendation(calculation.material)}
           </p>
        </div>

        <div className="h-px bg-slate-100 my-2"></div>

        <div className="space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Вес изделия (1 шт):</p>
          <ResultItem label="Чистый вес (Нетто)" value={`${calculation.unitNetWeight.toFixed(3)} кг`} />
          <ResultItem label="Вес заготовки (Брутто)" value={`${calculation.unitWeight.toFixed(3)} кг`} />
        </div>

        <div className="h-px bg-slate-100 my-2"></div>
        
        <div className="space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Итого по заказу ({calculation.quantity} шт):</p>
          <ResultItem label="Общий вес изделий" value={`${calculation.totalNetWeight.toFixed(2)} кг`} highlight />
          <ResultItem label="Стоимость газа" value={`${Math.round(calculation.gasCost)} ₽`} />
        </div>
        
        <div className="h-px bg-slate-100 my-4"></div>

        <div className="space-y-3 bg-brand-50/30 p-4 rounded-2xl border border-brand-100/50">
          <p className="text-[9px] font-black text-brand-600 uppercase tracking-widest mb-2">Стоимость за 1 единицу:</p>
          <ResultItem label="Металл" value={`${Math.round(calculation.metalCost / calculation.quantity)} ₽`} />
          <ResultItem label="Резка + Газ" value={`${Math.round((calculation.workCost + calculation.gasCost) / calculation.quantity)} ₽`} />
          {calculation.bendingCost > 0 && (
            <ResultItem label="Гибка" value={`${Math.round(calculation.bendingCost / calculation.quantity)} ₽`} />
          )}
          {calculation.paintingCost > 0 && (
            <ResultItem label={`Полимерная покраска (${calculation.paintingSides === 1 ? '1 сторона' : '2 стороны'})`} value={`${Math.round(calculation.paintingCost / calculation.quantity)} ₽`} />
          )}
          {calculation.galvanizingCost > 0 && (
            <ResultItem label="Цинкование детали" value={`${Math.round(calculation.galvanizingCost / calculation.quantity)} ₽`} />
          )}
          <div className="h-px bg-brand-100 my-1"></div>
          <ResultItem label="Итого за ед." value={`${Math.round(calculation.unitCost)} ₽`} highlight />
        </div>
      </div>
    </div>
  );
};

const ResultItem = ({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) => (
  <div className="flex justify-between items-center text-sm group">
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">{label}</span>
    <span className={`font-black font-mono text-right ${highlight ? 'text-brand-600 scale-105 origin-right transition-transform' : 'text-slate-900'}`}>{value}</span>
  </div>
);

export default ResultsCard;
