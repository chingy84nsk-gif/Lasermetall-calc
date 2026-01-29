
import React, { useState, useCallback, useMemo, useRef } from 'react';
import { MaterialType, CalculationResult, DxfData, GasType } from './types';
import { PRICING_DATA } from './constants';
import { processDxfFile } from './services/dxfService';
import Sidebar from './components/Sidebar';
import DXFViewer from './components/DXFViewer';
import ResultsCard from './components/ResultsCard';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type ViewMode = 'draw' | 'params' | 'result';

const App: React.FC = () => {
  const [dxfData, setDxfData] = useState<DxfData | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<MaterialType>(MaterialType.STEEL);
  const [selectedThickness, setSelectedThickness] = useState<number>(1.5);
  const [quantity, setQuantity] = useState<number>(1);
  const [bendsPerPart, setBendsPerPart] = useState<number>(0);
  const [isBendingEnabled, setIsBendingEnabled] = useState<boolean>(false);
  const [paintingSides, setPaintingSides] = useState<number>(0); // 0, 1, 2
  const [isGalvanizingEnabled, setIsGalvanizingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ViewMode>('draw');
  
  const page1Ref = useRef<HTMLDivElement>(null);
  const page2Ref = useRef<HTMLDivElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    try {
      const data = await processDxfFile(file);
      setDxfData(data);
      if (window.innerWidth < 768) setActiveView('params');
    } catch (err: any) {
      alert("Ошибка загрузки чертежа");
      setDxfData(null);
    } finally {
      setLoading(false);
    }
  };

  const getBendingPrice = (thickness: number, totalQuantity: number): number => {
    if (thickness <= 3) {
      if (totalQuantity < 100) return 25;
      if (totalQuantity <= 500) return 20;
      return 18;
    } else {
      if (totalQuantity < 100) return 70;
      if (totalQuantity <= 500) return 65;
      return 60;
    }
  };

  const calculation = useMemo((): CalculationResult | null => {
    if (!dxfData) return null;
    const width = dxfData.bounds.maxX - dxfData.bounds.minX;
    const height = dxfData.bounds.maxY - dxfData.bounds.minY;
    const totalLengthMm = dxfData.entities.reduce((acc, curr) => acc + curr.length, 0);
    const totalLengthM = totalLengthMm / 1000;
    const totalPierces = dxfData.entities.length;
    
    const materialPricing = PRICING_DATA.filter(p => p.type === selectedMaterial);
    const pricing = materialPricing.reduce((prev, curr) => 
      Math.abs(curr.thickness - selectedThickness) < Math.abs(prev.thickness - selectedThickness) ? curr : prev
    , materialPricing[0] || PRICING_DATA[0]);

    const areaM2 = (width * height) / 1_000_000; 
    const unitWeight = areaM2 * (selectedThickness / 1000) * pricing.density;

    const netAreaM2 = dxfData.netArea / 1_000_000;
    const unitNetWeight = netAreaM2 * (selectedThickness / 1000) * pricing.density;
    
    const workCost = (totalLengthM * pricing.pricePerMeter) + (totalPierces * pricing.piercePrice);
    const gasCost = totalLengthM * pricing.gasPricePerMeter;
    const metalCost = unitWeight * pricing.metalPricePerKg;
    
    const currentBends = isBendingEnabled ? bendsPerPart : 0;
    const bendingPricePerGib = getBendingPrice(selectedThickness, quantity);
    const bendingCost = currentBends * bendingPricePerGib;

    // Покраска: 500 руб/м2 за сторону по площади заготовки
    const paintingCost = paintingSides * 500 * areaM2;
    
    // Цинкование: 120 руб за кг веса заготовки
    const galvanizingCost = isGalvanizingEnabled ? (unitWeight * 120) : 0;
    
    const unitCost = workCost + gasCost + metalCost + bendingCost + paintingCost + galvanizingCost;

    return {
      totalLength: totalLengthM * quantity,
      totalPierces: totalPierces * quantity,
      cuttingTime: (totalLengthMm / pricing.cuttingSpeed) * quantity,
      totalCost: unitCost * quantity,
      totalWeight: unitWeight * quantity,
      totalNetWeight: unitNetWeight * quantity,
      gasCost: gasCost * quantity,
      gasType: pricing.gasType,
      metalCost: metalCost * quantity,
      workCost: workCost * quantity,
      bendingCost: bendingCost * quantity,
      paintingCost: paintingCost * quantity,
      galvanizingCost: galvanizingCost * quantity,
      bendsCount: currentBends * quantity,
      unitWeight,
      unitNetWeight,
      unitCost,
      fileName,
      material: selectedMaterial,
      thickness: selectedThickness,
      quantity,
      width,
      height,
      totalArea: areaM2 * quantity,
      paintingSides,
      isGalvanized: isGalvanizingEnabled
    };
  }, [dxfData, selectedMaterial, selectedThickness, quantity, fileName, bendsPerPart, isBendingEnabled, paintingSides, isGalvanizingEnabled]);

  const exportToPDF = useCallback(async () => {
    if (!page1Ref.current || !page2Ref.current || !calculation) return;
    try {
      setLoading(true);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const canvasOptions = { scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false, windowWidth: 1200 };

      const canvas1 = await html2canvas(page1Ref.current, canvasOptions);
      pdf.addImage(canvas1.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, Math.min((canvas1.height * pdfWidth) / canvas1.width, pdfHeight));

      pdf.addPage();
      const canvas2 = await html2canvas(page2Ref.current, canvasOptions);
      pdf.addImage(canvas2.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, Math.min((canvas2.height * pdfWidth) / canvas2.width, pdfHeight));

      pdf.save(`ЛазерМеталл_КП_${calculation.fileName.split('.')[0]}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Ошибка формирования PDF");
    } finally {
      setLoading(false);
    }
  }, [calculation]);

  const CompanyHeader = () => (
    <div className="flex flex-col md:flex-row justify-between items-start border-b border-slate-100 pb-8 gap-6 w-full">
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">ЛазерМеталл</h2>
                    <p className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Профессиональная лазерная резка • Новосибирск</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <div className="flex items-center gap-2">📍 г. Новосибирск, ул. Якушева 254а</div>
              <div className="flex items-center gap-2">📞 +7 (951) 373-80-78</div>
              <div className="flex items-center gap-2">✉️ mail@lasersib.com</div>
              <div className="flex items-center gap-2">🕒 Пн-Пт: 9:00-18:00</div>
            </div>
        </div>
        <div className="text-right flex flex-col gap-1 items-end">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Коммерческое предложение</p>
            <p className="text-sm font-black text-slate-800 break-all max-w-[200px]">{fileName}</p>
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg mt-1">
              <span className="text-[10px] font-black text-slate-700">{new Date().toLocaleDateString('ru-RU')}</span>
            </div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] pb-24 md:pb-0">
      <aside className={`w-full md:w-[380px] bg-white border-r border-slate-200 p-6 md:p-8 flex flex-col gap-8 shrink-0 shadow-2xl z-20 ${activeView !== 'params' && 'hidden md:flex'}`}>
        <div className="flex flex-col gap-2">
          <a href="https://www.lasersib.com" target="_blank" rel="noopener noreferrer" className="text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] hover:text-brand-600 transition-colors mb-2 block">
            ← Перейти на lasersib.com
          </a>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-500 rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h1 className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tight">ЛазерМеталл</h1>
          </div>
        </div>
        
        <div className="flex flex-col gap-6 overflow-y-auto pr-2">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Файл для расчета</label>
                <div className="relative group">
                    <input type="file" accept=".dxf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="border-2 border-dashed border-slate-200 group-hover:border-brand-500 rounded-xl p-4 text-center transition-all bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-500 overflow-hidden text-ellipsis">{fileName ? fileName : 'Выбрать DXF'}</p>
                    </div>
                </div>
            </div>
            
            <Sidebar 
                selectedMaterial={selectedMaterial} setSelectedMaterial={setSelectedMaterial}
                selectedThickness={selectedThickness} setSelectedThickness={setSelectedThickness}
                quantity={quantity} setQuantity={setQuantity}
                isBendingEnabled={isBendingEnabled} setIsBendingEnabled={setIsBendingEnabled}
                bendsPerPart={bendsPerPart} setBendsPerPart={setBendsPerPart}
                paintingSides={paintingSides} setPaintingSides={setPaintingSides}
                isGalvanizingEnabled={isGalvanizingEnabled} setIsGalvanizingEnabled={setIsGalvanizingEnabled}
            />
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-[#F8FAFC] p-4 md:p-12">
        {!dxfData ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-24 h-24 bg-white rounded-[32px] shadow-xl flex items-center justify-center text-brand-500 animate-pulse">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
             </div>
             <div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">Калькулятор резки</h2>
                <p className="text-slate-500 font-medium">Загрузите чертеж для расчета по габаритам, резке и гибке</p>
             </div>
             <input type="file" accept=".dxf" onChange={handleFileUpload} className="hidden" id="main-upload" />
             <label htmlFor="main-upload" className="bg-brand-500 text-white px-10 py-5 rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-600 active:scale-95 transition-all cursor-pointer inline-block">
                Выбрать файл DXF
             </label>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-16">
            <div className={`${activeView === 'result' ? 'block' : 'hidden md:block'} space-y-12`}>
                <div ref={page1Ref} className="bg-white p-8 md:p-14 rounded-[40px] shadow-2xl border border-slate-50 flex flex-col gap-12 min-h-[800px]">
                  <CompanyHeader />
                  <div className="flex flex-col lg:flex-row gap-12">
                    <div className="flex-1">
                      <ResultsCard calculation={calculation!} />
                    </div>
                    <div className="w-full lg:w-[400px] flex flex-col gap-8">
                      <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden flex-1">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl"></div>
                        <div className="relative z-10 flex flex-col justify-between h-full gap-10">
                          <div>
                            <p className="text-[11px] font-black text-brand-400 uppercase tracking-[0.2em] mb-3">Итоговая сумма</p>
                            <div className="flex items-baseline gap-3">
                              <span className="text-6xl font-black tracking-tighter">{Math.round(calculation!.totalCost).toLocaleString('ru-RU')}</span>
                              <span className="text-3xl font-bold text-white/30">₽</span>
                            </div>
                            <div className="mt-6 flex flex-col gap-2 p-4 bg-white/5 rounded-2xl border border-white/10">
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Логистические данные:</p>
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] font-bold text-white/60">Вес изделий (нетто):</span>
                                <span className="text-sm font-black text-brand-400">{calculation!.totalNetWeight.toFixed(2)} кг</span>
                              </div>
                            </div>
                          </div>
                          <div className="pt-8 border-t border-white/10 space-y-4">
                            <PriceRow label="Металл (заготовка)" value={calculation!.metalCost} />
                            <PriceRow label="Лазерная резка + газ" value={calculation!.workCost + calculation!.gasCost} />
                            {calculation!.bendingCost > 0 && <PriceRow label="Гибка" value={calculation!.bendingCost} />}
                            {calculation!.paintingCost > 0 && <PriceRow label={`Полимерная покраска (${calculation!.paintingSides === 1 ? '1 сторона' : '2 стороны'})`} value={calculation!.paintingCost} />}
                            {calculation!.galvanizingCost > 0 && <PriceRow label="Цинкование детали" value={calculation!.galvanizingCost} />}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto pt-10 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <span>ЛИСТ 1: РАСЧЕТ СТОИМОСТИ</span>
                    <span>ЛАЗЕРМЕТАЛЛ • {new Date().getFullYear()}</span>
                  </div>
                </div>
                <div ref={page2Ref} className="bg-white p-8 md:p-14 rounded-[40px] shadow-2xl border border-slate-50 flex flex-col gap-10 min-h-[800px]">
                  <CompanyHeader />
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-500"></div> 
                          Схема раскроя и геометрия
                        </h3>
                    </div>
                    <DXFViewer data={dxfData} height={600} />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <StatBox label="Ширина детали" value={`${Math.round(calculation!.width)} мм`} />
                        <StatBox label="Высота детали" value={`${Math.round(calculation!.height)} мм`} />
                        <StatBox label="Чистый вес (1 шт)" value={`${calculation!.unitNetWeight.toFixed(3)} кг`} />
                        <StatBox label="Гибов в заказе" value={`${calculation!.bendsCount} шт`} />
                    </div>
                  </div>
                  <div className="mt-auto pt-10 border-t border-slate-50 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                    <span>ЛИСТ 2: ТЕХНИЧЕСКИЙ ЭСКИЗ</span>
                    <span>ЛАЗЕРМЕТАЛЛ</span>
                  </div>
                </div>
                <div className="fixed bottom-28 right-6 md:static no-print flex justify-end">
                  <button onClick={exportToPDF} disabled={loading} className="bg-brand-500 text-white px-10 py-6 rounded-[32px] font-black text-sm uppercase tracking-widest shadow-2xl hover:bg-brand-600 active:scale-95 transition-all flex items-center gap-4 group">
                    {loading ? <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Скачать отчет (2 листа PDF)</span>}
                  </button>
                </div>
            </div>
          </div>
        )}
      </main>
      {dxfData && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-100 px-6 py-4 flex justify-between items-center md:hidden z-30 shadow-lg no-print">
           <NavButton icon="📏" label="Чертеж" active={activeView === 'draw'} onClick={() => setActiveView('draw')} />
           <NavButton icon="⚙️" label="Параметры" active={activeView === 'params'} onClick={() => setActiveView('params')} />
           <NavButton icon="💰" label="Результат" active={activeView === 'result'} onClick={() => setActiveView('result')} />
        </nav>
      )}
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string }) => (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">{label}</p>
        <p className="text-sm font-black text-slate-800">{value}</p>
    </div>
);

const PriceRow = ({ label, value }: { label: string, value: number }) => (
  <div className="flex justify-between items-center text-[12px] font-bold uppercase tracking-widest">
    <span className="text-white/40">{label}</span>
    <span className="font-black">{Math.round(value).toLocaleString('ru-RU')} ₽</span>
  </div>
);

const NavButton = ({ icon, label, active, onClick }: { icon: string, label: string, active: boolean, onClick: () => void }) => (
    <button onClick={onClick} className={`flex flex-col items-center gap-1.5 flex-1 transition-all ${active ? 'text-brand-500 scale-110' : 'text-slate-400 opacity-60'}`}>
        <span className="text-xl">{icon}</span>
        <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
    </button>
);

export default App;
