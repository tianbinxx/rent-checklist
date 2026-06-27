<script setup lang="ts">
import type { DeductionEntry } from '../types'

defineProps<{
  entries: DeductionEntry[]
  totalDeductionDisplay: string
  qualityScoreDisplay: string
  hasVeto: boolean
  vetoLabels: string[]
  answeredItemCount: number
  totalItemCount: number
}>()
</script>

<template>
  <el-card class="glass-card detail-card" shadow="never">
    <template #header>
      <div class="section-header">
        <div>
          <h2>扣分明细</h2>
          <p>所有扣分、风险项和质量分都会随着选择实时更新。</p>
        </div>
        <div>
          <el-tag type="danger" effect="light" round>
            总扣分 {{ totalDeductionDisplay }}
          </el-tag>
          <el-tag type="warning" effect="light" round>
            质量分 {{ qualityScoreDisplay }}
          </el-tag>
        </div>
      </div>
    </template>

    <div class="panel-stats">
      <span>已处理 {{ answeredItemCount }}/{{ totalItemCount }}</span>
      <span>已扣分项目 {{ entries.length }}</span>
    </div>

    <el-alert
      v-if="hasVeto"
      title="已触发一票否决"
      type="error"
      show-icon
      :closable="false"
      class="panel-alert"
      description="即使扣分不高，也不建议继续租住这套房。"
    />

    <div v-if="hasVeto" class="veto-summary">
      <p class="summary-title">命中项</p>
      <div class="summary-tags">
        <el-tag
          v-for="label in vetoLabels"
          :key="label"
          type="danger"
          effect="light"
          round
        >
          {{ label }}
        </el-tag>
      </div>
    </div>

    <el-empty
      v-if="entries.length === 0"
      description="当前还没有扣分项，继续逐项检查。"
      :image-size="72"
    />

    <div v-else class="deduction-list">
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="deduction-row"
      >
        <div>
          <p class="deduction-title">
            {{ entry.category }} / {{ entry.title }}
          </p>
          <span class="deduction-status">{{ entry.selectedLabel }}</span>
          <p class="deduction-how">How：{{ entry.how }}</p>
          <p v-if="entry.why" class="deduction-why">Why：{{ entry.why }}</p>
        </div>
        <strong>{{ entry.isVeto ? '否决' : `-${entry.deduction}` }}</strong>
      </div>
    </div>
  </el-card>
</template>
