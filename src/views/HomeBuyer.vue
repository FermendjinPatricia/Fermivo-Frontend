<template>
  <div class="welcome-page">
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
        v-if="isLoggedIn && !isPremium && !isMobile"
        to="/premium"
        class="premium-button"
      >
        Devino Premium
      </router-link>

      <div class="header-right">
        <div class="header-right" v-if="user && !isMobile">
          <div class="user-profile-wrapper">
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
        </div>

        <button v-if="isLoggedIn" class="sign-out-button" @click="handleLogout">
          Sign Out
        </button>
      </div>
    </div>

    <img src="../assets/login.jpg" alt="Background" class="background-image" />

    
    <div class="content-box">
      <h1>Bine ai venit! 👋</h1>
      <p>
        Noi suntem <strong>Fermivo</strong>, marketplace-ul tău de încredere.
        <br />
        Explorează cele mai bune oferte de pe piață! 🚜🌾
      </p>
    </div>

    <!-- PREDICTII SLIDER -->
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

    <!-- ANUNTURI -->
    <div class="card-container"> 
      <p v-if="anunturi.length === 0" class="no-ads">Nu există anunțuri disponibile momentan.</p> <!-- Mesaj când nu sunt anunțuri -->
      <div v-else class="filtru-categorii"> <!-- Filtru categorii -->
        <button v-for="categorie in categories" :key="categorie" :class="{ activ: selectedCategory === categorie }" @click="selectedCategory = categorie" 
        >{{ categorie }}</button> 
        <button :class="{ activ: selectedCategory === 'favorite' }" @click="selectedCategory = 'favorite'">❤️ Favorite</button>
      </div>
      <div class="harta-button-wrapper">
        <router-link to="/harta-anunturi" class="btn-vezi-harta">🗺️ Vezi anunțurile pe hartă</router-link>
      </div>
      <div
        v-for="(item, index) in anunturiFiltrate"
        :key="index"
        class="card card-grid">
        <!-- Coloana 1: Informații anunț -->
        <div class="anunt-info">
          <p><strong>{{ item.produs }}</strong></p> <!-- Numele produsului -->
          <span 
            v-if="item.userId?.isPremium"
            style="
              background: #f5b301;
              color: white;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 0.85rem;
              font-weight: bold;
            ">🌟 Promovat</span>
          <p>Preț: {{ item.pret_lei_tona }} {{ item.moneda === "euro" ? "€" : "lei" }}/tonă</p> <!-- Prețul -->
          <p>Județ: {{ item.judet }}</p> <!-- Județul -->
          <p>Localitate: {{ item.localitate }}</p> <!-- Localitatea -->
          <router-link :to="`/anunturi/${item._id}`" class="detalii-button">Vezi detalii</router-link> <!-- Buton pentru detalii anunț -->
          <div style="text-align: right; margin-bottom: 8px"> <!-- Iconiță favorite -->
            <span
              style="font-size: 1.5rem; cursor: pointer"
              :style="{ color: isFavorite(item._id) ? 'red' : 'gray' }"
              @click="toggleFavorite(item._id)"
              title="Adaugă la favorite">{{ isFavorite(item._id) ? "❤️" : "🤍" }}</span> 
          </div>
        </div>

        <!-- 🟨 Coloana 2: Prețuri BRM -->
        <div class="brm-table" v-if="getPreturiProdus(item.produs).length"> <!-- Verificăm dacă există prețuri -->
          <h4>Prețuri azi</h4> <!-- Titlu tabel prețuri -->
          <table>
            <thead>
              <tr>
                <th>Zonă</th> <!-- Coloana pentru zonă -->
                <th>Preț</th> <!-- Coloana pentru preț -->
              </tr>
            </thead>
            <tbody>
              <tr v-for="(pret, idx) in getPreturiProdus(item.produs)" :key="idx"> <!-- Iterăm prin prețuri -->
                <td>{{ pret.zona }}</td> <!-- Zona produsului -->
                <td>{{ pret.pret_lei_tona }}</td> <!-- Prețul în lei -->
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 🟦 Coloana 3: Imagine -->
        <img
          src="../assets/grau.jpg"
          alt="Imagine produs"
          class="card-image"
          v-if="!isMobile"
        />
      </div>
    </div>

    <!-- MENIU -->
    <nav v-if="menuOpen" class="menu">
      <ul>
        <li><router-link to="/check-prices">Vezi prețurile curente</router-link></li>
        <li><router-link to="/predictii">Vezi predicții de prețuri</router-link></li>
        <li><router-link to="/premium" v-if="!isPremium && isLoggedIn">Devino Premium</router-link></li>
        <li><router-link v-if="isPremium && isLoggedIn" to="/camioane-cumparator">Urmărește Șoferi</router-link></li>
        <li><router-link to="/chat">Conversațiile tale</router-link></li>
        <li><router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link></li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from "../axios";

export default {
  name: "HomeBuyer",
  data() {
    return {
      isLoggedIn: false,
      isMobile: window.innerWidth <= 1024,
      user: null,
      anunturi: [],
      scraperData: [],
      menuOpen: false,
      showProfileMenu: false,
      predictii: [],
      currentSlide: 0,
      touchStartX: 0,
      touchEndX: 0,
      autoplayInterval: null,
      isPremium: false,
      favoriteAnunturi: [],
      selectedCategory: "toate",
      categories: [
        "toate",
        "Grâu panificație",
        "Grâu furajer",
        "Orz",
        "Orz furajer",
        "Porumb",
        "Floarea soarelui",
        "Rapiță",
      ],
    };
  },
  computed: {
    userName() {
      return this.user
        ? `${this.user.nume} ${this.user.prenume}`
        : "Utilizator";
    },
    userProfilePicture() {
      return this.user?.profilePicture
        ? `https://fermivo-backend.onrender.com/${this.user.profilePicture}`
        : `https://fermivo-backend.onrender.com/uploads/default_profile.jpg`;
    },
    anunturiFiltrate() {
      if (this.selectedCategory === "toate") return this.anunturi;

      if (this.selectedCategory === "favorite") {
        return this.anunturi.filter((a) =>
          this.favoriteAnunturi.includes(a._id)
        );
      }
      const selected = this.normalize(this.selectedCategory);
      return this.anunturi.filter(
        (anunt) => this.normalize(anunt.produs) === selected
      );
    },
  },
  async created() {
    const localUser = JSON.parse(localStorage.getItem("user"));

    if (localUser && localUser._id) {
      this.isLoggedIn = true;
      await this.fetchUser(localUser._id);
      await this.fetchFavorites();
    }
    this.fetchAnunturi();
    await this.fetchScraperData();
    this.fetchPredictii();
    this.startAutoplay();
  },
  mounted() {
    this.startAutoplay();
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("click", this.handleOutsideClick);
  },
  beforeDestroy() {
    clearInterval(this.autoplayInterval);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 1024;
    },
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
    async fetchScraperData() { // Funcția pentru a obține datele de la scraper
      try {
        const response = await axios.get( // Endpointul pentru scraper
          "https://fermivo-backend.onrender.com/scrape/brm"
        );
        if (response.data.success) { // Verificăm dacă cererea a fost un success
          this.scraperData = response.data; // Setăm datele primite de la scraper
        }
      } catch (error) { // Gestionăm erorile de la cererea de scraper
        console.error("❌ Eroare la fetch scraper:", error); // Logăm eroarea în consolă
      }
    },
    async fetchAnunturi() { // Fetch anunțuri de la backend
      try {
        const response = await axios.get(
          "https://fermivo-backend.onrender.com/api/anunturi" // Endpointul pentru anunțuri
        );
        if (response.data.success) { // Verificăm dacă cererea a fost un success
          this.anunturi = response.data.anunturi; // Setăm anunțurile primite
          this.anunturi.sort((a, b) => { // Sortăm anunțurile
            const aPremium = a.userId?.isPremium ? 1 : 0; // verificăm dacă utilizatorul este premium
            const bPremium = b.userId?.isPremium ? 1 : 0; // verificăm dacă utilizatorul este premium
            return bPremium - aPremium; // Afișăm anunțurile premium la început
          });
        }
      } catch (error) { // Gestionăm erorile de la cererea de anunțuri
        console.error("❌ Eroare la anunturi:", error); // Logăm eroarea în consolă
      }
    },
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
    getPreturiProdus(produs) {
      const mapping = {
        "Grau Panificatie": "grau_panificatie",
        "Grau Furajer": "grau_furajer",
        "Floarea Soarelui": "floarea_soarelui",
        Rapita: "rapita",
        Porumb: "porumb",
        Orz: "orz",
        "Orz Furajer": "orz_furajer",
      };
      const key = mapping[produs];
      return this.scraperData[key] || [];
    },
    async fetchFavorites() {
      try {
        const res = await axios.get(
          "https://fermivo-backend.onrender.com/api/users/favorites",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        this.favoriteAnunturi = res.data.map((anunt) => anunt._id);
      } catch (err) {
        console.error("❌ Eroare la fetch favorites:", err);
      }
    },
    isFavorite(anuntId) {
      return this.favoriteAnunturi.includes(anuntId);
    },
    async toggleFavorite(anuntId) {
      const isFav = this.isFavorite(anuntId);
      const url = `https://fermivo-backend.onrender.com/api/users/favorites/${anuntId}`;

      try {
        if (isFav) {
          await axios.delete(url, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });
          this.favoriteAnunturi = this.favoriteAnunturi.filter(
            (id) => id !== anuntId
          );
        } else {
          await axios.post(
            url,
            {},
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          this.favoriteAnunturi.push(anuntId);
        }
      } catch (err) {
        console.error("❌ Eroare la toggle favorite:", err);
      }
    },
    handleOutsideClick(event) {
      const menu = this.$el.querySelector(".menu-button");
      if (this.menuOpen && menu && !menu.contains(event.target)) {
        this.menuOpen = false;
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
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    normalize(text) {
      return text
        .toLowerCase()
        .normalize("NFD") // elimină diacritice
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "") // elimină spațiile
        .trim();
    },
  },
};
</script>

<style scoped>
.filtru-categorii {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem auto;
  justify-content: center;
}

.filtru-categorii button {
  background-color: #f0f0f0;
  color: #1b5e20;
  border: 1px solid #1b5e20;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s;
}

.filtru-categorii button.activ,
.filtru-categorii button:hover {
  background-color: #1b5e20;
  color: white;
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
  z-index: 2;
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
  font-size: 1.3rem;
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

/*
.menu {
  position: absolute;
  top: 60px;
  left: 15px;
  background: rgb(201, 223, 192);
  padding: 1rem;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 2;
}*/

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
  position: absolute;
  right: 2rem;
  top: 10rem;
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
