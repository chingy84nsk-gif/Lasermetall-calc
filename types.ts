
export enum MaterialType {
  STEEL = 'Сталь (Черная)',
  STAINLESS = 'Нержавеющая сталь',
  ALUMINUM = 'Алюминий',
  COPPER = 'Медь/Латунь',
  GALVANIZED = 'Оцинкованная сталь'
}

export enum GasType {
  O2 = 'Кислород (O2)',
  N2 = 'Азот (N2)',
  AIR = 'Воздух'
}

export interface MaterialConfig {
  type: MaterialType;
  thickness: number;
  pricePerMeter: number;
  piercePrice: number;
  cuttingSpeed: number;
  density: number; // kg/m3
  gasPricePerMeter: number; // RUB/meter
  gasType: GasType;
  metalPricePerKg: number; // RUB/kg
}

export interface DxfEntity {
  type: string;
  length: number;
  area: number; // area in mm2 if closed
  isClosed?: boolean;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  points?: { x: number; y: number }[];
  center?: { x: number; y: number };
  radius?: number;
  startAngle?: number;
  endAngle?: number;
}

export interface CalculationResult {
  totalLength: number;
  totalPierces: number;
  cuttingTime: number;
  totalCost: number;
  totalWeight: number; // kg (gross)
  totalNetWeight: number; // kg (net)
  gasCost: number;
  gasType: GasType;
  metalCost: number;
  workCost: number; 
  bendingCost: number;
  paintingCost: number;
  galvanizingCost: number;
  bendsCount: number;
  fileName: string;
  material: MaterialType;
  thickness: number;
  quantity: number;
  unitWeight: number;
  unitNetWeight: number;
  unitCost: number;
  width: number;
  height: number;
  totalArea: number;
  paintingSides: number;
  isGalvanized: boolean;
}

export interface DxfData {
  entities: DxfEntity[];
  netArea: number;
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}
