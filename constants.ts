
import { MaterialType, MaterialConfig, GasType } from './types';

// Плотность в кг/м3
const DENSITY = {
  [MaterialType.STEEL]: 7850,
  [MaterialType.STAINLESS]: 8000,
  [MaterialType.ALUMINUM]: 2700,
  [MaterialType.COPPER]: 8900,
  [MaterialType.GALVANIZED]: 7850
};

// Цена за кг (рынок)
const METAL_PRICE = {
  [MaterialType.STEEL]: 85,
  [MaterialType.STAINLESS]: 480,
  [MaterialType.ALUMINUM]: 350,
  [MaterialType.COPPER]: 1100,
  [MaterialType.GALVANIZED]: 115
};

/**
 * Расчет стоимости газа (баллон 40л/150бар ~ 6000л газа = 800 руб)
 * O2 (низкое давление): ~20-40 л/мин. Стоимость ~1.5 - 8 руб/м
 * N2 (высокое давление): ~300-600 л/мин. Стоимость ~15 - 95 руб/м
 */

export const PRICING_DATA: MaterialConfig[] = [
  // --- ЧЕРНЫЙ МЕТАЛЛ (Кислород) ---
  { type: MaterialType.STEEL, thickness: 0.5, pricePerMeter: 6, piercePrice: 0.8, cuttingSpeed: 10000, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 1.2, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 0.8, pricePerMeter: 8, piercePrice: 1, cuttingSpeed: 8000, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 1.5, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 1.0, pricePerMeter: 10, piercePrice: 1, cuttingSpeed: 7500, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 1.8, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 1.2, pricePerMeter: 12, piercePrice: 1.2, cuttingSpeed: 6500, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 2.1, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 1.5, pricePerMeter: 15, piercePrice: 1.5, cuttingSpeed: 5800, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 2.5, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 2.0, pricePerMeter: 20, piercePrice: 2, cuttingSpeed: 4500, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 3.2, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 2.5, pricePerMeter: 25, piercePrice: 2.5, cuttingSpeed: 3800, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 3.8, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 3.0, pricePerMeter: 30, piercePrice: 3, cuttingSpeed: 3200, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 4.5, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 4.0, pricePerMeter: 40, piercePrice: 4, cuttingSpeed: 2600, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 5.8, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 6.0, pricePerMeter: 60, piercePrice: 6, cuttingSpeed: 1800, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 7.5, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },
  { type: MaterialType.STEEL, thickness: 8.0, pricePerMeter: 80, piercePrice: 8, cuttingSpeed: 1400, density: DENSITY[MaterialType.STEEL], gasType: GasType.O2, gasPricePerMeter: 9.0, metalPricePerKg: METAL_PRICE[MaterialType.STEEL] },

  // --- НЕРЖАВЕЮЩАЯ СТАЛЬ (Азот) ---
  { type: MaterialType.STAINLESS, thickness: 0.5, pricePerMeter: 10, piercePrice: 0.4, cuttingSpeed: 9000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 12, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 0.8, pricePerMeter: 12, piercePrice: 0.5, cuttingSpeed: 7000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 15, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 1.5, pricePerMeter: 15, piercePrice: 1.5, cuttingSpeed: 5000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 22, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 2.0, pricePerMeter: 16, piercePrice: 1.5, cuttingSpeed: 4000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 30, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 2.5, pricePerMeter: 18, piercePrice: 1.7, cuttingSpeed: 3500, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 37, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 3.0, pricePerMeter: 20, piercePrice: 2, cuttingSpeed: 3000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 45, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 5.0, pricePerMeter: 55, piercePrice: 2, cuttingSpeed: 1800, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 75, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },
  { type: MaterialType.STAINLESS, thickness: 8.0, pricePerMeter: 150, piercePrice: 3, cuttingSpeed: 1000, density: DENSITY[MaterialType.STAINLESS], gasType: GasType.N2, gasPricePerMeter: 95, metalPricePerKg: METAL_PRICE[MaterialType.STAINLESS] },

  // --- АЛЮМИНИЙ (Азот) ---
  { type: MaterialType.ALUMINUM, thickness: 1.0, pricePerMeter: 13, piercePrice: 1, cuttingSpeed: 5500, density: DENSITY[MaterialType.ALUMINUM], gasType: GasType.N2, gasPricePerMeter: 18, metalPricePerKg: METAL_PRICE[MaterialType.ALUMINUM] },
  { type: MaterialType.ALUMINUM, thickness: 2.0, pricePerMeter: 20, piercePrice: 1, cuttingSpeed: 3800, density: DENSITY[MaterialType.ALUMINUM], gasType: GasType.N2, gasPricePerMeter: 28, metalPricePerKg: METAL_PRICE[MaterialType.ALUMINUM] },
  { type: MaterialType.ALUMINUM, thickness: 4.0, pricePerMeter: 48, piercePrice: 2, cuttingSpeed: 2000, density: DENSITY[MaterialType.ALUMINUM], gasType: GasType.N2, gasPricePerMeter: 45, metalPricePerKg: METAL_PRICE[MaterialType.ALUMINUM] },

  // --- ОЦИНКОВКА (Азот) ---
  { type: MaterialType.GALVANIZED, thickness: 0.5, pricePerMeter: 7, piercePrice: 0.8, cuttingSpeed: 9000, density: DENSITY[MaterialType.GALVANIZED], gasType: GasType.N2, gasPricePerMeter: 10, metalPricePerKg: METAL_PRICE[MaterialType.GALVANIZED] },
  { type: MaterialType.GALVANIZED, thickness: 0.8, pricePerMeter: 8, piercePrice: 1, cuttingSpeed: 7500, density: DENSITY[MaterialType.GALVANIZED], gasType: GasType.N2, gasPricePerMeter: 12, metalPricePerKg: METAL_PRICE[MaterialType.GALVANIZED] },
  { type: MaterialType.GALVANIZED, thickness: 1.5, pricePerMeter: 15, piercePrice: 1.5, cuttingSpeed: 5200, density: DENSITY[MaterialType.GALVANIZED], gasType: GasType.N2, gasPricePerMeter: 20, metalPricePerKg: METAL_PRICE[MaterialType.GALVANIZED] },
  { type: MaterialType.GALVANIZED, thickness: 2.0, pricePerMeter: 20, piercePrice: 2, cuttingSpeed: 4500, density: DENSITY[MaterialType.GALVANIZED], gasType: GasType.N2, gasPricePerMeter: 25, metalPricePerKg: METAL_PRICE[MaterialType.GALVANIZED] }
];

export const AVAILABLE_THICKNESSES = [0.5, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0, 6.0, 8.0, 10.0, 12.0, 14.0, 16.0];
