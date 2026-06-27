import { computed, ref, watch } from 'vue'

import type { HouseRecord } from '../types'

const HOUSES_STORAGE_KEY = 'rental-checklist-houses'
const SELECTED_HOUSE_STORAGE_KEY = 'rental-checklist-selected-house'
type HouseFormPayload = Pick<
  HouseRecord,
  'name' | 'address' | 'rent' | 'landlord' | 'contact' | 'notes'
>
type SaveHousePayload = HouseFormPayload | (HouseFormPayload & Pick<HouseRecord, 'id'>)

const canUseStorage = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
const createEmptyHouseDraft = (): Omit<HouseRecord, 'id'> => ({
  name: '',
  address: '',
  rent: '',
  landlord: '',
  contact: '',
  notes: '',
  inspectionScore: null,
  inspectionRecommendation: '',
  inspectionAnsweredCount: 0
})

const parseStoredJson = <T>(value: string | null, fallback: T): T => {
  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

const normalizeHouseRecord = (house: Partial<HouseRecord>): HouseRecord => ({
  ...createEmptyHouseDraft(),
  ...house,
  id: house.id ?? createHouseId()
})

const loadStoredHouses = () =>
  canUseStorage
    ? parseStoredJson<Partial<HouseRecord>[]>(window.localStorage.getItem(HOUSES_STORAGE_KEY), []).map(
        normalizeHouseRecord
      )
    : []

const loadSelectedHouseId = () =>
  canUseStorage ? window.localStorage.getItem(SELECTED_HOUSE_STORAGE_KEY) : null

const createHouseId = () => `house-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export const houses = ref<HouseRecord[]>(loadStoredHouses())
export const selectedHouseId = ref<string | null>(loadSelectedHouseId())

const syncSelectedHouseId = () => {
  if (!houses.value.some((house) => house.id === selectedHouseId.value)) {
    selectedHouseId.value = null
  }
}

syncSelectedHouseId()

watch(
  houses,
  (value) => {
    syncSelectedHouseId()

    if (!canUseStorage) {
      return
    }

    window.localStorage.setItem(HOUSES_STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

watch(selectedHouseId, (value) => {
  if (!canUseStorage) {
    return
  }

  if (!value) {
    window.localStorage.removeItem(SELECTED_HOUSE_STORAGE_KEY)
    return
  }

  window.localStorage.setItem(SELECTED_HOUSE_STORAGE_KEY, value)
})

export const selectedHouse = computed(
  () => houses.value.find((house) => house.id === selectedHouseId.value) ?? null
)

export const hasSelectedHouse = computed(() => selectedHouse.value !== null)

export const createEmptyHouseForm = () => createEmptyHouseDraft()

export const saveHouse = (payload: SaveHousePayload) => {
  const id = 'id' in payload ? payload.id : createHouseId()
  const currentHouse = houses.value.find((item) => item.id === id)
  const house: HouseRecord = {
    ...createEmptyHouseForm(),
    ...currentHouse,
    ...payload,
    id
  }
  const currentIndex = houses.value.findIndex((item) => item.id === id)

  if (currentIndex >= 0) {
    houses.value[currentIndex] = house
  } else {
    houses.value.unshift(house)
  }

  return house
}

export const selectHouse = (id: string) => {
  selectedHouseId.value = houses.value.some((house) => house.id === id) ? id : null
}

export const deleteHouse = (id: string) => {
  houses.value = houses.value.filter((house) => house.id !== id)

  if (selectedHouseId.value === id) {
    selectedHouseId.value = null
  }
}

export const updateHouseInspection = (
  id: string,
  payload: Pick<HouseRecord, 'inspectionScore' | 'inspectionRecommendation' | 'inspectionAnsweredCount'>
) => {
  const currentIndex = houses.value.findIndex((house) => house.id === id)

  if (currentIndex < 0) {
    return
  }

  houses.value[currentIndex] = {
    ...houses.value[currentIndex],
    ...payload
  }
}

export const resetHouseStore = () => {
  houses.value = []
  selectedHouseId.value = null

  if (!canUseStorage) {
    return
  }

  window.localStorage.removeItem(HOUSES_STORAGE_KEY)
  window.localStorage.removeItem(SELECTED_HOUSE_STORAGE_KEY)
}
