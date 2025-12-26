export enum ItemCategory {
  FOOD = 'Food',
  CLOTHING = 'Clothing',
  HYGIENE = 'Hygiene',
  HOUSEHOLD = 'Household',
  MEDICAL = 'Medical',
  OTHER = 'Other'
}

export enum UnitType {
  COUNT = 'items',
  LBS = 'lbs',
  KG = 'kg',
  BOXES = 'boxes',
  CANS = 'cans',
  LITERS = 'liters'
}

export interface Location {
  id: string;
  name: string;
  address?: string;
  type?: string;
}

export interface InventoryItem {
  id: string;
  locationId: string;
  name: string;
  category: ItemCategory;
  quantity: number;
  targetQuantity: number;
  unit: UnitType;
  expirationDate?: string;
  lastDeliveryDate?: string;
  addedDate: string;
  notes?: string;
}

export type FilterType = 'ALL' | ItemCategory;