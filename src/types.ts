export type StandardStatus = 'normal' | 'minor' | 'major' | 'missing'
export type ItemKind = 'status' | 'choice'
export type ScoreTone = 'success' | 'warning' | 'danger'
export type SelectionValue = string | null

export interface HouseRecord {
  id: string
  name: string
  address: string
  rent: string
  budget: string
  waterFee: string
  electricFee: string
  internetFee: string
  sanitationFee: string
  propertyFee: string
  landlord: string
  contact: string
  notes: string
  qualityScore: number | null
  rentScore: number | null
  finalScore: number | null
  inspectionScore: number | null
  inspectionRecommendation: string
  inspectionAnsweredCount: number
  inspectionSelections: Record<string, SelectionValue>
  inspectionVetoStates: Record<string, boolean>
}

export interface ChecklistItemBase {
  id: string
  category: string
  title: string
  weight: number
  how: string
  why?: string
  brandReferences?: string[]
  keywords?: string[]
}

export interface StatusChecklistItem extends ChecklistItemBase {
  kind: 'status'
}

export interface ChoiceChecklistOption {
  value: string
  label: string
  factor: number
  description?: string
  triggersVeto?: boolean
}

export interface ChoiceChecklistItem extends ChecklistItemBase {
  kind: 'choice'
  options: ChoiceChecklistOption[]
}

export type ChecklistItem = StatusChecklistItem | ChoiceChecklistItem

export interface VetoItem {
  id: string
  label: string
  how: string
  why?: string
}

export interface DeductionEntry {
  id: string
  category: string
  title: string
  selectedLabel: string
  deduction: number
  how: string
  why?: string
  isVeto?: boolean
}

export interface HouseInspectionSnapshot {
  qualityScore: number | null
  rentScore: number | null
  finalScore: number | null
  inspectionScore: number | null
  inspectionRecommendation: string
  inspectionAnsweredCount: number
  inspectionSelections: Record<string, SelectionValue>
  inspectionVetoStates: Record<string, boolean>
}
