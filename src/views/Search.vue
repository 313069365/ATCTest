<template>
  <div class="page search-page">
    <header class="top-bar">
      <button class="icon-btn" @click="goBack">
        <span class="material-symbols-outlined">arrow_back</span>
      </button>
      <h1 class="title">{{ t('search') }}</h1>
      <button v-if="keyword" class="header-action" @click="clearSearch">
        {{ t('searchClear') }}
      </button>
      <div v-else class="header-action-placeholder"></div>
    </header>

    <div class="search-input-container">
      <div class="search-input-wrap">
        <span class="material-symbols-outlined search-input-icon">search</span>
        <input
          ref="inputRef"
          v-model="keyword"
          class="search-input"
          :placeholder="t('searchPlaceholder')"
          @input="onDebouncedSearch"
        />
        <button v-if="keyword" class="input-clear-btn" @click="clearSearch">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>

    <div class="filters">
      <div class="filter-section" @click="filtersExpanded = !filtersExpanded">
        <span class="filter-section-label">{{ t('searchScope') }}</span>
        <span class="material-symbols-outlined filter-arrow" :class="{ expanded: filtersExpanded }">
          expand_more
        </span>
      </div>

      <template v-if="filtersExpanded">
        <div class="filter-group">
          <span class="filter-label">{{ t('questionBank') }}</span>
          <div class="chip-row">
            <button class="chip" :class="{ active: !selectedCategory }" @click="selectCategory('')">
              {{ t('selectAll') }}
            </button>
            <button v-for="cat in categories" :key="cat" class="chip"
              :class="{ active: selectedCategory === cat }"
              @click="selectCategory(cat)">
              {{ t(cat) }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">{{ t('scope') }}</span>
          <div class="chip-row">
            <button class="chip" :class="{ active: !selectedScope }" @click="selectScope('')">
              {{ t('selectAll') }}
            </button>
            <button v-for="s in availableScopes" :key="s" class="chip"
              :class="{ active: selectedScope === s }"
              @click="selectScope(s)">
              {{ t(s) }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">{{ t('subject') }}</span>
          <div class="chip-row">
            <button class="chip" :class="{ active: !selectedSubject }" @click="selectSubject('')">
              {{ t('selectAll') }}
            </button>
            <button v-for="s in availableSubjects" :key="s" class="chip"
              :class="{ active: selectedSubject === s }"
              @click="selectSubject(s)">
              {{ t(s) }}
            </button>
          </div>
        </div>

        <div class="filter-group">
          <span class="filter-label">{{ t('searchFields') }}</span>
          <div class="chip-row">
            <button class="chip" :class="{ active: allFieldsSelected }" @click="toggleAllFields">
              {{ t('selectAll') }}
            </button>
            <button class="chip" :class="{ active: searchFields.id }" @click="toggleField('id')">
              {{ t('fieldId') }}
            </button>
            <button class="chip" :class="{ active: searchFields.stem }" @click="toggleField('stem')">
              {{ t('fieldStem') }}
            </button>
            <button class="chip" :class="{ active: searchFields.options }" @click="toggleField('options')">
              {{ t('fieldOption') }}
            </button>
          </div>
        </div>
      </template>
    </div>

    <div class="results" v-if="keyword && !initial">
      <div class="results-header">
        <span class="results-count">{{ t('searchResults') }} ({{ results.length }})</span>
      </div>
      <div v-if="results.length === 0 && !searching" class="results-status">
        <span class="material-symbols-outlined results-status-icon">search_off</span>
        <span>{{ t('searchNoResults') }}</span>
      </div>
      <div v-if="searching" class="results-status">
        <span class="material-symbols-outlined results-status-icon">hourglass_top</span>
        <span>{{ t('loadingQuestions') }}</span>
      </div>
      <div v-else-if="results.length > 0" class="result-list">
        <div v-for="(q, idx) in results" :key="q.id + idx" class="result-card" @click="goToQuestion(q)">
          <div class="result-top">
            <span class="result-id">#{{ q.id }}</span>
            <span class="result-scope-tag">{{ t(q.meta?.category) }} / {{ t(q.meta?.scope) }}</span>
          </div>
          <div class="result-stem" v-html="highlightText(q.stem)"></div>
          <div class="result-bottom">
            <span class="result-subject-tag">{{ t(q.meta?.subject) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!keyword" class="results-placeholder">
      <span class="material-symbols-outlined placeholder-icon">search</span>
      <p class="placeholder-text">{{ t('searchPlaceholder') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/store'
import { t } from '@/utils/i18n.js'
import * as API from '@/api/dataSource'

const router = useRouter()
const store = useAppStore()

const inputRef = ref(null)
const keyword = ref('')
const results = ref([])
const searching = ref(false)
const initial = ref(true)
const filtersExpanded = ref(false)

let debounceTimer = null

const selectedCategory = ref('')
const selectedScope = ref('')
const selectedSubject = ref('')

const searchFields = reactive({
  id: true,
  stem: true,
  options: true,
})

const bankMeta = computed(() => store.bankMeta)

const categories = computed(() => Object.keys(bankMeta.value))

const availableScopes = computed(() => {
  if (!selectedCategory.value) {
    const scopes = new Set()
    Object.values(bankMeta.value).forEach((cat) => {
      cat.scopes?.forEach((s) => scopes.add(s))
    })
    return [...scopes]
  }
  return bankMeta.value[selectedCategory.value]?.scopes || []
})

const availableSubjects = computed(() => {
  const cat = selectedCategory.value
  const scope = selectedScope.value
  if (!cat) {
    const subjects = new Set()
    Object.values(bankMeta.value).forEach((c) => {
      Object.keys(c.subjects || {}).forEach((s) => subjects.add(s))
    })
    return [...subjects]
  }
  const subjects = bankMeta.value[cat]?.subjects || {}
  if (!scope) return Object.keys(subjects)
  return Object.entries(subjects)
    .filter(([, v]) => v.scope === scope)
    .map(([k]) => k)
})

const allFieldsSelected = computed(() => searchFields.id && searchFields.stem && searchFields.options)

function selectCategory(cat) {
  selectedCategory.value = cat
  selectedScope.value = ''
  selectedSubject.value = ''
  doSearch()
}

function selectScope(s) {
  selectedScope.value = s
  selectedSubject.value = ''
  doSearch()
}

function selectSubject(s) {
  selectedSubject.value = s
  doSearch()
}

function toggleField(field) {
  const count = [searchFields.id, searchFields.stem, searchFields.options].filter(Boolean).length
  if (count === 1 && searchFields[field]) return
  searchFields[field] = !searchFields[field]
  doSearch()
}

function toggleAllFields() {
  const all = allFieldsSelected.value
  searchFields.id = !all
  searchFields.stem = !all
  searchFields.options = !all
  doSearch()
}

function onDebouncedSearch() {
  initial.value = false
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(doSearch, 300)
}

function getActiveFields() {
  const fields = []
  if (searchFields.id) fields.push('id')
  if (searchFields.stem) fields.push('stem')
  if (searchFields.options) fields.push('options')
  return fields
}

function doSearch() {
  if (!keyword.value?.trim()) {
    results.value = []
    return
  }
  searching.value = true
  setTimeout(() => {
    try {
      results.value = API.searchQuestions({
        keyword: keyword.value,
        fields: getActiveFields(),
        category: selectedCategory.value || undefined,
        scope: selectedScope.value || undefined,
        subject: selectedSubject.value || undefined,
      })
    } catch (e) {
      console.error('Search error:', e)
      results.value = []
    } finally {
      searching.value = false
    }
  }, 0)
}

function highlightText(text) {
  if (!text) return ''
  const kw = keyword.value?.trim()
  if (!kw) return text
  const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  return text.replace(regex, '<mark class="highlight">$1</mark>')
}

function goToQuestion(q) {
  router.push(`/question/${q.id}?keyword=${encodeURIComponent(keyword.value)}`)
}

function goBack() {
  router.back()
}

function clearSearch() {
  keyword.value = ''
  results.value = []
  searching.value = false
  initial.value = true
  nextTick(() => {
    inputRef.value?.focus()
  })
}

onMounted(async () => {
  if (Object.keys(store.bankMeta).length === 0) {
    await store.loadBankMeta()
  }
  nextTick(() => {
    inputRef.value?.focus()
  })
})
</script>

<style scoped>
.search-page {
  background: var(--color-gray-100);
  min-height: 100vh;
  max-width: var(--app-max-width);
  margin: 0 auto;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--background);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  height: 56px;
  border-bottom: 1px solid var(--border-color);
  box-sizing: border-box;
}

.title {
  font-size: var(--font-size-xl);
  font-weight: 700;
  color: var(--text-primary);
}

.icon-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
}

.icon-btn:active {
  background: var(--color-gray-400);
}

.header-action {
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  background: transparent;
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary);
  cursor: pointer;
  border-radius: var(--radius-md);
}

.header-action:active {
  background: var(--color-gray-400);
}

.header-action-placeholder {
  width: 60px;
}

.search-input-container {
  padding: var(--spacing-sm) var(--spacing-lg);
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: 0 var(--spacing-md);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.search-input-wrap:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.search-input-icon {
  color: var(--text-secondary);
  font-size: 20px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: var(--font-size-md);
  color: var(--text-primary);
  padding: var(--spacing-md) 0;
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-disabled);
}

.input-clear-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--color-gray-300);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  color: var(--text-secondary);
}

.input-clear-btn .material-symbols-outlined {
  font-size: 16px;
}

.filters {
  padding: 0 var(--spacing-lg) var(--spacing-sm);
}

.filter-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  cursor: pointer;
}

.filter-section-label {
  font-size: var(--font-size-sm);
  font-weight: 700;
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.filter-arrow {
  font-size: 20px;
  color: var(--text-secondary);
  transition: transform var(--transition-fast);
}

.filter-arrow.expanded {
  transform: rotate(180deg);
}

.filter-group {
  padding: var(--spacing-sm) 0;
}

.filter-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.chip {
  padding: var(--spacing-mn) var(--spacing-md);
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color-strong);
  background: var(--background);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.chip:active {
  transform: scale(0.96);
}

.chip.active {
  background: var(--primary);
  color: var(--on-primary);
  border-color: var(--primary);
}

.results {
  padding: 0 var(--spacing-lg) var(--spacing-lg);
  flex: 1;
}

.results-header {
  padding: var(--spacing-sm) 0;
}

.results-count {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
}

.results-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) 0;
  gap: var(--spacing-md);
  color: var(--text-secondary);
  font-size: var(--font-size-md);
}

.results-status-icon {
  font-size: 48px;
  color: var(--text-disabled);
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.result-card {
  background: var(--background);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: box-shadow var(--transition-fast);
}

.result-card:active {
  box-shadow: var(--shadow-md);
}

.result-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.result-id {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-disabled);
  font-family: monospace;
}

.result-scope-tag {
  font-size: var(--font-size-mn);
  padding: 2px 8px;
  background: var(--color-gray-200);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
}

.result-stem {
  font-size: var(--font-size-md);
  line-height: var(--line-height-relaxed);
  color: var(--text-primary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-all;
}

.result-stem :deep(.highlight) {
  background: var(--secondary-light);
  color: var(--text-primary);
  border-radius: 2px;
  padding: 0 2px;
}

.result-bottom {
  margin-top: var(--spacing-sm);
}

.result-subject-tag {
  font-size: var(--font-size-mn);
  padding: 2px 8px;
  background: var(--primary-light);
  border-radius: var(--radius-full);
  color: var(--primary);
  font-weight: 500;
}

.results-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-2xl) 0;
  gap: var(--spacing-md);
  color: var(--text-secondary);
}

.placeholder-icon {
  font-size: 64px;
  color: var(--text-disabled);
}

.placeholder-text {
  font-size: var(--font-size-md);
  color: var(--text-disabled);
}
</style>
