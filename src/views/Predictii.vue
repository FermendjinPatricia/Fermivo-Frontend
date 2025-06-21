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

        <router-link v-if="isPremium" to="/home-buyer" class="site-title">
          Fermivo Premium🌾
        </router-link>
        <router-link v-else to="/home-buyer" class="site-title">
          Fermivo🌾
        </router-link>

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
              <router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link>
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

      <!-- CONȚINUT -->
      <div class="container">
        <h1 class="title">📈 Predicții de preț pentru cereale</h1>

        <div v-if="predictii.length > 0" class="predictii-slider"
             @touchstart="handleTouchStart"
             @touchend="handleTouchEnd">
          <div class="slide">
            <h3>{{ predictii[currentSlide].produs }}</h3>
            <p><strong>Zonă:</strong> {{ predictii[currentSlide].zona }}</p>
            <p><strong>Preț estimat:</strong> {{ predictii[currentSlide].pret_lei_predictie }} lei/tonă</p>
          </div>
          <div class="slide-controls">
            <button @click="prevSlide">⬅️</button>
            <button @click="nextSlide">➡️</button>
          </div>
        </div>

        <div v-else class="no-data">
          <p>Nu există predicții disponibile.</p>
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
      predictii: [],
      currentSlide: 0,
      touchStartX: 0,
      touchEndX: 0,
      autoplayInterval: null,
    };
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768;
    },
    user() {
      return JSON.parse(localStorage.getItem("user"));
    },
    isLoggedIn() {
      return !!localStorage.getItem("token");
    },
    isPremium() {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.premium === true;
    },
    userName() {
      return this.user?.name || "";
    },
    userProfilePicture() {
      return this.user?.picture || "/default-profile.png";
    },
  },
  methods: {
    async fetchPredictii() {
      try {
        const res = await axios.get("https://fermivo-backend.onrender.com/api/predictii");
        if (res.data.success) {
          this.predictii = res.data.predictii;
        }
      } catch (err) {
        console.error("❌ Eroare la fetch predictii:", err);
      }
    },
    nextSlide() {
      this.currentSlide = (this.currentSlide + 1) % this.predictii.length;
    },
    prevSlide() {
      this.currentSlide = (this.currentSlide - 1 + this.predictii.length) % this.predictii.length;
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
        delta < 0 ? this.nextSlide() : this.prevSlide();
      }
    },
    startAutoplay() {
      this.autoplayInterval = setInterval(() => {
        if (this.predictii.length) this.nextSlide();
      }, 10000);
    },
    toggleMenu() {
      this.$emit("toggle-menu");
    },
    handleLogout() {
      localStorage.clear();
      this.$router.push("/login");
    },
  },
  mounted() {
    this.fetchPredictii();
    this.startAutoplay();
  },
  beforeUnmount() {
    clearInterval(this.autoplayInterval);
  }
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

.predictii-slider {
  background: #fff;
  padding: 1.2rem;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
}

.slide h3 {
  font-size: 1.2rem;
  color: #2e7d32;
}

.slide-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.slide-controls button {
  font-size: 1.2rem;
  padding: 0.5rem 1rem;
  border: none;
  background: #2e7d32;
  color: white;
  border-radius: 5px;
  cursor: pointer;
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
