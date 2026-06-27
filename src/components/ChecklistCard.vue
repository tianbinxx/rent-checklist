<script setup lang="ts">
import {
  CircleCheckFilled,
  QuestionFilled,
  RemoveFilled,
  WarningFilled
} from '@element-plus/icons-vue'
import { computed } from 'vue'

import type { ChecklistItem, SelectionValue } from '../types'

const props = defineProps<{
  category: string
  items: ChecklistItem[]
  selections: Record<string, SelectionValue>
  collapsed: boolean
}>()

const emit = defineEmits<{
  toggle: [category: string]
  'update-selection': [payload: { id: string; value: SelectionValue }]
}>()

const formatScore = (value?: number) => {
  const absolute = Math.abs(value ?? 0)

  if (Number.isInteger(absolute)) {
    return String(absolute)
  }

  return absolute.toFixed(1)
}

const activeCount = computed(
  () => props.items.filter((item) => props.selections[item.id] !== null).length
)

const compactOptionMeta = {
  normal: {
    label: '正常',
    icon: CircleCheckFilled
  },
  problem: {
    label: '问题',
    icon: WarningFilled
  },
  uncheckable: {
    label: '待查',
    icon: QuestionFilled
  },
  missing: {
    label: '缺失',
    icon: RemoveFilled
  }
} as const

const getOptionList = (item: ChecklistItem) => {
  const options =
    item.kind === 'choice'
      ? item.options.map((option) => ({
          value: option.value,
          label: option.label,
          description: option.description,
          score: option.score
        }))
      : [
          {
            value: 'normal',
            label: '正常',
            description: '现场检查无明显问题',
            score: 0
          },
          {
            value: 'problem',
            label: '存在问题',
            description: `扣 ${formatScore(item.score)} 分`,
            score: item.score
          }
        ]

  options.push({
    value: 'uncheckable',
    label: '无法检查',
    description: `风险扣 ${formatScore(item.uncheckableScore ?? -1)} 分`,
    score: item.uncheckableScore ?? -1
  })

  if (item.supportsMissing) {
    options.push({
      value: 'missing',
      label: '物品缺失',
      description: `缺失扣 ${formatScore(item.missingScore)} 分`,
      score: item.missingScore ?? 0
    })
  }

  return options
}

const getScoreSummary = (item: ChecklistItem) => {
  const segments = [`问题 -${formatScore(item.kind === 'status' ? item.score : 0)}`]

  if (item.kind === 'choice') {
    const riskOption = [...item.options]
      .sort((left, right) => Math.abs(right.score) - Math.abs(left.score))
      .find((option) => option.score < 0)

    if (riskOption) {
      segments[0] = `最高扣分 -${formatScore(riskOption.score)}`
    }
  }

  if (item.uncheckableScore) {
    segments.push(`无法检查 -${formatScore(item.uncheckableScore)}`)
  }

  if (item.supportsMissing && item.missingScore) {
    segments.push(`缺失 -${formatScore(item.missingScore)}`)
  }

  return segments
}

const getCompactButtonMeta = (item: ChecklistItem, value: string) => {
  if (!(value in compactOptionMeta)) {
    return null
  }

  if (item.kind === 'choice' && value !== 'uncheckable' && value !== 'missing') {
    return null
  }

  return compactOptionMeta[value as keyof typeof compactOptionMeta]
}
</script>

<template>
  <el-card class="glass-card checklist-card" shadow="never">
    <template #header>
      <div class="section-header">
        <div>
          <h2>{{ props.category }}</h2>
          <p>共 {{ props.items.length }} 项，已处理 {{ activeCount }} 项</p>
        </div>

        <div class="card-header-actions">
          <el-tag v-if="activeCount > 0" type="warning" effect="light" round>
            已处理 {{ activeCount }}
          </el-tag>
          <el-button class="touch-button header-toggle-button" @click="emit('toggle', props.category)">
            {{ props.collapsed ? '展开' : '收起' }}
          </el-button>
        </div>
      </div>
    </template>

    <el-collapse-transition>
      <div v-show="!props.collapsed" class="checklist-items">
        <div
          v-for="item in props.items"
          :key="item.id"
          class="checklist-row"
        >
          <div class="item-meta">
            <div class="item-title-row">
              <h3>{{ item.title }}</h3>
              <el-tag size="small" effect="plain" round>
                {{ item.kind === 'choice' ? '多选项判断' : '标准判断' }}
              </el-tag>
            </div>

            <div class="item-scoring">
              <span
                v-for="segment in getScoreSummary(item)"
                :key="segment"
              >
                {{ segment }}
              </span>
            </div>

            <div class="item-guide">
              <p><strong>How：</strong>{{ item.how }}</p>
              <p v-if="item.why"><strong>Why：</strong>{{ item.why }}</p>
            </div>

            <div v-if="item.brandReferences?.length" class="brand-reference">
              <span class="brand-title">常见品牌参考：</span>
              <div class="brand-tags">
                <el-tag
                  v-for="brand in item.brandReferences"
                  :key="brand"
                  size="small"
                  effect="light"
                  round
                >
                  {{ brand }}
                </el-tag>
              </div>
              <p class="brand-tip">如果品牌不认识，建议现场搜索，或者默认降低可信度。</p>
            </div>
          </div>

          <div class="item-actions">
            <el-radio-group
              :model-value="props.selections[item.id]"
              size="large"
              class="status-group touch-segment-group"
              @change="emit('update-selection', { id: item.id, value: $event as SelectionValue })"
            >
              <el-radio-button
                v-for="option in getOptionList(item)"
                :key="option.value"
                :label="option.value"
              >
                <span
                  v-if="getCompactButtonMeta(item, option.value)"
                  class="status-option-content"
                >
                  <el-icon class="status-option-icon">
                    <component :is="getCompactButtonMeta(item, option.value)?.icon" />
                  </el-icon>
                  <span class="status-option-text">
                    {{ getCompactButtonMeta(item, option.value)?.label }}
                  </span>
                </span>
                <template v-else>
                  {{ option.label }}
                </template>
              </el-radio-button>
            </el-radio-group>

            <div class="choice-descriptions">
              <div
                v-for="option in getOptionList(item)"
                :key="`${item.id}-${option.value}`"
                class="choice-description"
              >
                <span class="choice-label">{{ option.label }}</span>
                <span>{{ option.description }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-collapse-transition>
  </el-card>
</template>
