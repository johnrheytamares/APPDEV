<template>
  <div class="app">
    <Home />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Home from './containers/Home.vue'


// Fetch all products from JSON Server
// async function fetchProducts() {
//   try {
//     const res = await fetch('http://localhost:3000/api/products')
//     products.value = await res.json()
//   } catch (err) {
//     console.error('Failed to fetch products:', err)
//   }
// }

// onMounted(fetchProducts)

// // Add item to cart
// function addToCart(product) {
//   cart.value.push(product)
// }

// // Remove item from cart
// function removeFromCart(index) {
//   cart.value.splice(index, 1)
// }

// // Delete a product
// async function deleteProduct(id) {
//   try {
//     await fetch(`http://localhost:3000/api/products/${id}`, {
//       method: 'DELETE'
//     })
//     fetchProducts()
//   } catch (err) {
//     console.error('Failed to delete product:', err)
//   }
// }

// // Update product details
// async function updateProduct(product) {
//   try {
//     await fetch(`http://localhost:3000/api/products/${product.id}`, {
//       method: 'PUT',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(product)
//     })
//     fetchProducts()
//   } catch (err) {
//     console.error('Failed to update product:', err)
//   }
// }
</script>

<style scoped>
.app {
  font-family: Arial, sans-serif;
  text-align: center;
  background: linear-gradient(135deg, #82b2d9 0%, #9a94a1 100%);
  min-height: 100vh;
  padding: 20px 0;
  overflow: hidden;
}

/* h1 {
  color: #333;
  margin-bottom: 25px;
}

.main-container {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 40px;
  width: 85%;
  margin: auto;
}

.cart-section, .product-section {
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
  min-height: 450px;
  box-shadow: 0 2px 15px rgba(0, 0, 0, 0.3);
}


@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
    width: 90%;
  }
} */
</style>
