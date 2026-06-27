<script setup lang="ts">
defineProps<{
  scoreDisplay: string
  qualityScoreDisplay: string
  rentScoreDisplay: string
  rentSummary: string
  formulaText: string
  stars: string
  label: string
  description: string
  tone: 'success' | 'warning' | 'danger'
}>()
</script>

<template>
  <el-card class="glass-card final-card" shadow="never">
    <div class="final-result">
      <div>
        <p class="eyebrow">Final Result</p>
        <h2>最终得分</h2>
      </div>

      <div class="final-score-block">
        <strong :class="`tone-${tone}`">{{ scoreDisplay }}</strong>
        <span>{{ stars }}</span>
      </div>
    </div>

    <div class="final-meta">
      <el-tag :type="tone" effect="light" round size="large">
        {{ label }}
      </el-tag>
      <p>{{ description }}</p>
      <p>看房质量：{{ qualityScoreDisplay }} 分</p>
      <p>租金分：{{ rentScoreDisplay }} 分</p>
      <p>{{ rentSummary }}</p>
      <p>{{ formulaText }}</p>
    </div>
  </el-card>
</template>
