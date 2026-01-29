
import React, { useMemo } from 'react';
import { DxfData } from '../types';

interface DXFViewerProps {
  data: DxfData;
  height?: number | string;
}

const DXFViewer: React.FC<DXFViewerProps> = ({ data, height = 500 }) => {
  const { entities, bounds } = data;

  const viewBox = useMemo(() => {
    const width = Math.abs(bounds.maxX - bounds.minX);
    const heightVal = Math.abs(bounds.maxY - bounds.minY);
    
    if (width === 0 || heightVal === 0) return "0 0 100 100";

    const paddingX = width * 0.1;
    const paddingY = heightVal * 0.1;
    
    return `${bounds.minX - paddingX} ${bounds.minY - paddingY} ${width + paddingX * 2} ${heightVal + paddingY * 2}`;
  }, [bounds]);

  return (
    <div 
      className="w-full flex items-center justify-center bg-[#FDFDFD] rounded-[24px] overflow-hidden relative border border-slate-50 shadow-inner"
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#FF7F00 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>
      
      <svg 
        viewBox={viewBox} 
        className="w-full h-full relative z-10 p-4"
        preserveAspectRatio="xMidYMid meet"
        style={{ transform: 'scaleY(-1)' }} 
      >
        {entities.map((entity, i) => {
          const common = {
            key: i,
            stroke: "#1E293B",
            strokeWidth: "1.5",
            fill: "none",
            vectorEffect: "non-scaling-stroke" as const,
            strokeLinecap: "round" as const,
            strokeLinejoin: "round" as const
          };

          if (entity.type === 'LINE' && entity.points) {
            return <line {...common} x1={entity.points[0].x} y1={entity.points[0].y} x2={entity.points[1].x} y2={entity.points[1].y} />;
          }
          if (entity.type === 'CIRCLE' && entity.center && entity.radius) {
            return <circle {...common} cx={entity.center.x} cy={entity.center.y} r={entity.radius} />;
          }
          if (entity.type === 'ARC' && entity.center && entity.radius && entity.startAngle !== undefined && entity.endAngle !== undefined) {
            const polarToCartesian = (cx: number, cy: number, r: number, ang: number) => {
              const rad = (ang * Math.PI) / 180.0;
              return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
            };
            const start = polarToCartesian(entity.center.x, entity.center.y, entity.radius, entity.startAngle);
            const end = polarToCartesian(entity.center.x, entity.center.y, entity.radius, entity.endAngle);
            const diff = entity.endAngle - entity.startAngle;
            const sweep = 1; // Всегда 1 для DXF ARC (против часовой стрелки)
            const largeArc = (diff < 0 ? diff + 360 : diff) <= 180 ? "0" : "1";
            const d = `M ${start.x} ${start.y} A ${entity.radius} ${entity.radius} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
            return <path {...common} d={d} />;
          }
          if (entity.type === 'POLYLINE' && entity.points) {
            const d = entity.points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + (entity.isClosed ? ' Z' : '');
            return <path {...common} d={d} />;
          }
          return null;
        })}
      </svg>
      
      <div className="absolute bottom-4 left-4 flex gap-4">
        <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 border border-slate-100 shadow-sm uppercase tracking-widest flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-brand-500 rounded-full"></div>
          {Math.round(Math.abs(bounds.maxX - bounds.minX))} × {Math.round(Math.abs(bounds.maxY - bounds.minY))} мм
        </div>
      </div>
    </div>
  );
};

export default DXFViewer;
