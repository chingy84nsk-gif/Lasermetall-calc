
import DxfParser from 'dxf-parser';
import { DxfData, DxfEntity } from '../types';

export const processDxfFile = async (file: File): Promise<DxfData> => {
  const text = await file.text();
  const parser = new DxfParser();
  
  try {
    const dxf = parser.parseSync(text);
    if (!dxf) throw new Error("Не удалось прочитать DXF");

    const entities: DxfEntity[] = [];
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    const updateGlobalBounds = (x: number, y: number) => {
      if (isNaN(x) || isNaN(y)) return;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    };

    dxf.entities.forEach((entity: any) => {
      let length = 0;
      let area = 0;
      let eMinX = Infinity, eMinY = Infinity, eMaxX = -Infinity, eMaxY = -Infinity;

      const updateLocalBounds = (x: number, y: number) => {
        if (isNaN(x) || isNaN(y)) return;
        eMinX = Math.min(eMinX, x); eMinY = Math.min(eMinY, y);
        eMaxX = Math.max(eMaxX, x); eMaxY = Math.max(eMaxY, y);
        updateGlobalBounds(x, y);
      };
      
      switch (entity.type) {
        case 'LINE':
          const dx = entity.vertices[1].x - entity.vertices[0].x;
          const dy = entity.vertices[1].y - entity.vertices[0].y;
          length = Math.sqrt(dx * dx + dy * dy);
          entity.vertices.forEach((v: any) => updateLocalBounds(v.x, v.y));
          entities.push({ 
            type: 'LINE', length, area: 0, points: entity.vertices, 
            bounds: { minX: eMinX, minY: eMinY, maxX: eMaxX, maxY: eMaxY } 
          });
          break;

        case 'CIRCLE':
          length = 2 * Math.PI * entity.radius;
          area = Math.PI * Math.pow(entity.radius, 2);
          updateLocalBounds(entity.center.x - entity.radius, entity.center.y - entity.radius);
          updateLocalBounds(entity.center.x + entity.radius, entity.center.y + entity.radius);
          entities.push({ 
            type: 'CIRCLE', length, area, center: entity.center, radius: entity.radius, isClosed: true, 
            bounds: { minX: eMinX, minY: eMinY, maxX: eMaxX, maxY: eMaxY } 
          });
          break;

        case 'ARC':
          let angle = entity.endAngle - entity.startAngle;
          if (angle < 0) angle += 360;
          length = (angle / 360) * (2 * Math.PI * entity.radius);
          updateLocalBounds(entity.center.x - entity.radius, entity.center.y - entity.radius);
          updateLocalBounds(entity.center.x + entity.radius, entity.center.y + entity.radius);
          entities.push({ 
            type: 'ARC', length, area: 0, center: entity.center, radius: entity.radius, 
            startAngle: entity.startAngle, endAngle: entity.endAngle, isClosed: false,
            bounds: { minX: eMinX, minY: eMinY, maxX: eMaxX, maxY: eMaxY } 
          });
          break;

        case 'LWPOLYLINE':
        case 'POLYLINE':
          const vertices = entity.vertices;
          if (!vertices || vertices.length < 2) break;

          for (let i = 0; i < vertices.length - 1; i++) {
            length += Math.sqrt(Math.pow(vertices[i+1].x - vertices[i].x, 2) + Math.pow(vertices[i+1].y - vertices[i].y, 2));
            updateLocalBounds(vertices[i].x, vertices[i].y);
          }
          updateLocalBounds(vertices[vertices.length - 1].x, vertices[vertices.length - 1].y);

          const isFlaggedClosed = !!(entity.shape || entity.closed);
          const distStartEnd = Math.sqrt(
            Math.pow(vertices[vertices.length-1].x - vertices[0].x, 2) + 
            Math.pow(vertices[vertices.length-1].y - vertices[0].y, 2)
          );
          const isGeometricallyClosed = distStartEnd < 0.05;
          const isClosed = isFlaggedClosed || isGeometricallyClosed;

          if (isClosed) {
            if (!isFlaggedClosed) {
              length += distStartEnd;
            }
            let sArea = 0;
            for (let i = 0; i < vertices.length; i++) {
              let j = (i + 1) % vertices.length;
              sArea += vertices[i].x * vertices[j].y;
              sArea -= vertices[j].x * vertices[i].y;
            }
            area = Math.abs(sArea) / 2;
          }
          entities.push({ 
            type: 'POLYLINE', length, area, points: vertices, isClosed, 
            bounds: { minX: eMinX, minY: eMinY, maxX: eMaxX, maxY: eMaxY } 
          });
          break;
      }
    });

    // 1. Фильтрация дубликатов (очень частая проблема в DXF)
    const uniqueEntities = entities.filter((e1, idx) => {
      for (let j = 0; j < idx; j++) {
        const e2 = entities[j];
        if (e1.type === e2.type && 
            Math.abs(e1.bounds.minX - e2.bounds.minX) < 0.01 &&
            Math.abs(e1.bounds.maxX - e2.bounds.maxX) < 0.01 &&
            Math.abs(e1.bounds.minY - e2.bounds.minY) < 0.01 &&
            Math.abs(e1.bounds.maxY - e2.bounds.maxY) < 0.01 &&
            Math.abs(e1.length - e2.length) < 0.01) {
          return false;
        }
      }
      return true;
    });

    // Расчет чистого веса (площади) на основе вложенности
    const closedEntities = uniqueEntities.filter(e => e.isClosed && e.area > 0);
    let netArea = 0;

    if (closedEntities.length === 0) {
      // Если замкнутых контуров нет, расчет по габаритам (Хотя это и не совсем точно для произвольных линий)
      netArea = Math.max(0, (maxX - minX) * (maxY - minY));
    } else {
      // Сортируем контуры по площади (от больших к меньшим)
      const sorted = [...closedEntities].sort((a, b) => b.area - a.area);
      
      sorted.forEach((current, i) => {
        let nestLevel = 0;
        for (let j = 0; j < sorted.length; j++) {
          if (i === j) continue;
          const other = sorted[j];
          
          // current внутри other?
          const isInside = 
            current.bounds.minX >= other.bounds.minX - 0.001 &&
            current.bounds.maxX <= other.bounds.maxX + 0.001 &&
            current.bounds.minY >= other.bounds.minY - 0.001 &&
            current.bounds.maxY <= other.bounds.maxY + 0.001 &&
            other.area > current.area + 0.01; // Должен быть строго больше
          
          if (isInside) nestLevel++;
        }

        // Четный уровень -> добавляем (внешний контур или "остров" в отверстии)
        // Нечетный уровень -> вычитаем (отверстие)
        if (nestLevel % 2 === 0) {
          netArea += current.area;
        } else {
          netArea -= current.area;
        }
      });
    }

    return { 
      entities: uniqueEntities, 
      netArea: Math.max(0, netArea), 
      bounds: { 
        minX: isFinite(minX) ? minX : 0, 
        minY: isFinite(minY) ? minY : 0, 
        maxX: isFinite(maxX) ? maxX : 100, 
        maxY: isFinite(maxY) ? maxY : 100 
      } 
    };
  } catch (err) {
    console.error(err);
    throw new Error("Ошибка парсинга DXF. Проверьте формат файла.");
  }
};
