<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'

import { checklistItems } from '../data/checklist'
import {
  createEmptyHouseForm,
  deleteHouse,
  houses,
  saveHouse,
  selectHouse,
  selectedHouseId
} from '../stores/houses'
import type { HouseRecord } from '../types'

const router = useRouter()
const dialogVisible = ref(false)
const editingId = ref<string | null>(null)
const form = reactive(createEmptyHouseForm())

const submitLabel = computed(() => (editingId.value ? '保存修改' : '添加房屋'))
const dialogTitle = computed(() => (editingId.value ? '编辑房屋' : '新增房屋'))

const resetForm = () => {
  editingId.value = null
  Object.assign(form, createEmptyHouseForm())
}

const formatScore = (value: number) => (Number.isInteger(value) ? String(value) : value.toFixed(1))

const getDisplayScore = (house: HouseRecord) => house.finalScore ?? house.inspectionScore

const getScoreTagType = (score: number | null) => {
  if (score === null) {
    return 'info'
  }

  if (score >= 85) {
    return 'success'
  }

  if (score >= 65) {
    return 'warning'
  }

  return 'danger'
}

const inspectedHouseCount = computed(
  () => houses.value.filter((house) => getDisplayScore(house) !== null).length
)

const openCreateDialog = () => {
  resetForm()
  dialogVisible.value = true
}

const closeDialog = () => {
  dialogVisible.value = false
  resetForm()
}

const normalizeHousePayload = () => ({
  name: form.name.trim(),
  address: form.address.trim(),
  rent: form.rent.trim(),
  budget: form.budget.trim(),
  waterFee: form.waterFee.trim(),
  electricFee: form.electricFee.trim(),
  internetFee: form.internetFee.trim(),
  sanitationFee: form.sanitationFee.trim(),
  propertyFee: form.propertyFee.trim(),
  landlord: form.landlord.trim(),
  contact: form.contact.trim(),
  notes: form.notes.trim()
})

const submitHouse = () => {
  const payload = normalizeHousePayload()
  const isEditing = Boolean(editingId.value)

  if (!payload.name) {
    ElMessage.warning('请先填写房屋名称')
    return
  }

  const savedHouse = editingId.value
    ? saveHouse({ id: editingId.value, ...payload })
    : saveHouse(payload)

  closeDialog()
  ElMessage.success(isEditing ? '房屋信息已更新' : '房屋已添加')

  if (houses.value.length === 1) {
    selectHouse(savedHouse.id)
  }
}

const startEditHouse = (house: HouseRecord) => {
  editingId.value = house.id
  Object.assign(form, {
    name: house.name,
    address: house.address,
    rent: house.rent,
    budget: house.budget,
    waterFee: house.waterFee,
    electricFee: house.electricFee,
    internetFee: house.internetFee,
    sanitationFee: house.sanitationFee,
    propertyFee: house.propertyFee,
    landlord: house.landlord,
    contact: house.contact,
    notes: house.notes,
    qualityScore: house.qualityScore,
    rentScore: house.rentScore,
    finalScore: house.finalScore,
    inspectionScore: house.inspectionScore,
    inspectionRecommendation: house.inspectionRecommendation,
    inspectionAnsweredCount: house.inspectionAnsweredCount
  })
  dialogVisible.value = true
}

const removeHouse = (house: HouseRecord) => {
  if (!window.confirm(`确认删除房屋“${house.name}”吗？`)) {
    return
  }

  deleteHouse(house.id)

  if (editingId.value === house.id) {
    resetForm()
  }

  ElMessage.success('房屋已删除')
}

const chooseHouse = (house: HouseRecord) => {
  selectHouse(house.id)
  router.push('/checklist')
}
</script>

<template>
  <div class="app-shell">
    <div class="app-container house-page">
      <el-card class="glass-card hero-card house-manager-hero" shadow="never">
        <div class="hero-head">
          <div class="hero-main">
            <div class="hero-title-row">
              <p class="eyebrow">House Manager</p>
              <el-tag type="primary" effect="light" round>房屋管理</el-tag>
            </div>
            <h1>房屋管理页面</h1>
            <div class="house-hero-summary">
              <el-tag type="info" effect="light" round>已记录 {{ houses.length }} 套</el-tag>
              <el-tag type="success" effect="light" round>
                已检查 {{ inspectedHouseCount }} 套
              </el-tag>
              <el-tag
                :type="selectedHouseId ? 'success' : 'warning'"
                effect="light"
                round
              >
                {{ selectedHouseId ? '已设置当前房屋' : '请选择房屋进入检查' }}
              </el-tag>
              <span class="house-hero-tip">点击房屋卡片即可快速对比和进入检查</span>
            </div>
          </div>

          <div class="house-hero-actions">
            <el-button type="primary" size="large" class="touch-button" @click="openCreateDialog">
              新增房屋
            </el-button>
            <el-button
              v-if="selectedHouseId"
              class="touch-button"
              @click="router.push('/checklist')"
            >
              查看当前房屋
            </el-button>
          </div>
        </div>
      </el-card>

      <el-card class="glass-card house-list-card" shadow="never">
        <template #header>
          <div class="section-header house-list-section-header">
            <div>
              <h2>房屋列表</h2>
              <p>直接查看分数、建议和基础信息，减少来回切换。</p>
            </div>
            <div class="house-toolbar">
              <el-tag type="info" effect="light" round>
                共 {{ houses.length }} 套
              </el-tag>
              <el-button type="primary" class="touch-button" @click="openCreateDialog">
                新增房屋
              </el-button>
            </div>
          </div>
        </template>

        <el-empty
          v-if="houses.length === 0"
          description="还没有房屋记录，点击右上角新增房屋开始整理。"
          :image-size="84"
        />

        <div v-else class="house-list">
          <div
            v-for="house in houses"
            :key="house.id"
            class="house-list-item"
            :class="{ 'is-active': selectedHouseId === house.id }"
          >
            <div class="house-list-head">
              <div class="house-list-main">
                <div class="house-list-title">
                  <h3>{{ house.name }}</h3>
                  <el-tag v-if="selectedHouseId === house.id" type="success" effect="light" round>
                    当前房屋
                  </el-tag>
                </div>
                <p>{{ house.address || '未填写地址' }}</p>

                <div class="house-list-meta">
                  <span>月租：{{ house.rent || '未填写' }}</span>
                  <span>目标月租：{{ house.budget || '未填写' }}</span>
                  <span>房东：{{ house.landlord || '未填写' }}</span>
                </div>
              </div>

              <div class="house-score-block">
                <span class="house-score-label">综合总分</span>
                <template v-if="getDisplayScore(house) !== null">
                  <strong :class="`tone-${getScoreTagType(getDisplayScore(house))}`">
                    {{ formatScore(getDisplayScore(house) ?? 0) }}
                  </strong>
                  <el-tag :type="getScoreTagType(getDisplayScore(house))" effect="light" round>
                    {{ house.inspectionRecommendation || '已检查' }}
                  </el-tag>
                  <span class="house-score-summary">
                    已处理 {{ house.inspectionAnsweredCount }}/{{  checklistItems.length }} 项
                  </span>
                  <span class="house-score-summary">
                    质量 {{ house.qualityScore === null ? '--' : formatScore(house.qualityScore) }} /
                    租金 {{ house.rentScore === null ? '--' : formatScore(house.rentScore) }}
                  </span>
                </template>
                <template v-else>
                  <strong class="house-score-empty">未检查</strong>
                  <span class="house-score-summary">进入检查页后会自动记录分数</span>
                </template>
              </div>
            </div>

            <p v-if="house.notes" class="house-list-notes">{{ house.notes }}</p>

            <div class="house-list-actions">
              <el-button type="primary" class="touch-button" @click="chooseHouse(house)">
                选择并检查
              </el-button>
              <el-button class="touch-button" @click="startEditHouse(house)">编辑</el-button>
              <el-button type="danger" plain class="touch-button" @click="removeHouse(house)">
                删除
              </el-button>
            </div>
          </div>
        </div>
      </el-card>

      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="min(560px, calc(100vw - 24px))"
        destroy-on-close
        class="house-dialog"
        @closed="resetForm"
      >
        <el-form label-position="top" class="house-form">
          <el-form-item label="房屋名称">
            <el-input v-model="form.name" placeholder="例如：静安一居室" clearable />
          </el-form-item>

          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="填写详细地址或小区名称" clearable />
          </el-form-item>

          <div class="house-form-split">
            <el-form-item label="月租">
              <el-input v-model="form.rent" placeholder="例如：4500 元/月" clearable />
            </el-form-item>

            <el-form-item label="预算上限">
              <el-input v-model="form.budget" placeholder="例如：5000 元/月" clearable />
            </el-form-item>
          </div>

          <div class="house-form-split">
            <el-form-item label="水费">
              <el-input v-model="form.waterFee" placeholder="例如：80" clearable />
            </el-form-item>
            <el-form-item label="电费">
              <el-input v-model="form.electricFee" placeholder="例如：150" clearable />
            </el-form-item>
          </div>

          <div class="house-form-split">
            <el-form-item label="网费">
              <el-input v-model="form.internetFee" placeholder="例如：50" clearable />
            </el-form-item>
            <el-form-item label="卫生费">
              <el-input v-model="form.sanitationFee" placeholder="例如：30" clearable />
            </el-form-item>
          </div>

          <div class="house-form-split">
            <el-form-item label="物业费">
              <el-input v-model="form.propertyFee" placeholder="例如：100" clearable />
            </el-form-item>
            <el-form-item label="房东">
              <el-input v-model="form.landlord" placeholder="填写房东姓名" clearable />
            </el-form-item>
          </div>

          <el-form-item label="联系方式">
            <el-input v-model="form.contact" placeholder="电话 / 微信 / 中介联系方式" clearable />
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="4"
              placeholder="补充你想记录的说明，例如朝向、付款方式、看房时间等"
            />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="house-form-actions">
            <el-button class="touch-button" @click="closeDialog">取消</el-button>
            <el-button type="primary" class="touch-button" @click="submitHouse">
              {{ submitLabel }}
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>
