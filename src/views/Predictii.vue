<template>
  <div class="predictii-page">
    <div class="welcome-page">
      <!-- HEADER -->
      <div class="header">
        <div class="header-left" style="display: flex; align-items: center; gap: 5rem">
          <button class="menu-button" @click="toggleMenu">&#9776;</button>
          <router-link
            v-if="isPremium && isLoggedIn && !isMobile"
            to="/camioane-cumparator"
            class="truck-button"
          >
            Urmărește Șofer 🚚
          </router-link>
        </div>

        <router-link v-if="isPremium" to="/home-buyer" class="site-title">Fermivo Premium🌾</router-link>
        <router-link v-else to="/home-buyer" class="site-title">Fermivo🌾</router-link>

        <router-link v-if="isLoggedIn && !isPremium" to="/premium" class="premium-button">
          Devino Premium
        </router-link>

        <div class="header-right">
          <div v-if="user && !isMobile" class="user-profile-wrapper">
            <div class="user-profile" @click="toggleProfileMenu">
              <img :src="userProfilePicture" class="profile-picture" />
              <span class="user-name">{{ userName }}</span>
            </div>

            <img
              src="../assets/chat-icon.png"
              class="chat-icon"
              alt="Chat"
              @click="$router.push('/chat')"
            />

            <div v-if="showProfileMenu" class="profile-menu">
              <router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link>
            </div>
          </div>

          <button v-if="isLoggedIn" class="sign-out-button" @click="handleLogout">
            Sign Out
          </button>
        </div>
      </div>

      <div class="container">
        <h1 class="title">📈 Predicții de preț pentru cereale</h1>

        <div class="select-wrapper">
          <label for="produs">Selectează produsul:</label>
          <select id="produs" v-model="selectedProdus" @change="fetchPredictii">
            <option disabled value="">Alege un produs</option>
            <option v-for="produs in produse" :key="produs" :value="produs">
              {{ produs }}
            </option>
          </select>
        </div>

        <div v-if="predictii.length > 0">
          <h2 class="subtitle">Prețuri estimate (lei/tonă)</h2>
          <table class="predictii-table">
            <thead>
              <tr>
                <th>Dată</th>
                <th>Preț estimat</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in predictii" :key="item.data">
                <td>{{ formatDate(item.data) }}</td>
                <td>{{ item.pret.toFixed(2) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="no-data">
          <p>Selectează un produs pentru a vedea predicțiile.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaginaPredictii",
  data() {
    return {
      selectedProdus: "",
      produse: [
        "Grâu panificație",
        "Grâu furajer",
        "Porumb",
        "Orz",
        "Orz furajer",
        "Rapiță",
        "Floarea soarelui",
      ],
      predictii: [],
    };
  },
  methods: {
    async fetchPredictii() {
      try {
        const response = await axios.get(`/api/predictii/${this.selectedProdus}`);
        this.predictii = response.data;
      } catch (err) {
        console.error("Eroare la obținerea predicțiilor:", err);
        this.predictii = [];
      }
    },
    toggleMenu() {
      this.$emit("toggle-menu");
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
  },
};
</script>

<style scoped>
.predictii-page {
  background: #f9f9f9;
  min-height: 100vh;
  font-family: "Segoe UI", sans-serif;
}

.header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background-color: #fff;
  border-bottom: 1px solid #ccc;
  justify-content: space-between;
}

.site-title {
  font-weight: bold;
  font-size: 1.2rem;
  text-decoration: none;
  color: #2e7d32;
}

.menu-button {
  background: none;
  border: none;
  font-size: 1.4rem;
  cursor: pointer;
}

.container {
  padding: 1rem;
}

.title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
}

.select-wrapper {
  margin-bottom: 1.5rem;
}

.select-wrapper select {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.predictii-table {
  width: 100%;
  border-collapse: collapse;
}

.predictii-table th,
.predictii-table td {
  padding: 0.7rem;
  border: 1px solid #ccc;
  text-align: center;
}

.subtitle {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
  color: #444;
}

.no-data {
  text-align: center;
  color: #777;
  font-style: italic;
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .title {
    font-size: 1.3rem;
  }
  .subtitle {
    font-size: 1rem;
  }
}
</style>