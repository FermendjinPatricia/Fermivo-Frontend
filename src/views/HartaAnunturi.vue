<template>
  <div class="welcome-page">
    <div class="header">
      <button class="menu-button" @click="toggleMenu">&#9776;</button>

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
        <div class="header-right" v-if="isLoggedIn && user && !isMobile">
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

    <!-- BACKGROUND -->
    <img src="../assets/login.jpg" alt="Background" class="background-image" />

    <!-- HARTA -->
    <!-- FILTRU -->
    <div class="filtru-categorii">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="{ activ: selectedCategory === cat }"
        @click="handleCategoryClick(cat)"
      >
        {{ cat }}
      </button>
      <button
        :class="{ activ: selectedCategory === 'favorite' }"
        @click="selectedCategory = 'favorite'"
      >
        ❤️ Favorite
      </button>
    </div>

    <!-- HARTA -->
    <div class="map-wrapper">
      <MapComponent
        ref="map"
        :anunturi="anunturiFiltrate"
        :key="selectedCategory"
        @marker-clicked="handleMarkerClick"
      />
    </div>

    <div
      v-for="anunt in selectedAnunturi"
      :key="anunt._id"
      id="anunt-selectat"
      class="anunt-card"
      style="margin-top: 1rem"
    >
      <div class="anunt-info">
        <p>
          <strong>{{ anunt.produs }}</strong>
        </p>
        <p>
          Preț: {{ anunt.pret_lei_tona }}
          {{ anunt.moneda === "euro" ? "€" : "lei" }}/tonă
        </p>
        <p>Județ: {{ anunt.judet }}</p>
        <p>Localitate: {{ anunt.localitate }}</p>

        <router-link :to="`/anunturi/${anunt._id}`" class="detalii-button">
          Vezi detalii
        </router-link>

        <button
          @click="
            selectedAnunturi = selectedAnunturi.filter(
              (a) => a._id !== anunt._id
            )
          "
          class="ascunde-button"
        >
          ✖️ Ascunde anunțul
        </button>

        <div style="text-align: right; margin-bottom: 8px">
          <span
            style="font-size: 1rem; cursor: pointer"
            :style="{ color: black }"
            @click="toggleFavorite(anunt._id)"
            title="Adaugă la favorite"
          >
            Adaugă la favorite {{ isFavorite(anunt._id) ? "❤️" : "🤍" }}
          </span>
        </div>
      </div>
    </div>

    <nav v-if="menuOpen" class="menu">
      <ul v-if="isLoggedIn">
        <li v-if="isBuyer">
          <router-link to="/home-buyer">Acasă</router-link>
        </li>
        <li>
          <router-link to="/check-prices">Vezi prețurile curente</router-link>
        </li>
        <li>
          <router-link to="/predictii">Vezi predicții de prețuri</router-link>
        </li>
        <li v-if="isPremium && isBuyer">
          <router-link to="/camioane-cumparator">Urmărește Șofer</router-link>
        </li>
        <li v-if="!isPremium">
          <router-link to="/premium">Devino Premium</router-link>
        </li>
        <li><router-link to="/chat">Conversațiile tale</router-link></li>
        <li>
          <router-link :to="`/editare-profil/${user._id}`"
            >Editează Profil</router-link
          >
        </li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
    </nav>
  </div>
</template>
<script>
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "HartaAnunturi",
  components: { MapComponent },
  data() {
    return {
      user: null,
      isLoggedIn: false,
      isPremium: false,
      showProfileMenu: false,
      menuOpen: false,
      isMobile: window.innerWidth <= 1024,
      anunturi: [],
      favoriteAnunturi: [],
      selectedCategory: "toate",
      selectedAnunturi: [],
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
        ? `https://fermivo-backend.onrender.com/api/${this.user.profilePicture}`
        : `https://fermivo-backend.onrender.com/api/uploads/default_profile.jpg`;
    },
    anunturiFiltrate() {
      if (this.selectedCategory === "toate") return this.anunturi;
      if (this.selectedCategory === "favorite") {
        return this.anunturi.filter((a) =>
          this.favoriteAnunturi.includes(a._id)
        );
      }
      const selected = this.normalize(this.selectedCategory);
      return this.anunturi.filter((a) => this.normalize(a.produs) === selected);
    },
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("click", this.handleOutsideClick);
  },
  async created() {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser && localUser._id) {
      this.isLoggedIn = true;
      await this.fetchUser(localUser._id);
      await this.fetchFavorites();
    }
    await this.fetchAnunturi();
  },
  methods: {
    isFavorite(anuntId) {
      return this.favoriteAnunturi.includes(anuntId);
    },
    async toggleFavorite(anuntId) {
      const url = `https://fermivo-backend.onrender.com/api/users/favorites/${anuntId}`;
      const isFav = this.isFavorite(anuntId);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        };
        if (isFav) {
          await fetch(url, { method: "DELETE", ...config });
          this.favoriteAnunturi = this.favoriteAnunturi.filter(
            (id) => id !== anuntId
          );
        } else {
          await fetch(url, { method: "POST", ...config });
          this.favoriteAnunturi.push(anuntId);
        }
      } catch (err) {
        console.error("❌ Eroare la toggle favorite:", err);
      }
    },
    async fetchFavorites() {
      try {
        const res = await fetch(
          "https://fermivo-backend.onrender.com/api/users/favorites",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const data = await res.json();
        this.favoriteAnunturi = data.map((a) => a._id);
      } catch (err) {
        console.error("❌ Eroare la fetch favorites:", err);
      }
    },

    handleMarkerClick(anunt) {
      const exists = this.selectedAnunturi.some((a) => a._id === anunt._id);
      if (!exists) {
        this.selectedAnunturi.push(anunt);
      }

      this.$nextTick(() => {
        const el = this.$el.querySelector(`#anunt-selectat`);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
    },
    handleResize() {
      this.isMobile = window.innerWidth <= 1024;
    },
    handleOutsideClick(event) {
      const menu = this.$el.querySelector(".menu-button");
      if (this.menuOpen && menu && !menu.contains(event.target)) {
        this.menuOpen = false;
      }
    },
    normalize(text) {
      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .trim();
    },
    handleCategoryClick(cat) {
      this.selectedCategory = cat;
    },
    async fetchAnunturi() {
      try {
        const res = await fetch(
          "https://fermivo-backend.onrender.com/api/anunturi"
        );
        const data = await res.json();
        this.anunturi = data.anunturi || [];
      } catch (err) {
        console.error("❌ Eroare la fetch anunturi:", err);
      }
    },
    async fetchUser(id) {
      const res = await fetch(
        `https://fermivo-backend.onrender.com/api/users/${id}`
      );
      const data = await res.json();
      if (data.success) {
        this.user = data.user;
        this.isPremium = data.user.isPremium;
      }
    },
    toggleProfileMenu() {
      this.menuOpen = !this.menuOpen;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.isLoggedIn = false;
      this.$router.push("/login");
    },
  },
};
</script>

<style scoped>
html,
body {
  overflow: hidden;
  height: 100%;
  margin: 0;
  padding: 0;
}
.welcome-page {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
.anunt-card {
  background: rgba(197, 241, 186, 0.9);
  padding: 1.5rem;
  border-radius: 20px;
  max-width: 600px;
  width: 95%;
  margin: 1.5rem auto 1rem auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-family: "Inria Sans", sans-serif;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #1b5e20;
}

.favorite-icon {
  font-size: 1.8rem;
  cursor: pointer;
  transition: transform 0.2s ease;
}
.favorite-icon:hover {
  transform: scale(1.2);
}

.anunt-card p {
  font-size: 1.1rem;
  color: #1b5e20;
  margin: 0.2rem 0;
  font-weight: bold;
}

.anunt-buttons {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-vezi,
.btn-ascunde {
  padding: 0.5rem 1.2rem;
  border-radius: 10px;
  font-weight: bold;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.btn-vezi {
  background-color: #1b5e20;
  color: white;
}
.btn-vezi:hover {
  background-color: #093b12;
  transform: translateY(-2px);
}

.btn-ascunde {
  background-color: #9e9e9e;
  color: white;
}
.btn-ascunde:hover {
  background-color: #777;
  transform: translateY(-2px);
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

.ascunde-button {
  margin-top: 0.5rem;
  background-color: #888; /* gri */
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  font-weight: bold;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, transform 0.2s;
}
.ascunde-button:hover {
  background-color: #666;
  transform: translateY(-2px);
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

.map-wrapper {
  margin: 2rem auto;
  width: 95%;
  max-width: 1000px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 2px solid #1b5e20;
}
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
  z-index: 1;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
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
  width: 100%;
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

  .anunt-card {
    padding: 1rem;
  }

  .card-header h2 {
    font-size: 1.3rem;
  }

  .anunt-card p {
    font-size: 1rem;
  }

  .btn-vezi,
  .btn-ascunde {
    font-size: 0.9rem;
    padding: 0.4rem 1rem;
  }

  .data-container {
    padding: 0.5rem;
    width: 95%;
    max-width: 100%;
    overflow-x: auto;
  }

  table {
    width: 100%;
    font-size: 0.75rem;
  }

  th,
  td {
    padding: 6px;
    word-break: break-word;
  }

  .site-title {
    font-size: 1.2rem;
  }

  .sign-out-button {
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
  }

  .menu-button {
    font-size: 1.5rem;
  }
}
</style>
