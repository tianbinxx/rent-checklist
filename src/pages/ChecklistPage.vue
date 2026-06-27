<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import { baseScore, checklistItems, vetoItems } from '../data/checklist'
import ChecklistCard from '../components/ChecklistCard.vue'
import DeductionPanel from '../components/DeductionPanel.vue'
import FinalResult from '../components/FinalResult.vue'
import HeaderScore from '../components/HeaderScore.vue'
import { selectedHouse, updateHouseInspection } from '../stores/houses'
import type {
  ChecklistItem,
  DeductionEntry,
  ScoreTone,
  SelectionValue
} from '../types'

const router = useRouter()
const searchKeyword = ref('')

const itemSelections = reactive<Record<string, SelectionValue>>(
  Object.fromEntries(checklistItems.map((item) => [item.id, null]))
) as Record<string, SelectionValue>

const vetoStates = reactive<Record<string, boolean>>(
  Object.fromEntries(vetoItems.map((item) => [item.id, false]))
) as Record<string, boolean>

const categoryOrder = [...new Set(checklistItems.map((item) => item.category))]

const collapsedMap = reactive<Record<string, boolean>>(
  Object.fromEntries(categoryOrder.map((category) => [category, false]))
) as Record<string, boolean>

const normalizeText = (value: string) => value.trim().toLowerCase()

const getAbsoluteScore = (value?: number) => Math.abs(value ?? 0)

const formatScore = (value: number) => {
  if (Number.isInteger(value)) {
    return String(value)
  }

  return value.toFixed(1)
}

const getSelectionLabel = (item: ChecklistItem, selection: SelectionValue) => {
  if (selection === 'normal') {
    return '正常'
  }

  if (selection === 'problem') {
    return '存在问题'
  }

  if (selection === 'uncheckable') {
    return '无法检查'
  }

  if (selection === 'missing') {
    return '物品缺失'
  }

  if (item.kind === 'choice') {
    return item.options.find((option) => option.value === selection)?.label ?? '已选择'
  }

  return '未处理'
}

const getDeductionForSelection = (item: ChecklistItem, selection: SelectionValue) => {
  if (!selection || selection === 'normal') {
    return 0
  }

  if (selection === 'problem') {
    return getAbsoluteScore(item.kind === 'status' ? item.score : 0)
  }

  if (selection === 'uncheckable') {
    return getAbsoluteScore(item.uncheckableScore)
  }

  if (selection === 'missing') {
    return item.supportsMissing ? getAbsoluteScore(item.missingScore) : 0
  }

  if (item.kind === 'choice') {
    return getAbsoluteScore(
      item.options.find((option) => option.value === selection)?.score
    )
  }

  return 0
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

const selectedVetoItems = computed(() => vetoItems.filter((item) => vetoStates[item.id]))

const selectedVetoLabels = computed(() => selectedVetoItems.value.map((item) => item.label))

const hasVeto = computed(() => selectedVetoItems.value.length > 0)

const deductionEntries = computed<DeductionEntry[]>(() =>
  checklistItems
    .map((item) => {
      const selection = itemSelections[item.id]
      const deduction = getDeductionForSelection(item, selection)

      if (!selection || deduction === 0) {
        return null
      }

      return {
        id: item.id,
        category: item.category,
        title: item.title,
        selectedLabel: getSelectionLabel(item, selection),
        deduction,
        how: item.how,
        why: item.why
      }
    })
    .filter((entry): entry is DeductionEntry => entry !== null)
)

const totalDeduction = computed(() =>
  deductionEntries.value.reduce((sum, entry) => sum + entry.deduction, 0)
)

const score = computed(() => {
  if (hasVeto.value) {
    return 0
  }

  return Math.max(0, baseScore - totalDeduction.value)
})

const scoreColor = computed<ScoreTone>(() => {
  if (score.value >= 90) {
    return 'success'
  }

  if (score.value >= 70) {
    return 'warning'
  }

  return 'danger'
})

const recommendation = computed(() => {
  if (hasVeto.value || score.value < 50) {
    return {
      stars: '★☆☆☆☆',
      label: '不要租',
      description: '一票否决或高风险问题已出现，继续考虑的意义不大。',
      tone: 'danger' as const
    }
  }

  if (score.value >= 92) {
    return {
      stars: '★★★★★',
      label: '推荐租',
      description: '整体状态较稳，关键功能和基础条件都比较可靠。',
      tone: 'success' as const
    }
  }

  if (score.value >= 80) {
    return {
      stars: '★★★★☆',
      label: '可以考虑',
      description: '有少量风险点，但仍在可接受范围内。',
      tone: 'success' as const
    }
  }

  if (score.value >= 65) {
    return {
      stars: '★★★☆☆',
      label: '谨慎考虑',
      description: '问题已经开始累积，建议结合价格和地段谨慎判断。',
      tone: 'warning' as const
    }
  }

  return {
    stars: '★★☆☆☆',
    label: '不推荐',
    description: '扣分较多，后续使用成本和沟通成本可能都不低。',
    tone: 'danger' as const
  }
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

const resetChecklist = () => {
  checklistItems.forEach((item) => {
    itemSelections[item.id] = null
  })

  vetoItems.forEach((item) => {
    vetoStates[item.id] = false
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
  [selectedHouse, score, answeredItemCount, hasVeto, recommendation],
  ([house, currentScore, currentAnsweredCount, currentHasVeto, currentRecommendation]) => {
    if (!house) {
      return
    }

    if (!currentHasVeto && currentAnsweredCount === 0) {
      updateHouseInspection(house.id, {
        inspectionScore: null,
        inspectionRecommendation: '',
        inspectionAnsweredCount: 0
      })
      return
    }

    updateHouseInspection(house.id, {
      inspectionScore: currentScore,
      inspectionRecommendation: currentHasVeto ? '不要租' : currentRecommendation.label,
      inspectionAnsweredCount: currentAnsweredCount
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
        :score-display="formatScore(score)"
        :score-color="scoreColor"
        :recommendation="hasVeto ? '建议：不要租' : recommendation.label"
        :progress-percentage="score"
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
            :has-veto="hasVeto"
            :veto-labels="selectedVetoLabels"
            :answered-item-count="answeredItemCount"
            :total-item-count="checklistItems.length"
          />
        </aside>
      </div>

      <FinalResult
        :score-display="formatScore(score)"
        :stars="recommendation.stars"
        :label="recommendation.label"
        :description="recommendation.description"
        :tone="recommendation.tone"
      />
    </div>
  </div>
</template>
