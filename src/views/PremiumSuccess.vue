<!-- PremiumSuccess.vue -->
<template>
  <div class="success-container">
    <h1>✅ Abonament Premium activat cu succes!</h1>
    <p>Îți mulțumim pentru susținere! Te bucuri acum de toate beneficiile Premium. 🌟</p>
    <router-link :to="homeRoute" class="home-button">Mergi la pagina principală</router-link>
  </div>
</template>

<script>
export default {
  computed: {
    homeRoute() {
      const user = JSON.parse(localStorage.getItem("user") || sessionStorage.getItem("user"));
      if (!user) return "/";
      if (user.role === "buyer") return "/home-buyer";
      if (user.role === "seller") return "/home";
      return "/";
    }
  }
};
</script>

<style scoped>
.success-container {
  text-align: center;
  margin-top: 4rem;
  font-family: 'Inria Sans', sans-serif;
}
.home-button {
  display: inline-block;
  margin-top: 2rem;
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 8px;
}
</style>
