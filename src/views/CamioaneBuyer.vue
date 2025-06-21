<template>
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
            <router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link>
          </div>
        </div>

        <button v-if="isLoggedIn" class="sign-out-button" @click="handleLogout">
          Sign Out
        </button>
      </div>
    </div>

    <!-- CONȚINUT CAMIOANE -->
    <div class="camioane-page">
      <h2>Camioanele Mele 🚛</h2>

      <div v-if="camioane.length === 0">Nu există camioane active în acest moment.</div>

      <ul class="camioane-list">
        <li v-for="c in camioane" :key="c._id">
          <strong>{{ c.driverName }}</strong>
          <span v-if="c.lat && c.lng">📍 activ</span>
          <span v-else>🕒 așteaptă acceptul</span>
          <button @click="dezactiveaza(c._id)" class="deactivate-btn">Dezactivează urmărirea</button>
        </li>
      </ul>

      <button class="genereaza-btn" @click="genereazaLink">Generează link nou</button>

      <MapComponent v-if="camioane.length" :anunturi="camioane" />
    </div>

    <!-- MENIU MOBIL -->
    <nav v-if="menuOpen" class="menu">
      <ul>
        <li><router-link to="/home-buyer">Home</router-link></li>
        <li><router-link to="/check-prices">Check prices</router-link></li>
        <li v-if="isMobile"><router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link></li>
        <li v-if="isMobile"><router-link to="/predictii">Vezi predicții</router-link></li>
        <li v-if="isMobile && isPremium"><router-link to="/camioane-cumparator">Urmărește Șofer</router-link></li>
        <li v-if="isMobile && !isPremium"><router-link to="/premium">Devino Premium</router-link></li>
        <li><router-link to="/about">Despre</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
import axios from "axios";
import MapComponent from "@/components/MapComponent.vue";

export default {
  name: "CamioaneBuyer",
  components: { MapComponent },
  data() {
    return {
      camioane: [],
      user: null,
      isMobile: window.innerWidth <= 1024,
      menuOpen: false,
      showProfileMenu: false,
      isPremium: false,
      isLoggedIn: false,
    };
  },
  computed: {
    userName() {
      return this.user ? `${this.user.nume} ${this.user.prenume}` : "Utilizator";
    },
    userProfilePicture() {
      return this.user?.profilePicture
        ? `https://fermivo-backend.onrender.com/${this.user.profilePicture}`
        : `https://fermivo-backend.onrender.com/uploads/default_profile.jpg`;
    },
  },
  methods: {
    async fetchCamioane() {
      try {
        const res = await axios.get(`https://fermivo-backend.onrender.com/api/trackers/buyer/${this.user._id}`);
        this.camioane = res.data.trackers.map((t) => ({
          _id: t._id,
          driverName: t.driverName,
          lat: t.lat,
          lng: t.lng,
          produs: t.driverName,
        }));
      } catch (e) {
        console.error("Eroare la fetch camioane:", e);
      }
    },
    async dezactiveaza(id) {
      if (!confirm("Ești sigur că vrei să dezactivezi urmărirea acestui șofer?")) return;
      try {
        await axios.delete(`https://fermivo-backend.onrender.com/api/trackers/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.fetchCamioane();
      } catch (e) {
        console.error("Eroare la dezactivare:", e);
      }
    },
    async genereazaLink() {
      const nume = prompt("Numele șoferului:");
      if (!nume) return;
      try {
        const res = await axios.post(
          "https://fermivo-backend.onrender.com/api/trackers/generate-link",
          { driverName: nume },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }
        );
        alert("Link generat: " + res.data.link);
        this.fetchCamioane();
      } catch (e) {
        console.error("Eroare la generare link:", e);
      }
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
    },
    toggleProfileMenu() {
      this.showProfileMenu = !this.showProfileMenu;
    },
    handleLogout() {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      this.$router.push("/login");
    },
  },
  async mounted() {
    this.user = JSON.parse(localStorage.getItem("user"));
    this.isLoggedIn = !!this.user;
    this.isPremium = this.user?.isPremium || false;
    await this.fetchCamioane();
    setInterval(this.fetchCamioane, 10000);
  },
};
</script>

<style scoped>
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

.header-left {
  display: flex;
  align-items: center;
  gap: 5rem;
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
  align-items: center;
  gap: 8px;
}

.truck-button {
  background-color: #320bbe;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
}
.truck-button:hover {
  background-color: #658ec8;
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

/* Butoane Login/Logout */
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

/* Meniu responsive */
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

@media (max-width: 1024px) {
  .site-title {
    margin: 0 auto;
    font-size: 1rem;
  }
}
.camioane-page {
  padding: 2rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  margin: 2rem auto;
  max-width: 800px;
  width: 95%;
  font-family: "Inria Sans", sans-serif;
}

.camioane-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}

.camioane-list li {
  margin-bottom: 0.5rem;
  background: rgba(197, 241, 186, 0.8);
  padding: 0.6rem 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.deactivate-btn {
  padding: 0.3rem 0.7rem;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.genereaza-btn {
  padding: 0.6rem 1.2rem;
  background-color: #009688;
  color: white;
  border: none;
  border-radius: 8px;
  margin-top: 1rem;
  margin-bottom: 2rem;
  cursor: pointer;
}

.deactivate-btn {
  margin-left: 1rem;
  padding: 0.3rem 0.7rem;
  background: #e53935;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.camioane-page {
  padding: 2rem;
}
.camioane-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0;
}
.camioane-list li {
  margin-bottom: 0.5rem;
}
.genereaza-btn {
  padding: 0.6rem 1.2rem;
  background-color: #009688;
  color: white;
  border: none;
  border-radius: 8px;
  margin-bottom: 2rem;
  cursor: pointer;
}
</style>
