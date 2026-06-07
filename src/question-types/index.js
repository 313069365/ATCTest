const registry = {}

export function registerType(type, definition) {
  registry[type] = { ...definition, type }
}

export function getStrategy(type) {
  return registry[type] || null
}

export function hasStrategy(type) {
  return type in registry
}

export function getRegisteredTypes() {
  return Object.keys(registry)
}

import single from './single'
import multiple from './multiple'
import boolean from './boolean'
import fillin from './fillin'
import essay from './essay'
import reading from './reading'
import media from './media'

registerType('single', single)
registerType('multiple', multiple)
registerType('boolean', boolean)
registerType('fillin', fillin)
registerType('essay', essay)
registerType('translation', essay)
registerType('reading', reading)
registerType('media', media)
