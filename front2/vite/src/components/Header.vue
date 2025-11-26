<script setup>
const emit = defineEmits(['open-sidebar'])
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
    <div class="container mx-auto px-4 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <a href="#" class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-blue to-accent-blue flex items-center justify-center text-white font-bold text-lg">
            Ed
          </div>
          <span class="text-xl font-bold text-primary-blue">Eduardo's</span>
        </a>

        <!-- Desktop Nav -->
        <nav class="hidden md:flex items-center gap-8">
          <a href="#" class="font-medium text-primary-blue relative after:absolute after:bottom-[-6px] after:left-0 after:w-full after:h-0.5 after:bg-primary-blue">
            Home
          </a>
          <a href="#" class="font-medium hover:text-primary-blue transition relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all hover:after:w-full">
            Amenities
          </a>
          <a href="#" class="font-medium hover:text-primary-blue transition relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all hover:after:w-full">
            Rates
          </a>
          <a href="#" class="font-medium hover:text-primary-blue transition relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all hover:after:w-full">
            Gallery
          </a>
          <a href="#" class="font-medium hover:text-primary-blue transition relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all hover:after:w-full">
            Contact
          </a>
          <a href="#" class="font-medium hover:text-primary-blue transition relative after:absolute after:bottom-[-6px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-blue after:transition-all hover:after:w-full">
            About
          </a>
        </nav>

        <!-- Actions -->
        <div class="flex items-center gap-4">
          <a href="#" class="hidden md:block px-5 py-2 border border-primary-blue text-primary-blue rounded-lg hover:bg-blue-50 font-medium">
            Login
          </a>
          <a href="#" class="hidden md:block px-5 py-2 bg-primary-blue text-white rounded-lg hover:bg-blue-700 font-medium">
            Sign Up
          </a>
          <button @click="emit('open-sidebar')" class="md:hidden text-2xl text-primary-blue">
            <i class="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </div>
  </header>
</template>