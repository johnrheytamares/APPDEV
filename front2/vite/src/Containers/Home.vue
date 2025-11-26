<script setup>
import { ref, onMounted, nextTick } from 'vue'
import Header from './components/Header.vue'
import Sidebar from './components/Sidebar.vue'
import Chatbot from './components/Chatbot.vue'
import Footer from './components/Footer.vue'
import MenuModal from './components/MenuModal.vue'
import VrTourModal from './components/VrTourModal.vue'

// Reactive States
const showSidebar = ref(false)
const showChatbot = ref(false)
const showMenu = ref(false)
const showVr = ref(false)

// Dish Slideshow
const dishIndex = ref(0)
const dishes = [
  {
    name: "Poolside Grill & Café",
    desc: "Fresh flavors, kid-friendly menus, and evening specials with live acoustic sessions.",
    price: "₱1,200 – ₱2,000 per platter",
    persons: "Good for 3–5 persons",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Tropical Seafood Feast",
    desc: "A combination of grilled prawns, tuna belly, and squid served with tangy citrus sauce.",
    price: "₱2,500 – ₱3,000 per set",
    persons: "Good for 4–6 persons",
    img: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80"
  },
  {
    name: "Island Pasta Bowl",
    desc: "Creamy coconut seafood pasta topped with basil and local spices.",
    price: "₱900 per bowl",
    persons: "Good for 1–2 persons",
    img: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=800&q=80"
  }
]

// Suite & Gallery Carousel
const suiteIndex = ref(0)
const galleryIndex = ref(0)

// Auto slideshow
onMounted(() => {
  setInterval(() => {
    dishIndex.value = (dishIndex.value + 1) % dishes.length
  }, 5000)

  // Scroll reveal animation
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
      }
    })
  }, { threshold: 0.12 })

  document.querySelectorAll('[data-anim]').forEach(el => observer.observe(el))
})
</script>

<template>
  <!-- Sidebar & Header -->
  <Sidebar :open="showSidebar" @close="showSidebar = false" />
  <Header @open-sidebar="showSidebar = true" />

  <main>
    <!-- HERO -->
    <section class="relative flex items-center justify-center min-h-[350px] sm:min-h-[450px] text-center px-4">
      <div class="absolute inset-0 bg-black/40 z-0"></div>
      <div 
        class="absolute inset-0 bg-cover bg-center"
        style="background-image: linear-gradient(135deg, rgba(43,108,176,0.7), rgba(193,154,107,0.4)), url('https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?auto=format&fit=crop&w=1600&q=80')"
      ></div>
      <div class="relative z-10 max-w-3xl bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-lg mx-4">
        <h1 class="text-[25px] sm:text-[30px] md:text-[40px] font-bold text-primary-blue mb-4">
          ReserVision Waterpark & Wellness Resort
        </h1>
        <p class="text-sm sm:text-base md:text-lg text-gray-700 mb-6">
          Where elegant relaxation meets family fun. Enjoy thrilling slides, serene pools, curated dining,
          and a personal smart assistant to plan your stay.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="#" class="px-8 py-3 bg-warm-brown text-white font-semibold rounded-lg hover:bg-deep-brown transition shadow-md">
            Book Your Escape
          </a>
          <button @click="showVr = true" class="px-8 py-3 border border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-blue-50 transition flex items-center gap-2">
            <i class="fas fa-vr-cardboard"></i> Virtual Tour
          </button>
        </div>
      </div>
    </section>

    <!-- OVERVIEW -->
    <section class="py-16 bg-neutral-gray text-center">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold mb-4 relative inline-block">
          Experience ReserVision
          <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary-blue to-warm-brown rounded-full"></span>
        </h2>
        <p class="text-gray-700 max-w-2xl mx-auto mb-12">
          Eduardo's Resort blends refined design and family-first recreation — elegant spaces, playful attractions, and smooth digital booking for your perfect getaway.
        </p>
        <div class="flex flex-wrap justify-center gap-16 text-center">
          <div class="hover:-translate-y-2 transition">
            <div class="text-4xl font-bold text-primary-blue">10+</div>
            <p class="text-gray-600">Attractions & Activities</p>
          </div>
          <div class="hover:-translate-y-2 transition">
            <div class="text-4xl font-bold text-primary-blue">50+</div>
            <p class="text-gray-600">Luxury Rooms & Villas</p>
          </div>
          <div class="hover:-translate-y-2 transition">
            <div class="text-4xl font-bold text-primary-blue">24/7</div>
            <p class="text-gray-600">Smart Assistance</p>
          </div>
        </div>
      </div>
    </section>

    <!-- DINING -->
    <section class="py-16 bg-neutral-gray">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12" data-anim>
          <h2 class="text-3xl font-bold mb-4 relative inline-block">
            Dining & Refreshments
            <span class="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-primary-blue to-warm-brown rounded-full"></span>
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto">Poolside grills, family platters, and seasonal menus inspired by local produce.</p>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 items-center">
          <div class="relative h-96 rounded-2xl overflow-hidden shadow-xl">
            <img 
              v-for="(dish, i) in dishes" :key="i"
              :src="dish.img"
              :class="dishIndex === i ? 'opacity-100' : 'opacity-0'"
              class="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            >
            <div class="absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent text-white p-6 lg:hidden">
              <h3 class="text-2xl font-bold mb-3">{{ dishes[dishIndex].name }}</h3>
              <p class="text-gray-200 mb-3">{{ dishes[dishIndex].desc }}</p>
              <p class="text-lg font-semibold mb-1">{{ dishes[dishIndex].price }}</p>
              <p class="text-gray-300">{{ dishes[dishIndex].persons }}</p>
              <button @click="showMenu = true" class="mt-4 px-4 py-2 border border-white text-white rounded-md hover:bg-white/20">View Menu</button>
            </div>
          </div>

          <div class="hidden lg:block">
            <h3 class="text-2xl font-bold text-primary-blue mb-4">{{ dishes[dishIndex].name }}</h3>
            <p class="text-gray-600 mb-6">{{ dishes[dishIndex].desc }}</p>
            <p class="text-xl font-bold text-warm-brown mb-2">{{ dishes[dishIndex].price }}</p>
            <p class="text-gray-500 mb-8">{{ dishes[dishIndex].persons }}</p>
            <div class="flex gap-4">
              <a href="#" class="px-6 py-3 bg-warm-brown text-white font-semibold rounded-lg hover:bg-deep-brown">Order Now</a>
              <button @click="showMenu = true" class="px-6 py-3 border border-primary-blue text-primary-blue font-semibold rounded-lg hover:bg-blue-50">View Full Menu</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SUITES CAROUSEL -->
    <section class="py-16 bg-white">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-primary-blue text-center mb-12">Our Suites</h2>
        <div class="relative overflow-hidden">
          <div class="flex transition-transform duration-700 ease-in-out" :style="{ transform: `translateX(-${suiteIndex * 100}%)` }">
            <div class="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 p-4">
              <div class="relative h-80 group overflow-hidden rounded-xl cursor-pointer">
                <img src="https://images.unsplash.com/photo-1611892441792-ae6af9367ebc?auto=format&fit=crop&w=800&q=80" class="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700">
                <div class="absolute inset-0 bg-gradient-to-t from-primary-blue/90 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6 text-white">
                  <div>
                    <h3 class="text-xl font-bold">Deluxe Suite</h3>
                    <p class="text-sm">Ocean view • King bed</p>
                    <p class="text-lg font-bold mt-2">₱8,000 / night</p>
                  </div>
                </div>
              </div>
            </div>
            <!-- Repeat for others -->
          </div>
          <button @click="suiteIndex = (suiteIndex - 1 + 3) % 3" class="absolute left-4 top-1/2 -translate-y-1/2 bg-primary-blue text-white rounded-full p-3 hover:bg-blue-700"><i class="fas fa-chevron-left"></i></button>
          <button @click="suiteIndex = (suiteIndex + 1) % 3" class="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-blue text-white rounded-full p-3 hover:bg-blue-700"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </section>

    <!-- GALLERY & MAP (simplified for brevity, same design) -->
    <!-- Add more sections as needed -->

  </main>

  <!-- Footer -->
  <Footer />

  <!-- Floating Chatbot Button -->
  <button 
    @click="showChatbot = !showChatbot"
    class="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-primary-blue to-accent-blue text-white rounded-full shadow-2xl flex items-center justify-center text-3xl hover:scale-110 transition animate-pulse"
  >
    <i class="fas fa-robot"></i>
  </button>

  <!-- Modals -->
  <Chatbot :open="showChatbot" @toggle="showChatbot = !showChatbot" />
  <MenuModal :open="showMenu" @close="showMenu = false" />
  <VrTourModal :open="showVr" @close="showVr = false" />
</template>

<style scoped>
.gradient-border::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(to right, #2B6CB0, #C19A6B);
  border-radius: 3px;
}
[data-anim] {
  opacity: 0;
  transform: translateY(30px);
  transition: all 0.8s ease-out;
}
[data-anim].visible {
  opacity: 1;
  transform: translateY(0);
}
</style>