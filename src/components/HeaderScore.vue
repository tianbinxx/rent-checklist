<script setup lang="ts">
import { Search } from '@element-plus/icons-vue'

const props = defineProps<{
  scoreDisplay: string
  scoreColor: 'success' | 'warning' | 'danger'
  recommendation: string
  progressPercentage: number
  searchKeyword: string
  visibleItemCount: number
  answeredItemCount: number
  totalItemCount: number
  hasVeto: boolean
  allCollapsed: boolean
}>()

const emit = defineEmits<{
  'update:search-keyword': [value: string]
  reset: []
  'toggle-all': []
}>()

const scoreLabelMap = {
  success: 'green',
  warning: 'orange',
  danger: 'red'
} as const

const handleSearchInput = (value: string | number) => {
  emit('update:search-keyword', String(value))
}
</script>

<template>
  <el-card class="glass-card hero-card" shadow="never">
    <div class="hero-head">
      <div class="hero-main">
        <div class="hero-title-row">
          <p class="eyebrow">Rental Inspection</p>
          <el-tag :type="props.scoreColor" effect="light" round>
            {{ scoreLabelMap[props.scoreColor] }}
          </el-tag>
        </div>
        <h1>租房检查 Checklist</h1>
        <p class="hero-description">
          按照检查项逐项核验，实时得出扣分、建议与最终结论。
        </p>
      </div>

      <div class="hero-score-panel">
        <span class="hero-score-label">当前得分</span>
        <strong class="hero-score-value">{{ props.scoreDisplay }}分</strong>
        <span
          class="hero-score-hint"
          :class="`is-${props.scoreColor}`"
        >
          {{ props.recommendation }}
        </span>
      </div>
    </div>

    <el-progress
      :percentage="props.progressPercentage"
      :status="props.hasVeto ? 'exception' : undefined"
      :stroke-width="14"
      :show-text="false"
      striped
      striped-flow
      class="score-progress"
      :color="
        props.scoreColor === 'success'
          ? '#22c55e'
          : props.scoreColor === 'warning'
            ? '#f59e0b'
            : '#ef4444'
      "
    />

    <div class="progress-labels">
      <span>100</span>
      <span>90</span>
      <span>85</span>
      <span>72</span>
      <span>60</span>
      <span>{{ props.scoreDisplay }}</span>
    </div>

    <div class="toolbar">
      <el-input
        :model-value="props.searchKeyword"
        placeholder="搜索检查项，例如：空调 / 合同 / 厨房"
        clearable
        size="large"
        class="search-input touch-input"
        @input="handleSearchInput"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <div class="toolbar-actions">
        <el-button size="large" class="touch-button" @click="emit('toggle-all')">
          {{ props.allCollapsed ? '全部展开' : '全部收起' }}
        </el-button>
        <el-button size="large" type="primary" plain class="touch-button" @click="emit('reset')">重置</el-button>
      </div>
    </div>

    <div class="hero-footer">
      <span>当前可见 {{ props.visibleItemCount }} 项，已处理 {{ props.answeredItemCount }}/{{ props.totalItemCount }}</span>
      <span>状态切换后实时计算，无需手动提交</span>
    </div>
  </el-card>
</template>
