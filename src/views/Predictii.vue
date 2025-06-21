<template>
  <div class="predictii-page">
    <div class="welcome-page">
      <!-- HEADER -->
      <div class="header">
        <div
          class="header-left"
          style="display: flex; align-items: center; gap: 5rem"
        >
          <button class="menu-button" @click="toggleMenu">&#9776;</button>
          <router-link
            v-if="isPremium && isLoggedIn && !isMobile"
            to="/camioane-cumparator"
            class="truck-button"
          >
            Urmărește Șofer 🚚
          </router-link>
        </div>

        <router-link v-if="isPremium" to="/home-buyer" class="site-title"
          >Fermivo Premium🌾</router-link
        >
        <router-link v-else to="/home-buyer" class="site-title"
          >Fermivo🌾</router-link
        >

        <router-link
          v-if="isLoggedIn && !isPremium"
          to="/premium"
          class="premium-button"
        >
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
              <router-link :to="`/editare-profil/${user._id}`"
                >Editează Profil</router-link
              >
            </div>
          </div>

          <button
            v-if="isLoggedIn"
            class="sign-out-button"
            @click="handleLogout"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div class="container">
        <h1 class="title">📈 Predicții de preț pentru cereale</h1>

        <div
          v-if="predictii.length && !isMobile"
          class="predictii-slider"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <div class="slide">
            <h3>{{ predictii[currentSlide].produs }}</h3>
            <p><strong>Zonă:</strong> {{ predictii[currentSlide].zona }}</p>
            <p>
              <strong>Preț estimat:</strong>
              {{ predictii[currentSlide].pret_lei_predictie }}
            </p>
          </div>
          <div class="slide-controls">
            <button @click="prevSlide">⬅️</button>
            <button @click="nextSlide">➡️</button>
          </div>
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
        const response = await axios.get(
          "https://fermivo-backend.onrender.com/api/predictii"
        );
        if (response.data.success) {
          this.predictii = response.data.predictii;
        }
      } catch (error) {
        console.error("❌ Eroare la fetch predictii:", error);
      }
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("ro-RO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.predictii.length;
    },
    prevSlide() {
      this.currentSlide =
        (this.currentSlide - 1 + this.predictii.length) % this.predictii.length;
    },
    handleTouchStart(e) {
      this.touchStartX = e.changedTouches[0].screenX;
    },
    handleTouchEnd(e) {
      this.touchEndX = e.changedTouches[0].screenX;
      this.handleSwipe();
    },
    handleSwipe() {
      const delta = this.touchEndX - this.touchStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) {
          this.nextSlide();
        } else {
          this.prevSlide();
        }
      }
    },
    startAutoplay() {
      this.autoplayInterval = setInterval(() => {
        if (this.predictii.length) {
          this.nextSlide();
        }
      }, 10000); // la 10 secunde
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
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
