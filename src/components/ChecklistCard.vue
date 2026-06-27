<script setup lang="ts">
import {
  CircleCheckFilled,
  CircleCloseFilled,
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
  minor: {
    label: '轻问题',
    icon: WarningFilled
  },
  major: {
    label: '大问题',
    icon: CircleCloseFilled
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
          factor: option.factor
        }))
      : [
          {
            value: 'normal',
            label: '完全正常',
            description: `保留权重 ${formatScore(item.weight)} 分`,
            factor: 1
          },
          {
            value: 'minor',
            label: '有一定问题',
            description: `保留 ${formatScore(item.weight * 0.7)} / ${formatScore(item.weight)} 分`,
            factor: 0.7
          },
          {
            value: 'major',
            label: '有很大问题',
            description: `保留 ${formatScore(item.weight * 0.3)} / ${formatScore(item.weight)} 分`,
            factor: 0.3
          },
          {
            value: 'missing',
            label: '缺失',
            description: `该项得分 0 / ${formatScore(item.weight)} 分`,
            factor: 0
          }
        ]

  return options
}

const getScoreSummary = (item: ChecklistItem) => {
  const segments = [`权重 ${formatScore(item.weight)} 分`]

  if (item.kind === 'status') {
    segments.push(`轻问题保留 70%`)
    segments.push(`大问题保留 30%`)
    segments.push(`缺失记 0 分`)
  } else {
    const factorSummary = item.options
      .map((option) => `${option.label} ${formatScore(option.factor * 100)}%`)
      .join(' / ')
    segments.push(factorSummary)
  }

  return segments
}

const getCompactButtonMeta = (item: ChecklistItem, value: string) => {
  if (!(value in compactOptionMeta)) {
    return null
  }

  if (item.kind === 'choice') {
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
