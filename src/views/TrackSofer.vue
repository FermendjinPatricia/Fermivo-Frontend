<template>
  <div class="track-page">
    <h2>Bun venit! 🚛</h2>
    <p>
      Introduceți numele dumneavoastră și permiteți locația pentru a fi urmărit
      de cumpărător.
    </p>

    <form @submit.prevent="startTracking">
      <input v-model="driverName" placeholder="Nume șofer" required />
      <button type="submit">Permite locația</button>
      <button @click="anuleazaPartajarea" class="anuleaza-btn">
        Oprește partajarea
      </button>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "TrackPage",
  data() {
    return {
      driverName: "",
      intervalId: null,
    };
  },
  methods: {
    async anuleazaPartajarea() {
      try {
        const token = this.$route.params.token;
        const res = await axios.patch(
          `https://fermivo-backend.onrender.com/api/trackers/${token}/cancel`
        );
        alert("Ai oprit partajarea locației.");
        console.log(res.data);
      } catch (err) {
        if (err.response) {
          console.error(
            "⚠️ Backend a răspuns cu eroare:",
            err.response.status,
            err.response.data
          );
          alert("Eroare la anulare: " + err.response.data.message);
        } else {
          console.error("❌ Eroare rețea:", err);
          alert("Eroare la anulare: Network Error");
        }
      }
    },
    async startTracking() {
      const token = this.$route.params.token;

      if (!navigator.geolocation) {
        alert("Geolocația nu este suportată de acest browser.");
        return;
      }

      navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            await axios.post(
              `https://fermivo-backend.onrender.com/api/trackers/${token}/location`,
              {
                lat: latitude,
                lng: longitude,
                driverName: this.driverName,
              }
            );
          } catch (err) {
            console.error("Eroare la trimiterea locației:", err);
          }
        },
        (error) => {
          alert("Eroare la obținerea locației: " + error.message);
        },
        { enableHighAccuracy: true }
      );
    },
  },
};
</script>

<style scoped>
.track-page {
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
}
input {
  padding: 0.5rem;
  margin-top: 1rem;
  width: 100%;
}
button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
}
</style>
