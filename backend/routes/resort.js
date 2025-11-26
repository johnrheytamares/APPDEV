// backend/routes/resort.js   ← EXACT NA ‘TO! WALANG IBANG REQUIRE!

const express = require('express');
const router = express.Router();

// ==========================================
// CHATBOT API (ITO NA TALAGA ANG PARA SA CHAT!)
// ==========================================
router.post('/chat', (req, res) => {
  const message = (req.body.message || '').toString().trim();
  let reply = "Kumusta! Welcome sa Eduardo's Resort! Ano po maitutulong ko?";

  const msg = message.toLowerCase();

  if (msg.includes('book') || msg.includes('reserve') || msg.includes('magbook') || msg.includes('reservation')) {
    reply = `Mag-book na po kayo!<br><br>
    <a href="reservation.html" class="inline-block px-6 py-3 bg-warm-brown text-white rounded-lg font-bold hover:bg-deep-brown transition">
      Book Now
    </a>`;
  }
  else if (msg.includes('menu') || msg.includes('kain') || msg.includes('food') || msg.includes('restaurant')) {
    reply = `Tingnan ang aming menu!<br><br>
    <button onclick="if(typeof openMenuModal === 'function') openMenuModal(); else alert('Menu loading...')" 
            class="px-6 py-3 bg-warm-brown text-white rounded-lg font-bold hover:bg-deep-brown transition">
      View Full Menu
    </button>`;
  }
  else if (msg.includes('vr') || msg.includes('tour') || msg.includes('360') || msg.includes('virtual')) {
    reply = `Libre ang virtual tour!<br><br>
    <button onclick="if(typeof openVrModal === 'function') openVrModal(); else alert('VR loading...')" 
            class="px-6 py-3 bg-primary-blue text-white rounded-lg font-bold hover:bg-blue-700 transition">
      Start VR Tour
    </button>`;
  }
  else if (msg.includes('magkano') || msg.includes('price') || msg.includes('rate') || msg.includes('presyo')) {
    reply = "Rooms from ₱8,000/night.<br><a href='rates.html' class='text-accent-blue underline font-bold'>See all rates →</a>";
  }
  else if (msg.includes('hello') || msg.includes('hi') || msg.includes('kamusta') || msg.includes('good')) {
    reply = "Hello po! Welcome sa Eduardo's Resort!";
  }

  setTimeout(() => res.json({ reply }), 700);
});

// ==========================================
// MENU API (OPTIONAL PERO ASTIG)
// ==========================================
router.get('/menu', (req, res) => {
  res.json({
    appetizers: [
      { name: "Calamari Fritti", desc: "Crispy squid rings with garlic aioli", price: "₱450" },
      { name: "Bruschetta Trio", desc: "Tomato basil, mushroom, olive tapenade", price: "₱380" }
    ],
    mains: [
      { name: "Grilled Tuna Belly", desc: "With mango salsa and garlic rice", price: "₱950" },
      { name: "Seafood Paella", desc: "Prawns, mussels, squid, saffron rice", price: "₱2,200 (4 pax)" }
    ],
    desserts: [
      { name: "Mango Float Supreme", desc: "Layers of graham, cream, fresh mango", price: "₱320" }
    ],
    drinks: [
      { name: "Fresh Buko Juice", desc: "Straight from the coconut", price: "₱150" }
    ]
  });
});

module.exports = router;