<template>
  <div class="welcome-page">
    <div class="header">
      <button class="menu-button" @click="toggleMenu">&#9776;</button>
      <router-link to="/" class="site-title">Fermivo🌾</router-link>
      <router-link to="/login" class="sign-in-button">Sign In</router-link>
    </div>

    <img src="../assets/login.jpg" alt="Background" class="background-image" />

    <div class="content-box">
      <h1>Despre Fermivo</h1>
      <p>
        <strong>Fermivo</strong> este o platformă digitală agricolă ce pune în legătură
        <strong>fermieri</strong> și <strong>companii</strong> din România. Scopul nostru este să digitalizăm comerțul cu produse agricole, oferind un spațiu sigur, eficient și transparent pentru tranzacții.
      </p>
      <ul>
        <li>📈 Vezi prețurile curente ale cerealelor de pe Bursa Română de Mărfuri (BRM)</li>
        <li>🤖 Primește predicții automate despre evoluția prețurilor folosind inteligență artificială</li>
        <li>🛒 Publică și gestionează anunțuri de vânzare sau cumpărare</li>
        <li>💬 Comunică prin chat în timp real cu ceilalți utilizatori</li>
        <li>🌟 Cu un cont Premium, ai acces la promovarea anunțurilor și urmărirea camioanelor 🚚</li>
      </ul>
      <p>
        Fermivo sprijină viitorul agriculturii românești prin inovație și conectivitate. Hai alături de noi!
      </p>
      Contactează-ne pentru mai multe informații sau întrebări la contact@fermivo.ro pentru mai multe informații.
    </div>

    <nav v-if="menuOpen" class="menu">
      <ul v-if="!isLoggedIn">
        <li><router-link to="/login">Login</router-link></li>
        <li><router-link to="/register">Register</router-link></li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
      <ul v-else>
        <li v-if="isBuyer"><router-link to="/home-buyer">Acasă</router-link></li>
        <li v-else><router-link to="/home">Acasă</router-link></li>
        <li><router-link to="/check-prices">Vezi prețurile curente</router-link></li>
        <li><router-link to="/predictii">Vezi predicții de prețuri</router-link></li>
        <li v-if="isPremium && isBuyer"><router-link to="/camioane-cumparator">Urmărește Șofer</router-link></li>
        <li v-if="!isPremium"><router-link to="/premium">Devino Premium</router-link></li>
        <li><router-link to="/chat">Conversațiile tale</router-link></li>
        <li><router-link :to="`/editare-profil/${user._id}`">Editează Profil</router-link></li>
        <li><router-link to="/about">Despre noi</router-link></li>
      </ul>
    </nav>
  </div>
</template>

<script>
export default {
  name: "About",
  data() {
    return {
      menuOpen: false,
      isLoggedIn: false,
      isPremium: false,
      isBuyer: false,
      user: null,
    };
  },
  created() {
    const localUser = JSON.parse(localStorage.getItem("user"));
    if (localUser) {
      this.isLoggedIn = true;
      this.user = localUser;
      this.isPremium = localUser.isPremium;
      this.isBuyer = localUser.rol === "buyer";
    }
  },
  methods: {
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
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

.site-title {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 1.5rem;
  font-weight: bold;
  color: #1b5e20;
  text-decoration: none;
  font-family: "Inria Sans", sans-serif;
  cursor: pointer;
}

.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  object-fit: cover;
}

.header {
  display: flex;
  justify-content: space-between;
  width: 100%;
  background: rgba(253, 253, 253, 0.9);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  z-index: 1;
}

.content-box {
  background: rgba(217, 227, 194, 0.8);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.9);
  max-width: 800px;
  width: 95%;
  text-align: left;
  margin-top: 4rem;
  color: #1b5e20;
  font-size: 1.3rem;
}

.content-box h1 {
  font-size: 2.5rem;
  color: rgba(0, 114, 31, 1);
}

.content-box ul {
  margin-top: 1rem;
  padding-left: 1.5rem;
  list-style-type: none;
}

.content-box li {
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.sign-in-button {
  background-color: #1b5e20;
  color: rgb(249, 250, 248);
  text-decoration: none;
  max-height: min-content;
  padding: 0.5rem 1rem;
  margin-top: 1rem;
  border-radius: 7px;
  font-size: 1rem;
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

@media (max-width: 768px) {
  .content {
    width: 90%;
    text-align: center;
    padding: 15px;
  }
  h1 {
    font-size: 32px;
  }
  p {
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .content {
    width: 90%;
    text-align: center;
    padding: 15px;
  }
  .text-box {
    padding: 15px;
  }
  h1 {
    font-size: 32px;
  }
  p {
    font-size: 16px;
  }
  .sign-in-btn {
    font-size: 14px;
    padding: 8px 16px;
  }
  .menu-btn {
    font-size: 20px;
  }
}
</style>
