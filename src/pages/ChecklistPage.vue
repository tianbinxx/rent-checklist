<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { baseScore, checklistItems, qualityWeight, rentWeight, vetoItems } from '../data/checklist'
import ChecklistCard from '../components/ChecklistCard.vue'
import DeductionPanel from '../components/DeductionPanel.vue'
import FinalResult from '../components/FinalResult.vue'
import HeaderScore from '../components/HeaderScore.vue'
import { selectedHouse, updateHouseInspection } from '../stores/houses'
import type {
  ChecklistItem,
  DeductionEntry,
  ScoreTone,
  SelectionValue,
  StandardStatus
} from '../types'

const router = useRouter()
const searchKeyword = ref('')

const createEmptySelectionState = () =>
  Object.fromEntries(checklistItems.map((item) => [item.id, null])) as Record<string, SelectionValue>

const createEmptyVetoState = () =>
  Object.fromEntries(vetoItems.map((item) => [item.id, false])) as Record<string, boolean>

const itemSelections = reactive<Record<string, SelectionValue>>(createEmptySelectionState()) as Record<
  string,
  SelectionValue
>

const vetoStates = reactive<Record<string, boolean>>(createEmptyVetoState()) as Record<string, boolean>

const categoryOrder = [...new Set(checklistItems.map((item) => item.category))]

const collapsedMap = reactive<Record<string, boolean>>(
  Object.fromEntries(categoryOrder.map((category) => [category, false]))
) as Record<string, boolean>

const normalLevelFactorMap: Record<StandardStatus, number> = {
  normal: 1,
  minor: 0.7,
  major: 0.3,
  missing: 0
}

const normalizeText = (value: string) => value.trim().toLowerCase()

const parseAmount = (value: string | null | undefined) => {
  if (!value) {
    return null
  }

  const normalized = value.replace(/[^\d.]/g, '')

  if (!normalized) {
    return null
  }

  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

const formatScore = (value: number | null) => {
  if (value === null) {
    return '--'
  }

  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(1)
}

const getSelectionLabel = (item: ChecklistItem, selection: SelectionValue) => {
  if (selection === 'normal') {
    return '完全正常'
  }

  if (selection === 'minor') {
    return '有一定问题'
  }

  if (selection === 'major') {
    return '有很大问题'
  }

  if (selection === 'missing') {
    return '缺失'
  }

  if (item.kind === 'choice') {
    return item.options.find((option) => option.value === selection)?.label ?? '已选择'
  }

  return '未处理'
}

const getSelectedChoiceOption = (item: ChecklistItem, selection: SelectionValue) =>
  item.kind === 'choice'
    ? item.options.find((option) => option.value === selection) ?? null
    : null

const isVetoSelection = (item: ChecklistItem, selection: SelectionValue) =>
  Boolean(getSelectedChoiceOption(item, selection)?.triggersVeto)

const getItemScore = (item: ChecklistItem, selection: SelectionValue) => {
  if (!selection) {
    return null
  }

  if (item.kind === 'status') {
    return Number((item.weight * normalLevelFactorMap[selection as StandardStatus]).toFixed(3))
  }

  const option = getSelectedChoiceOption(item, selection)

  if (!option) {
    return null
  }

  return Number((item.weight * option.factor).toFixed(3))
}

const getDeductionForSelection = (item: ChecklistItem, selection: SelectionValue) => {
  const itemScore = getItemScore(item, selection)

  if (itemScore === null) {
    return 0
  }

  return Number((item.weight - itemScore).toFixed(3))
}

const getSearchSource = (item: ChecklistItem) =>
  [
    item.category,
    item.title,
    item.how,
    item.why,
    ...(item.brandReferences ?? []),
    ...(item.keywords ?? []),
    ...(item.kind === 'choice'
      ? item.options.flatMap((option) => [option.label, option.description ?? ''])
      : [])
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

const selectedManualVetoItems = computed(() => vetoItems.filter((item) => vetoStates[item.id]))

const selectedChecklistVetoEntries = computed(() =>
  checklistItems.flatMap((item) => {
    const selection = itemSelections[item.id]

    if (!selection || !isVetoSelection(item, selection)) {
      return []
    }

    return [
      {
        id: item.id,
        label: `${item.title}：${getSelectionLabel(item, selection)}`
      }
    ]
  })
)

const selectedVetoLabels = computed(() => [
  ...selectedChecklistVetoEntries.value.map((item) => item.label),
  ...selectedManualVetoItems.value.map((item) => item.label)
])

const hasVeto = computed(
  () => selectedChecklistVetoEntries.value.length > 0 || selectedManualVetoItems.value.length > 0
)

const isDeductionEntry = (entry: DeductionEntry | null): entry is DeductionEntry => entry !== null

const deductionEntries = computed<DeductionEntry[]>(() =>
  checklistItems
    .map((item) => {
      const selection = itemSelections[item.id]
      const deduction = getDeductionForSelection(item, selection)
      const vetoSelection = selection ? isVetoSelection(item, selection) : false

      if (!selection || (deduction === 0 && !vetoSelection)) {
        return null
      }

      const entry: DeductionEntry = {
        id: item.id,
        category: item.category,
        title: item.title,
        selectedLabel: getSelectionLabel(item, selection),
        deduction,
        how: item.how,
        isVeto: vetoSelection
      }

      if (item.why) {
        entry.why = item.why
      }

      return entry
    })
    .filter(isDeductionEntry)
)

const totalDeduction = computed(() =>
  Number(deductionEntries.value.reduce((sum, entry) => sum + entry.deduction, 0).toFixed(3))
)

const qualityScore = computed(() => {
  if (hasVeto.value) {
    return 0
  }

  const total = checklistItems.reduce((sum, item) => {
    const selection = itemSelections[item.id]
    const itemScore = getItemScore(item, selection)
    return sum + (itemScore ?? 0)
  }, 0)

  return Number(Math.min(baseScore, total).toFixed(1))
})

const rentAmount = computed(() => parseAmount(selectedHouse.value?.rent))
const budgetAmount = computed(() => parseAmount(selectedHouse.value?.budget))

const rentRatio = computed(() => {
  const rent = rentAmount.value
  const budget = budgetAmount.value

  if (rent === null || budget === null || budget <= 0) {
    return null
  }

  return Number((rent / budget).toFixed(3))
})

const rentScore = computed<number | null>(() => {
  const ratio = rentRatio.value

  if (ratio === null) {
    return null
  }

  if (ratio <= 0.9) {
    return 100
  }

  if (ratio <= 1) {
    return 90
  }

  if (ratio <= 1.1) {
    return 80
  }

  if (ratio <= 1.2) {
    return 65
  }

  if (ratio <= 1.3) {
    return 50
  }

  return 30
})

const finalScore = computed(() => {
  if (hasVeto.value) {
    return 0
  }

  if (rentScore.value === null) {
    return qualityScore.value
  }

  return Number((qualityScore.value * qualityWeight + rentScore.value * rentWeight).toFixed(1))
})

const scoreColor = computed<ScoreTone>(() => {
  if (finalScore.value >= 85) {
    return 'success'
  }

  if (finalScore.value >= 65) {
    return 'warning'
  }

  return 'danger'
})

const recommendation = computed(() => {
  if (hasVeto.value) {
    return {
      stars: '★☆☆☆☆',
      label: '不要租',
      description: '已命中一票否决项，最终分直接归零，不建议继续推进。',
      tone: 'danger' as const
    }
  }

  if (qualityScore.value < 60 || finalScore.value < 65) {
    return {
      stars: '★★☆☆☆',
      label: '不推荐',
      description:
        rentScore.value === null
          ? '当前按看房质量判断已偏弱，建议先补全月租目标后再综合比较。'
          : '看房质量或月租匹配度偏弱，综合下来不建议优先选择。',
      tone: 'danger' as const
    }
  }

  if (finalScore.value >= 85 && qualityScore.value >= 75) {
    return {
      stars: '★★★★★',
      label: '推荐租',
      description:
        rentScore.value === null
          ? '当前质量分表现稳定，若月租也合适，可以作为优先候选。'
          : '房屋质量和月租匹配度都比较好，是当前更值得优先考虑的房源。',
      tone: 'success' as const
    }
  }

  if (finalScore.value >= 75) {
    return {
      stars: '★★★★☆',
      label: '可以租',
      description:
        rentScore.value === null
          ? '质量表现尚可，补全月租目标后会得到更完整的结论。'
          : '整体可接受，少量问题仍在合理范围内，建议结合地段进一步判断。',
      tone: 'success' as const
    }
  }

  return {
    stars: '★★★☆☆',
    label: '谨慎租',
    description:
      rentScore.value === null
        ? '当前按质量分看处于边缘区间，建议补全月租目标后再决定。'
        : '房屋质量或月租其一已经开始拖后腿，建议和其他房源横向比较后再决定。',
    tone: 'warning' as const
  }
})

const rentSummary = computed(() => {
  if (!selectedHouse.value) {
    return '未选择房屋'
  }

  return `月租 ${selectedHouse.value.rent || '未填写'} / 目标月租 ${selectedHouse.value.budget || '未填写'}`
})

const formulaText = computed(() => {
  if (hasVeto.value) {
    return '命中一票否决，最终分 = 0'
  }

  if (rentScore.value === null) {
    return `未填写目标月租，当前最终分暂按看房质量分 ${formatScore(qualityScore.value)} 计算`
  }

  return `最终分 = 看房质量分 ${formatScore(qualityScore.value)} × 75% + 租金分 ${formatScore(rentScore.value)} × 25% = ${formatScore(finalScore.value)}`
})

const filteredGroups = computed(() => {
  const keyword = normalizeText(searchKeyword.value)
  const groups = new Map<string, ChecklistItem[]>()

  checklistItems.forEach((item) => {
    const matched = !keyword || getSearchSource(item).includes(keyword)

    if (!matched) {
      return
    }

    if (!groups.has(item.category)) {
      groups.set(item.category, [])
    }

    groups.get(item.category)?.push(item)
  })

  return categoryOrder
    .filter((category) => groups.has(category))
    .map((category) => ({
      category,
      items: groups.get(category) ?? []
    }))
})

const visibleItemCount = computed(() =>
  filteredGroups.value.reduce((sum, group) => sum + group.items.length, 0)
)

const answeredItemCount = computed(
  () => Object.values(itemSelections).filter((value) => value !== null).length
)

const allCollapsed = computed(
  () => categoryOrder.length > 0 && categoryOrder.every((category) => collapsedMap[category])
)

const updateItemSelection = (payload: { id: string; value: SelectionValue }) => {
  itemSelections[payload.id] = payload.value
}

const toggleVeto = (id: string, checked: boolean) => {
  vetoStates[id] = checked
}

const toggleCategory = (category: string) => {
  collapsedMap[category] = !collapsedMap[category]
}

const toggleAllCategories = () => {
  const nextCollapsed = !allCollapsed.value

  categoryOrder.forEach((category) => {
    collapsedMap[category] = nextCollapsed
  })
}

const restoreChecklistState = () => {
  const nextSelections = {
    ...createEmptySelectionState(),
    ...(selectedHouse.value?.inspectionSelections ?? {})
  }
  const nextVetoStates = {
    ...createEmptyVetoState(),
    ...(selectedHouse.value?.inspectionVetoStates ?? {})
  }

  checklistItems.forEach((item) => {
    itemSelections[item.id] = nextSelections[item.id] ?? null
  })

  vetoItems.forEach((item) => {
    vetoStates[item.id] = nextVetoStates[item.id] ?? false
  })
}

const resetChecklist = () => {
  const emptySelections = createEmptySelectionState()
  const emptyVetoStates = createEmptyVetoState()

  checklistItems.forEach((item) => {
    itemSelections[item.id] = emptySelections[item.id]
  })

  vetoItems.forEach((item) => {
    vetoStates[item.id] = emptyVetoStates[item.id]
  })

  categoryOrder.forEach((category) => {
    collapsedMap[category] = false
  })

  searchKeyword.value = ''
}

const goToHouseManager = () => {
  router.push('/houses')
}

watch(
  () => selectedHouse.value?.id ?? null,
  () => {
    restoreChecklistState()
  },
  { immediate: true }
)

watch(
  [selectedHouse, qualityScore, rentScore, finalScore, answeredItemCount, hasVeto, recommendation],
  ([
    house,
    currentQualityScore,
    currentRentScore,
    currentFinalScore,
    currentAnsweredCount,
    currentHasVeto,
    currentRecommendation
  ]) => {
    if (!house) {
      return
    }

    if (!currentHasVeto && currentAnsweredCount === 0) {
      updateHouseInspection(house.id, {
        qualityScore: null,
        rentScore: null,
        finalScore: null,
        inspectionScore: null,
        inspectionRecommendation: '',
        inspectionAnsweredCount: 0,
        inspectionSelections: createEmptySelectionState(),
        inspectionVetoStates: createEmptyVetoState()
      })
      return
    }

    updateHouseInspection(house.id, {
      qualityScore: currentQualityScore,
      rentScore: currentRentScore,
      finalScore: currentFinalScore,
      inspectionScore: currentFinalScore,
      inspectionRecommendation: currentRecommendation.label,
      inspectionAnsweredCount: currentAnsweredCount,
      inspectionSelections: { ...itemSelections },
      inspectionVetoStates: { ...vetoStates }
    })
  },
  { immediate: true }
)
</script>

<template>
  <div class="app-shell">
    <div class="app-container">
      <el-card v-if="selectedHouse" class="glass-card house-summary-card" shadow="never">
        <div class="house-summary-head">
          <div>
            <p class="eyebrow">Current House</p>
            <h2>{{ selectedHouse.name }}</h2>
            <p class="house-summary-address">{{ selectedHouse.address || '未填写地址' }}</p>
          </div>

          <el-button class="touch-button" @click="goToHouseManager">切换房屋</el-button>
        </div>

        <div class="house-summary-grid">
          <div class="house-summary-item">
            <span class="house-summary-label">月租</span>
            <strong>{{ selectedHouse.rent || '未填写' }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">目标月租</span>
            <strong>{{ selectedHouse.budget || '未填写' }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">租金分</span>
            <strong>{{ rentScore === null ? '--' : formatScore(rentScore) }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">公式</span>
            <strong>{{ formulaText }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">房东</span>
            <strong>{{ selectedHouse.landlord || '未填写' }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">联系方式</span>
            <strong>{{ selectedHouse.contact || '未填写' }}</strong>
          </div>
          <div class="house-summary-item">
            <span class="house-summary-label">备注</span>
            <strong>{{ selectedHouse.notes || '暂无备注' }}</strong>
          </div>
        </div>
      </el-card>

      <HeaderScore
        :score-display="formatScore(finalScore)"
        :score-color="scoreColor"
        :recommendation="`建议：${recommendation.label}`"
        :progress-percentage="finalScore"
        :quality-score-display="formatScore(qualityScore)"
        :rent-score-display="formatScore(rentScore)"
        :rent-summary="rentSummary"
        :formula-text="formulaText"
        :search-keyword="searchKeyword"
        :visible-item-count="visibleItemCount"
        :answered-item-count="answeredItemCount"
        :total-item-count="checklistItems.length"
        :has-veto="hasVeto"
        :all-collapsed="allCollapsed"
        @update:search-keyword="searchKeyword = $event"
        @reset="resetChecklist"
        @toggle-all="toggleAllCategories"
      />

      <el-card class="glass-card veto-card" shadow="never">
        <template #header>
          <div class="section-header">
            <div>
              <h2>一票否决</h2>
              <p>这些项目只要命中任意一项，就直接建议不要租，不再继续看总分。</p>
            </div>
            <el-tag type="danger" effect="dark">最高优先级</el-tag>
          </div>
        </template>

        <el-alert
          v-if="hasVeto"
          title="建议：不要租"
          type="error"
          show-icon
          :closable="false"
          class="veto-alert"
          description="已命中一票否决项，这类风险通常不值得继续靠价格去妥协。"
        />

        <div class="veto-grid">
          <label
            v-for="item in vetoItems"
            :key="item.id"
            class="veto-option"
          >
            <el-checkbox
              :model-value="vetoStates[item.id]"
              size="large"
              @change="toggleVeto(item.id, Boolean($event))"
            >
              <span class="veto-label">{{ item.label }}</span>
            </el-checkbox>
            <p class="veto-how">快速检查：{{ item.how }}</p>
          </label>
        </div>
      </el-card>

      <div class="content-grid">
        <section class="main-column">
          <ChecklistCard
            v-for="group in filteredGroups"
            :key="group.category"
            :category="group.category"
            :items="group.items"
            :selections="itemSelections"
            :collapsed="collapsedMap[group.category]"
            @toggle="toggleCategory"
            @update-selection="updateItemSelection"
          />

          <el-empty
            v-if="filteredGroups.length === 0"
            description="没有找到匹配的检查项，请换个关键词试试。"
            class="glass-card empty-state"
          />
        </section>

        <aside class="side-column">
          <DeductionPanel
            :entries="deductionEntries"
            :total-deduction-display="formatScore(totalDeduction)"
            :quality-score-display="formatScore(qualityScore)"
            :has-veto="hasVeto"
            :veto-labels="selectedVetoLabels"
            :answered-item-count="answeredItemCount"
            :total-item-count="checklistItems.length"
          />
        </aside>
      </div>

      <FinalResult
        :score-display="formatScore(finalScore)"
        :quality-score-display="formatScore(qualityScore)"
        :rent-score-display="formatScore(rentScore)"
        :rent-summary="rentSummary"
        :formula-text="formulaText"
        :stars="recommendation.stars"
        :label="recommendation.label"
        :description="recommendation.description"
        :tone="recommendation.tone"
      />
    </div>
  </div>
</template>
