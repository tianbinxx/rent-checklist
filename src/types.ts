export type StandardStatus = 'normal' | 'problem' | 'uncheckable' | 'missing'
export type ItemKind = 'status' | 'choice'
export type ScoreTone = 'success' | 'warning' | 'danger'
export type SelectionValue = string | null

export interface HouseRecord {
  id: string
  name: string
  address: string
  rent: string
  landlord: string
  contact: string
  notes: string
  inspectionScore: number | null
  inspectionRecommendation: string
  inspectionAnsweredCount: number
}

export interface ChecklistItemBase {
  id: string
  category: string
  title: string
  how: string
  why?: string
  brandReferences?: string[]
  keywords?: string[]
  uncheckableScore?: number
  missingScore?: number
  supportsMissing?: boolean
}

export interface StatusChecklistItem extends ChecklistItemBase {
  kind: 'status'
  score: number
}

export interface ChoiceChecklistOption {
  value: string
  label: string
  score: number
  description?: string
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
