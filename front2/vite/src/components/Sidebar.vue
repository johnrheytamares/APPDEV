<script setup>
defineProps({ open: Boolean })
const emit = defineEmits(['close'])
</script>

<template>
  <!-- Overlay -->
  <div 
    @click="emit('close')" 
    :class="open ? 'opacity-100 visible' : 'opacity-0 invisible'"
    class="fixed inset-0 bg-black/50 z-60 transition-all duration-300"
  ></div>

  <!-- Sidebar -->
  <div 
    :class="open ? 'right-0' : '-right-80'"
    class="fixed top-0 w-80 h-full bg-white shadow-2xl z-70 transition-right duration-500 ease-in-out flex flex-col"
  >
    <div class="p-6 border-b flex justify-between items-center">
      <a href="#" class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white text-xl font-bold">
          Ed
        </div>
        <span class="text-xl font-bold text-primary-blue">Eduardo's</span>
      </a>
      <button @click="emit('close')" class="text-2xl text-gray-600 hover:text-gray-900">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <nav class="flex-1 px-6 py-8 space-y-4">
      <a href="#" class="block py-3 text-lg font-medium text-primary-blue border-b border-primary-blue">Home</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">Amenities</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">Rates</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">Gallery</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">Contact</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">About</a>
      <a href="#" class="block py-3 text-lg font-medium hover:text-primary-blue transition">Menu</a>
    </nav>

    <div class="p-6 space-y-3 border-t">
      <a href="#" class="block text-center py-3 border border-primary-blue text-primary-blue rounded-lg hover:bg-blue-50 font-medium">
        Login
      </a>
      <a href="#" class="block text-center py-3 bg-primary-blue text-white rounded-lg hover:bg-blue-700 font-medium">
        Sign Up
      </a>
    </div>
  </div>
</template>