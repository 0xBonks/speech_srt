import { createRouter, createWebHistory } from 'vue-router'

// Importiere die Komponenten für die einzelnen Schritte
// Diese müssen noch erstellt werden
const TextInput = () => import('../views/TextInput.vue')
const Translation = () => import('../views/Translation.vue')
const SelectVoice = () => import('../views/SelectVoice.vue')
const AudioOutput = () => import('../views/AudioOutput.vue')
const InstructionsView = () => import('../views/InstructionsView.vue')
const HelpView = () => import('../views/HelpView.vue')

const routes = [
  {
    path: '/',
    redirect: '/text-input'
  },
  {
    path: '/text-input',
    name: 'TextInput',
    component: TextInput,
    meta: { step: 1 }
  },
  {
    path: '/translation',
    name: 'Translation',
    component: Translation,
    meta: { step: 2 }
  },
  {
    path: '/select-voice',
    name: 'SelectVoice',
    component: SelectVoice,
    meta: { step: 3 }
  },
  {
    path: '/audio-output',
    name: 'AudioOutput',
    component: AudioOutput,
    meta: { step: 4 }
  },
  {
    path: '/instructions',
    name: 'Instructions',
    component: InstructionsView
  },
  {
    path: '/help',
    name: 'Help',
    component: HelpView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
