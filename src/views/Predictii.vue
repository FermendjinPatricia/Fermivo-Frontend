<template>
  <div>
    <div class="welcome-page">
      <!-- HEADER -->
      <div class="header">
        <div
          class="header-left"
          style="display: flex; align-items: center; gap: 5rem"
        >
          <button class="menu-button" @click="toggleMenu">&#9776;</button>
        </div>

        <router-link
          v-if="isBuyer && isPremium"
          to="/home-buyer"
          class="site-title"
          >Fermivo Premium🌾</router-link
        >
        <router-link v-if="!isBuyer && isPremium" to="/home" class="site-title"
          >Fermivo Premium🌾</router-link
        >
        <router-link
          v-if="isBuyer && !isPremium"
          to="/home-buyer"
          class="site-title"
          >Fermivo🌾</router-link
        >
        <router-link v-if="!isBuyer && !isPremium" to="/home" class="site-title"
          >Fermivo🌾</router-link
        >

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

      <!-- CONȚINUT -->
      <div class="container">
        <h1 class="title">📈 Predicții de preț pentru cereale</h1>

        <div
          v-if="predictii.length > 0"
          class="predictii-slider"
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          <div class="slide">
            <h3>{{ predictii[currentSlide].produs }}</h3>
            <p><strong>Zonă:</strong> {{ predictii[currentSlide].zona }}</p>
            <p>
              <strong>Preț estimat:</strong>
              {{ predictii[currentSlide].pret_lei_predictie }} lei/tonă
            </p>
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

    <img src="../assets/login.jpg" alt="Background" class="background-image" />

    <nav v-if="menuOpen" class="menu">
      <ul>
        <li v-if="isBuyer">
          <router-link to="/home-buyer">Acasă</router-link>
        </li>
        <li v-if="!isBuyer"><router-link to="/home">Acasă</router-link></li>
        <li>
          <router-link to="/check-prices">Vezi prețurile curente</router-link>
        </li>
        <li v-if="isMobile">
          <router-link :to="`/editare-profil/${user._id}`" v-if="isMobile"
            >Editează Profil</router-link
          >
        </li>
        <li>
          <router-link to="/predictii" v-if="isMobile"
            >Vezi predicții de prețuri</router-link
          >
        </li>
        <li>
          <router-link
            v-if="isPremium && isLoggedIn && isMobile"
            to="/camioane-cumparator"
            >Urmărește Șoferi</router-link
          >
        </li>
        <li v-if="isMobile">
          <router-link to="/premium" v-if="!isPremium && isLoggedIn && isMobile"
            >Devino Premium</router-link
          >
        </li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "PaginaPredictii",
  data() {
    return {
      isLoggedIn: false,
      isMobile: window.innerWidth <= 1024,
      user: null,
      isPremium: false,
      menuOpen: false,
      predictii: [],
      showMenu: false,
      currentSlide: 0,
      touchStartX: 0,
      touchEndX: 0,
      autoplayInterval: null,
      showProfileMenu: false,
    };
  },
  computed: {
    isBuyer() {
      return this.user?.role === "buyer";
    },
    userName() {
      return this.user?.name || "";
    },
    userProfilePicture() {
      return this.user?.picture || "/default-profile.png";
    },
  },
  methods: {
    async fetchUser(userId) {
      try {
        const response = await axios.get(
          `https://fermivo-backend.onrender.com/api/users/${userId}`
        );
        if (response.data.success) {
          this.user = response.data.user;
          this.isPremium = response.data.user.isPremium;
        }
      } catch (error) {
        console.error("❌ Eroare la fetch user:", error);
      }
    },
    async fetchPredictii() {
      try {
        const res = await axios.get(
          "https://fermivo-backend.onrender.com/api/predictii"
        );
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
        delta < 0 ? this.nextSlide() : this.prevSlide();
      }
    },
    startAutoplay() {
      this.autoplayInterval = setInterval(() => {
        if (this.predictii.length) this.nextSlide();
      }, 10000);
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    handleOutsideClick(event) {
      const menu = this.$el.querySelector(".menu-button");
      if (this.menuOpen && menu && !menu.contains(event.target)) {
        this.menuOpen = false;
      }
    },
    handleLogout() {
      localStorage.clear();
      this.$router.push("/login");
    },
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);

    const localUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (localUser && localUser._id && token) {
      this.isLoggedIn = true;
      this.fetchUser(localUser._id);
    }

    this.fetchPredictii();
    this.startAutoplay();
  },
  beforeUnmount() {
    clearInterval(this.autoplayInterval);
    document.removeEventListener("click", this.handleOutsideClick);
  },
};
</script>

<style scoped>
.welcome-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: "Inria Sans", sans-serif;
}
.premium-button {
  background-color: #f5b301;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-left: 10px;
  margin-right: 60px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.premium-button:hover {
  background-color: #f5a301;
}

.user-profile-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  gap: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1b5e20;
}

.user-name {
  font-weight: bold;
  color: #1b5e20;
}

.profile-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.profile-menu a {
  color: #1b5e20;
  text-decoration: none;
  font-weight: bold;
}

.profile-menu a:hover {
  text-decoration: underline;
}

.chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 1rem;
  cursor: pointer;
}

.chat-icon:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

.menu-button {
  font-size: 2rem;
  background: rgba(217, 242, 208, 1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #1b5e20;
}

.menu {
  position: absolute;
  top: 60px;
  left: 15px;
  background: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  margin: 10px 0;
}

.menu a {
  text-decoration: none;
  color: #1b5e20;
  font-weight: bold;
}

.menu a:hover {
  text-decoration: underline;
}

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
    position: relative;
    top: 2rem;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 5;
  width: 300px;
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

@media (max-width: px) {
  .title {
    font-size: 1.3rem;
  }
  .subtitle {
    font-size: 1rem;
  }
}
html,
body {
  overflow: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
}
.welcome-page {
  font-family: "Inria Sans", sans-serif;
}

.header {
  display: flex;
  align-items: center;
  /*justify-content: space-between;*/
  width: 97%;
  background: rgba(253, 253, 253, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;
}

.site-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #1b5e20;
  text-decoration: none;
  font-family: "Inria Sans", sans-serif;
  z-index: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.truck-button {
  background-color: #320bbe;
  color: white;
  border: none;
  padding: 8px 20px;
  margin-left: 10px;
  margin-right: 60px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.truck-button:hover {
  background-color: #658ec8;
}

.btn-vezi-harta {
  background-color: #011bc2;
  color: white;
  padding: 8px 20px;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s;
}
.btn-vezi-harta:hover {
  background-color: #197ba2;
  transform: translateY(-2px);
}

.premium-button {
  background-color: #f5b301;
  color: white;
  border: none;
  padding: 8px 12px;
  margin-left: 10px;
  margin-right: 60px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}
.premium-button:hover {
  background-color: #f5a301;
}

.user-profile-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  gap: 8px;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1b5e20;
}

.user-name {
  font-weight: bold;
  color: #1b5e20;
}

.profile-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.profile-menu a {
  color: #1b5e20;
  text-decoration: none;
  font-weight: bold;
}

.profile-menu a:hover {
  text-decoration: underline;
}

.chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 1rem;
  cursor: pointer;
}

.chat-icon:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

.menu-button {
  font-size: 2rem;
  background: rgba(217, 242, 208, 1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #1b5e20;
}

.menu {
  position: absolute;
  top: 60px;
  left: 15px;
  background: white;
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu li {
  margin: 10px 0;
}

.menu a {
  text-decoration: none;
  color: #1b5e20;
  font-weight: bold;
}

.menu a:hover {
  text-decoration: underline;
}

.sign-in-button,
.sign-out-button {
  background-color: #1b5e20;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 7px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.sign-in-button:hover,
.sign-out-button:hover {
  background-color: #093b12;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 97%;
  background: rgba(253, 253, 253, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  position: relative;
}

.site-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #1b5e20;
  text-decoration: none;
  font-family: "Inria Sans", sans-serif;
}

.header-right {
  display: flex;
  align-items: right;
  gap: 0.2rem;
}

.user-profile {
  display: flex;
  align-items: center;
  cursor: pointer;
  position: relative;
}

.profile-picture {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #1b5e20;
}

.user-name {
  font-weight: bold;
  color: #1b5e20;
}

.chat-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-left: 1rem;
  cursor: pointer;
}

.chat-icon:hover {
  transform: scale(1.1);
  transition: transform 0.2s;
}

.user-profile-wrapper {
  display: flex;
  align-items: center;
  position: relative;
  gap: 8px;
}

.profile-menu {
  position: absolute;
  top: 50px;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 100;
}

.profile-menu a {
  color: #1b5e20;
  text-decoration: none;
  font-weight: bold;
}

.profile-menu a:hover {
  text-decoration: underline;
}

.menu-button {
  font-size: 2rem;
  background: rgba(217, 242, 208, 1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #1b5e20;
}

.sign-in-button,
.sign-out-button {
  background-color: #1b5e20;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 7px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
}

.sign-in-button:hover,
.sign-out-button:hover {
  background-color: #093b12;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}

.content-box {
  background: rgba(217, 227, 194, 0.8);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.9);
  max-width: 800px;
  width: 95%;
  text-align: left;
  margin-top: 2rem;
}

h1 {
  font-size: 3rem;
  font-weight: bold;
  color: rgba(0, 114, 31, 1);
}

p {
  font-size: 1.7rem;
  font-weight: bold;
  color: rgba(0, 114, 31, 1);
}

.card-container {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 2px solid #02111d45;
  padding: 1rem;
  border-radius: 20px;
  margin-top: 1rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 90%;
  width: 800px;
}

.card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(197, 241, 186, 0.8);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.card-text {
  display: flex;
  flex-direction: column;
  font-size: 1rem;
  color: #000;
}

.card-image {
  width: 80px;
  height: 60px;
  object-fit: cover;
  border-radius: 12px;
  margin-left: 1rem;
}

.card.card-grid {
  display: grid;
  grid-template-columns: 1.5fr 1.5fr 1fr;
  gap: 1rem;
  align-items: start;
  background: rgba(197, 241, 186, 0.8);
  border-radius: 20px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.anunt-info p {
  margin: 0.2rem 0;
  font-weight: bold;
}

.brm-table {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  font-family: "Inria Sans", sans-serif;
  font-size: 0.9rem;
  width: auto;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid #e0e0e0;
}

.brm-table h4 {
  margin-bottom: 0.5rem;
  margin-right: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: #1b5e20;
  border-bottom: 1px solid #c0c0c0;
  padding-bottom: 0.3rem;
}

.brm-table table {
  width: 100%;
  border-collapse: collapse;
}

.brm-table th {
  background-color: #d9f2d0;
  color: #1b5e20;
  font-weight: bold;
  padding: 6px;
  border-bottom: 1px solid #ccc;
}

.brm-table td {
  padding: 6px;
  border-bottom: 1px solid #eee;
}

.brm-table tr:last-child td {
  border-bottom: none;
}
.brm-table tr:hover {
  background-color: #f1f8e9;
}

.card-image {
  margin-left: 1.5rem;
  width: auto;
  height: 100px;
  object-fit: cover;
  border-radius: 12px;
}

.no-ads {
  text-align: center;
  color: #ffffff;
  font-size: 1.2rem;
  font-weight: bold;
}

/* .menu {
  position: absolute;
  top: 60px;
  left: 15px;
  background: rgb(201, 223, 192);
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
} */

.detalii-button,
.adauga_anunt {
  display: inline-block;
  background-color: #1b5e20;
  color: white;
  padding: 0.5rem 1rem;
  text-align: center;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s ease, transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.detalii-button,
.adauga_anunt:hover {
  background-color: #093b12;
  transform: translateY(-2px);
}

.detalii-button,
.adauga_anunt:active {
  transform: translateY(0);
}

.predictii-slider {
  position: relative;
  top: 2rem;
  width: 300px;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 5;
}

.slide {
  text-align: center;
  font-weight: bold;
  color: #1b5e20;
}

.slide-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.slide-controls button {
  background: #1b5e20;
  color: white;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.2rem;
}

.slide-controls button:hover {
  background: #093b12;
}

@media (max-width: 1024px) {
  .site-title {
    margin: 0 auto;
    font-size: 1rem;
  }
}
</style>
