<template>
  <div class="welcome-page">
    <div class="header">
      <button class="menu-button" @click="toggleMenu">&#9776;</button>

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
      <router-link
        v-if="isLoggedIn && !isPremium && !isMobile"
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
              <router-link :to="`/editare-profil/${user._id}`">
                Editează Profil
              </router-link>
            </div>
          </div>
        </div>
        <button class="sign-out-button" @click="handleLogout">Sign Out</button>
      </div>
    </div>

    <img src="../assets/login.jpg" alt="Background" class="background-image" />

    <div class="data-container" v-if="isLoggedIn">
      <h2>Prețuri Cereale</h2>
      <p v-if="!isPremium" style="color: #888; font-size: 0.9rem">
        💡 Vezi toate prețurile activând contul Premium.
      </p>

      <table>
        <thead>
          <tr>
            <th>Zona</th>
            <th>Produs</th>
            <th>Preț (lei/tonă)</th>
            <th>Variație %</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in cereals"
            :key="index"
            :style="{
              backgroundColor: isPremium
                ? 'rgba(245, 241, 195, 0.2)'
                : 'transparent',
            }"
          >
            <td>{{ item.zona }}</td>
            <td>{{ item.produs }}</td>
            <td>{{ item.pret_lei_tona }}</td>
            <td
              :class="{
                positive: item.variatie_procente > 0,
                negative: item.variatie_procente < 0,
              }"
            >
              {{
                item.variatie_procente !== null
                  ? item.variatie_procente + "%"
                  : "N/A"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="data-container" v-else>
      <h2>Prețuri cereale</h2>
      <p>
        Această funcționalitate nu este disponibilă decât dacă sunteți
        autentificat. Vă rugăm să vă conectați sau să creați un cont.
      </p>
    </div>

    <nav v-if="menuOpen" class="menu">
      <ul v-if="isLoggedIn">
        <li v-if="isBuyer">
          <router-link to="/home-buyer">Acasă</router-link>
        </li>
        <li v-else>
          <router-link to="/home">Acasă</router-link>
        </li>
        <li v-if="isMobile"><router-link to="/predictii" v-if="isMobile">Vezi predicții de prețuri</router-link></li>
        <li v-if="isMobile && isPremium && isBuyer">
          <router-link to="/camioane-cumparator">Urmărește Șofer</router-link>
        </li>
        <li v-if="isMobile && !isPremium">
          <router-link to="/premium">Devino Premium</router-link>
        </li>
        <li v-if="isMobile"><router-link :to="`/editare-profil/${user._id}`" v-if="isMobile">Editează Profil</router-link></li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
      <ul v-else>
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/register">Register</router-link></li>
        <li><router-link to="/about">About</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "CheckPrices",
  data() {
    return {
      menuOpen: false,
      isLoggedIn: false,
      cereals: [], // Datele cerealelor
      user: JSON.parse(localStorage.getItem("user")),
      isPremium: false,
      showProfileMenu: false,
      isMobile: window.innerWidth <= 1024,
    };
  },
  computed: {
    isBuyer() {
      return this.user?.role === "buyer";
    },
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
  },
  created() {
    this.isLoggedIn = !!localStorage.getItem("token");

    if (this.isLoggedIn) {
      this.fetchUser().then(() => {
        this.fetchData();
      });
      setInterval(() => {
        this.fetchData();
      }, 5 * 60 * 1000); // reîncarcă datele la fiecare 5 minute
    }
  },
  mounted() {
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    window.removeEventListener("resize", this.handleResize);
    document.removeEventListener("click", this.handleOutsideClick);
  },
  methods: {
    handleResize() {
      this.isMobile = window.innerWidth <= 1024;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    async fetchUser() {
      try {
        const userId = this.user?._id;
        if (!userId) return;

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
    async fetchData() {
      try {
        const response = await axios.get(
          "https://fermivo-backend.onrender.com/scrape/brm"
        );
        console.log("📊 Date primite în frontend:", response.data);

        if (!response.data || !response.data.success) {
          console.error("⚠️ Backend nu a trimis date valide!");
          return;
        }

        // Transformăm datele primite pentru a fi afișate corect în tabel
        const parsedData = [];

        const isPremium = this.user?.isPremium;

        const categories = isPremium
          ? [
              { key: "grau_panificatie", name: "Grâu de panificație" },
              { key: "porumb", name: "Porumb" },
              { key: "grau_furajer", name: "Grâu furajer" },
              { key: "orz", name: "Orz" },
              { key: "orz_furajer", name: "Orz furajer" },
              { key: "floarea_soarelui", name: "Floarea soarelui" },
              { key: "rapita", name: "Rapiță" },
            ]
          : [
              { key: "grau_panificatie", name: "Grâu de panificație" },
              { key: "porumb", name: "Porumb" },
              { key: "orz_furajer", name: "Orz furajer" },
              { key: "rapita", name: "Rapiță" },
            ];

        categories.forEach((category) => {
          if (response.data[category.key]) {
            response.data[category.key].forEach((item) => {
              parsedData.push({
                zona: item.zona,
                produs: category.name,
                pret_lei_tona:
                  item.pret_lei_tona !== "-" ? item.pret_lei_tona : "N/A",
                variatie_procente:
                  item.variatie_procente !== "-"
                    ? item.variatie_procente
                    : null,
              });
            });
          }
        });

        console.log("📊 Date formatate pentru tabel:", parsedData);
        this.cereals = parsedData;
      } catch (error) {
        console.error("❌ Eroare la preluarea datelor:", error);
      }
    },
    handleOutsideClick(event) {
      const menu = this.$el.querySelector(".menu-button");
      if (this.menuOpen && menu && !menu.contains(event.target)) {
        this.menuOpen = false;
      }
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

/* Tabel cu date */
.data-container {
  background: rgba(255, 255, 255, 0.8);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 90%;
  width: 800px;
  text-align: center;
  margin-top: 2rem;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th,
td {
  padding: 10px;
  border: 1px solid #ddd;
}
th {
  background-color: #012f19;
  color: white;
}
.positive {
  color: green;
  font-weight: bold;
}
.negative {
  color: red;
  font-weight: bold;
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
</style>
