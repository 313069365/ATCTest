<template>
  <BottomSheet :visible="visible" title="导入题库" @close="$emit('close')">
    <section class="import-section">
      <div class="import-info">
        <h3>导入方式</h3>
        <p>支持从JSON文件导入题库数据</p>
      </div>

      <div class="file-upload">
        <input type="file" ref="fileInput" accept=".json" @change="handleFileChange" class="file-input" />
        <button class="upload-btn" @click="triggerFileInput">
          <Icon name="upload-file-outline" />
          <span>选择文件</span>
        </button>
        <p v-if="selectedFile" class="file-name">{{ selectedFile.name }}</p>
      </div>

      <div class="import-tips">
        <h4>文件格式要求</h4>
        <ul>
          <li>JSON格式文件</li>
          <li>包含题目数组</li>
          <li>每个题目需包含：id, subject, category, type, difficulty, content, options, correctAnswer, explanation</li>
        </ul>
      </div>
    </section>

    <template #footer>
      <button class="import-btn" @click="importQuestions" :disabled="!selectedFile || loading">
        {{ loading ? '导入中...' : '开始导入' }}
        <Icon name="send-outline" />
      </button>
    </template>
  </BottomSheet>
</template>

<script setup>
import { ref } from 'vue'
import Icon from '@/presentation/components/ui/Icon.vue'
import BottomSheet from '@/presentation/components/ui/BottomSheet.vue'

const fileInput = ref(null)
const selectedFile = ref(null)
const loading = ref(false)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const importQuestions = async () => {
  // TODO: 实现导入逻辑
}

defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

defineEmits(['close'])
</script>

<style scoped>
.import-section {
  max-width: var(--app-max-width);
}

.import-info {
  margin-bottom: var(--spacing-lg);
}

.import-info h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.import-info p {
  font-size: var(--font-size-md);
  color: var(--text-secondary);
}

.file-upload {
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.file-input {
  display: none;
}

.upload-btn {
  width: 100%;
  padding: var(--spacing-lg);
  border: 2px dashed var(--border-color-strong);
  border-radius: var(--radius-lg);
  background: var(--background);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  transition: all 0.2s;
}

.upload-btn:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.upload-btn svg {
  font-size: 48px;
  color: var(--text-secondary);
}

.upload-btn span:last-child {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.file-name {
  margin-top: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.import-tips {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  border: 1px solid var(--border-color-light);
}

.import-tips h4 {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-sm);
}

.import-tips ul {
  list-style: none;
  padding: 0;
}

.import-tips li {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  padding-left: var(--spacing-md);
  position: relative;
}

.import-tips li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: bold;
}

.import-btn {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-gradient-end) 100%);
  color: #fff;
  border: none;
  border-radius: var(--radius-full);
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 91, 191, 0.3);
  transition: all 0.2s;
}

.import-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.import-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 91, 191, 0.4);
}
</style>
