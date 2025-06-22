<template>
  <img src="../assets/login.jpg" alt="Background" class="background-image" />
  <div class="anunt-details">
  <div class="content-box">
    <h1>Despre Fermivo</h1>
    <p>
      <strong>Fermivo</strong> este o platformă digitală agricolă ce pune în
      legătură <strong>fermieri</strong> și <strong>companii</strong> din
      România. Scopul nostru este să digitalizăm comerțul cu produse agricole,
      oferind un spațiu sigur, eficient și transparent pentru tranzacții.
    </p>
    <ul>
      <li>
        📈 Vezi prețurile curente ale cerealelor de pe Bursa Română de Mărfuri
        (BRM)
      </li>
      <li>
        🤖 Primește predicții automate despre evoluția prețurilor folosind
        inteligență artificială
      </li>
      <li>🛒 Publică și gestionează anunțuri de vânzare sau cumpărare</li>
      <li>💬 Comunică prin chat în timp real cu ceilalți utilizatori</li>
      <li>
        🌟 Cu un cont Premium, ai acces la promovarea anunțurilor și urmărirea
        camioanelor 🚚
      </li>
    </ul>
    <p>
      Fermivo sprijină viitorul agriculturii românești prin inovație și
      conectivitate. Hai alături de noi!
    </p>
    <p>Contactează-ne pentru mai multe informații sau întrebări la
    contact@fermivo.ro pentru mai multe informații.
    </p>
    <button class="btn-back" @click="$router.back()">Înapoi</button>
  </div>
  </div>
</template>

<script>
import axios from "../axios";

export default {
  data() {
    return {
      anunt: {},
      user: JSON.parse(localStorage.getItem("user")),
      selectedRating: 0,
      hasRated: false,
      average: null,
      numReviews: 0,
      favoriteAnunturi: [],
    };
  },
  computed: {
    isBuyer() {
      return this.user?.role === "buyer";
    },
    currentRating() {
      if (!this.anunt.userId?.reviews) return 0;
      const review = this.anunt.userId.reviews.find(
        (r) => r.userId === this.user._id
      );
      return review ? review.rating : 0;
    },
  },
  async created() {
    await this.fetchFavorites();
    await this.fetchAnunt();
  },
  methods: {
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

    async fetchAnunt() {
      const { id } = this.$route.params;
      const response = await axios.get(
        `https://fermivo-backend.onrender.com/api/anunturi/${id}`
      );
      this.anunt = response.data.anunt;
      this.selectedRating = this.currentRating;
      this.average = this.averageRatingCalc();
      this.numReviews = this.anunt.userId?.reviews?.length || 0;
    },
    averageRatingCalc() {
      if (!this.anunt.userId?.reviews?.length) return null;
      const sum = this.anunt.userId.reviews.reduce(
        (acc, r) => acc + r.rating,
        0
      );
      return (sum / this.anunt.userId.reviews.length).toFixed(1);
    },
    async rateUser(rating) {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `https://fermivo-backend.onrender.com/api/users/${this.anunt.userId._id}/rate`,
          { rating },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        this.selectedRating = rating;
        this.hasRated = true;
        this.average = response.data.average;
        this.numReviews = response.data.numReviews;

        alert("Mulțumim pentru feedback!");
      } catch (err) {
        console.error("Eroare rating:", err);
        alert("Eroare la trimiterea ratingului.");
      }
    },
    goToEdit() {
      this.$router.push(`/editare-anunt/${this.anunt._id}`);
    },
    async startConversation() {
      try {
        const response = await axios.post(
          "https://fermivo-backend.onrender.com/api/conversatii/start",
          {
            senderId: this.user._id,
            receiverId: this.anunt.userId,
          }
        );

        if (response.data.success) {
          const convId = response.data.conversatie._id;
          this.$router.push(`/chat/${convId}`);
        }
      } catch (err) {
        console.error("❌ Eroare la inițiere conversație:", err);
        alert("A apărut o eroare la inițierea conversației.");
      }
    },
    async deleteAnunt() {
      const confirmDelete = confirm("Sigur vrei să ștergi acest anunț?");
      if (confirmDelete) {
        const token = localStorage.getItem("token");
        await axios.delete(
          `https://fermivo-backend.onrender.com/api/anunturi/${this.anunt._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        alert("Anunț șters!");
        this.$router.push("/home");
      }
    },
  },
};
</script>

<style scoped>
.background-image {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
.btn-vanzator {
  color: #1b5e20;
  font-weight: bold;
  text-decoration: underline;
  cursor: pointer;
}
.btn-vanzator:hover {
  color: #0a3e13;
}

.link-vanzator {
  color: #0288d1;
  font-weight: bold;
  text-decoration: none;
}
.link-vanzator:hover {
  text-decoration: underline;
}

.anunt-details {
  background: rgba(197, 241, 186, 0.9);
  padding: 2rem;
  border-radius: 20px;
  max-width: 600px;
  margin: 5rem auto;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-family: "Inria Sans", sans-serif;
}

.anunt-details h1 {
  font-size: 2rem;
  color: #1b5e20;
  margin-bottom: 1rem;
}

.anunt-details p {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.btn-chat {
  background: linear-gradient(135deg, #0288d1, #03a9f4);
  color: white;
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}
.btn-chat:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.anunt-details button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s ease;
}
.anunt-details button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.anunt-details button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.anunt-details button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  cursor: pointer;
  margin-right: 1rem;
  transition: all 0.3s ease;
}

.btn-edit {
  background: linear-gradient(135deg, #1b5e20, #2e7d32);
  color: white;
}

.btn-delete {
  background: linear-gradient(135deg, #b71c1c, #e53935);
  color: white;
}

.btn-back {
  background: linear-gradient(135deg, #9e9e9e, #bdbdbd); /* gri */
  color: white;
}

.anunt-details button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
}

.anunt-details button:active {
  transform: translateY(0);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}
</style>
