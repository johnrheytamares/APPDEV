<script setup>
import { ref } from 'vue'

const props = defineProps({ open: Boolean })
const emit = defineEmits(['toggle'])

const messages = ref([
  { text: "Hello! How can I help you today?", sender: "bot" }
])
const input = ref("")

const send = () => {
  if (!input.value.trim()) return
  messages.value.push({ text: input.value, sender: "user" })
  input.value = ""

  setTimeout(() => {
    const replies = [
      "You can book directly on our website!",
      "Check-in: 3PM • Check-out: 11AM",
      "Yes! We have pet-friendly villas.",
      "Airport transfer available upon request."
    ]
    messages.value.push({ text: replies[Math.floor(Math.random() * replies.length)], sender: "bot" })
  }, 800)
}
</script>

<template>
  <div v-if="open" class="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-32px)] h-[520px] bg-white rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col">
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary-blue to-accent-blue text-white p-4 flex justify-between items-center">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
          <i class="fas fa-robot"></i>
        </div>
        <span class="font-semibold">Eduardo's Assistant</span>
      </div>
      <button @click="emit('toggle')" class="hover:bg-white/20 rounded-full p-2 transition">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Messages -->
    <div class="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
      <div v-for="(msg, i) in messages" :key="i"
           :class="msg.sender === 'user' ? 'justify-end' : 'justify-start'"
           class="flex">
        <div :class="msg.sender === 'user' ? 'bg-accent-blue text-white' : 'bg-white shadow'"
             class="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed">
          {{ msg.text }}
        </div>
      </div>
    </div>

    <!-- Input -->
    <div class="p-4 bg-white border-t flex gap-3">
      <input v-model="input" @keyup.enter="send"
             placeholder="Type your message..."
             class="flex-1 px-4 py-3 border rounded-full focus:outline-none focus:border-primary-blue text-sm">
      <button @click="send"
              class="w-11 h-11 bg-accent-blue text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition">
        <i class="fas fa-paper-plane"></i>
      </button>
    </div>
  </div>
</template>