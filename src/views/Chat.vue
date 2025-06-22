<template>
  <img src="../assets/login.jpg" alt="Background" class="background-image" />
  <div class="chat-page">
    <div class="chat-header">
      <h2>
        <span
          v-if="otherUser"
          @click="goToUserProfile"
          style="cursor: pointer; text-decoration: underline; color: #1b5e20"
        >
          {{ otherUser.nume }} {{ otherUser.prenume }}
        </span>
      </h2>
      <button @click="goToChat" class="btn-back">Înapoi</button>
      <div class="menu-wrapper">
        <button class="menu-button" @click="toggleMenu">⋮</button>
        <div class="menu-options" v-if="showMenu">
          <p @click="confirmDelete">🗑️ Șterge conversația</p>
          <p @click="showReportModal = true">🚩 Raportează utilizatorul</p>
          <p v-if="!isBlocked" @click="blockUser">🚫 Blochează utilizatorul</p>
          <p v-else @click="unblockUser">🔓 Deblochează utilizatorul</p>
        </div>
      </div>
    </div>

    <div class="chat-box" ref="chatBox">
      <div
        v-for="msg in messages"
        :key="msg._id"
        :class="['message', msg.senderId === user._id ? 'sent' : 'received']"
      >
        <p class="text">{{ msg.text }}</p>
        <p class="time">{{ formatDate(msg.createdAt) }}</p>
      </div>
    </div>

    <form class="chat-input" @submit.prevent="sendMessage">
      <input
        v-model="newMessage"
        :disabled="wasBlocked"
        type="text"
        placeholder="Scrie un mesaj..."
        required
      />
      <button :disabled="wasBlocked" type="submit">Trimite</button>
    </form>

    <div v-if="wasBlocked" class="blocked-banner">
      Ai fost blocat de acest utilizator. Nu poți trimite mesaje.
    </div>

    <div v-if="showReportModal" class="modal-overlay">
      <div class="modal">
        <h3>Raportează utilizatorul</h3>

        <label>Motiv:</label>
        <select v-model="reportReason">
          <option disabled value="">-- Selectează motivul --</option>
          <option v-for="reason in availableReasons" :key="reason">
            {{ reason }}
          </option>
        </select>

        <label>Descriere:</label>
        <textarea
          v-model="reportText"
          placeholder="Scrie detalii..."
        ></textarea>

        <div class="modal-actions">
          <button @click="submitReport">Trimite raport</button>
          <button @click="showReportModal = false">Anulează</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "../axios";

export default {
  name: "Chat",
  data() {
    return {
      user: JSON.parse(localStorage.getItem("user")),
      messages: [],
      newMessage: "",
      convId: null,
      otherUser: null,
      showMenu: false,
      showReportModal: false,
      reportReason: "",
      reportText: "",
      availableReasons: [
        "Comportament abuziv",
        "Fraudă / Înșelătorie",
        "Limbaj neadecvat",
        "Alt motiv",
      ],
      isBlocked: false,
      wasBlocked: false,
    };
  },
  mounted() {
    document.addEventListener("click", this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleOutsideClick);
  },

  async created() {
    this.convId = this.$route.params.id;
    if (!this.convId) {
      console.error("❌ Lipsă convId în URL");
      return;
    }

    await this.fetchConversation();
    await this.fetchMessages();
  },
  methods: {
    goToChat() {
      this.$router.push("/chat");
    },
    goToUserProfile() {
      this.$router.push({
        path: `/profil-utilizator/${this.otherUser._id}`,
        query: { from: this.$route.fullPath },
      });
    },
    toggleMenu() {
      this.showMenu = !this.showMenu;
    },
    async fetchMessages() {
      try {
        const res = await axios.get(`/conversatii/${this.convId}/messages`);
        if (res.data.success) {
          this.messages = res.data.messages;
          this.$nextTick(() => this.scrollToBottom());
        }
      } catch (err) {
        console.error("❌ Eroare la fetch mesaje:", err);
      }
    },
    async fetchConversation() {
      try {
        const res = await axios.get(`/conversatii/id/${this.convId}`);
        const conv = res.data.conversatie;
        this.otherUser = conv.participants.find((p) => p._id !== this.user._id);
        await this.checkIfBlocked(); // aici verific dacă e blocat
        await this.checkIfWasBlocked(); // aici verific dacă am fost blocat
      } catch (err) {
        console.error("❌ Eroare la fetch conversație:", err);
      }
    },
    async sendMessage() {
      if (!this.newMessage.trim()) return;
      try {
        const res = await axios.post(`/conversatii/${this.convId}/messages`, {
          text: this.newMessage,
          senderId: this.user._id,
        });

        if (res.data.success) {
          this.messages.push(res.data.message);
          this.newMessage = "";
          this.$nextTick(() => this.scrollToBottom());
        }
      } catch (err) {
        console.error("❌ Eroare la trimitere mesaj:", err);
      }
    },

    handleOutsideClick(event) {
      const menu = this.$el.querySelector(".menu-wrapper");
      if (this.showMenu && menu && !menu.contains(event.target)) {
        this.showMenu = false;
      }
    },
    async submitReport() {
      if (!this.reportReason || !this.reportText.trim()) {
        return;
      }

      try {
        await axios.post("/reports", {
          reporterId: this.user._id,
          reportedId: this.otherUser._id,
          reason: this.reportReason,
          description: this.reportText,
        });
        this.showReportModal = false;
        this.reportReason = "";
        this.reportText = "";
      } catch (err) {
        console.error("❌ Eroare la raportare:", err);
      }
    },
    async confirmDelete() {
      if (confirm("Ești sigur că vrei să ștergi conversația?")) {
        try {
          await axios.delete(`/conversatii/${this.convId}`);
          this.$router.push("/chat");
        } catch (err) {
          console.error("❌ Eroare la ștergerea conversației:", err);
        }
      }
    },
    async blockUser() {
      if (
        confirm(
          "Ești sigur că vrei să blochezi acest utilizator? Nu vei mai primi mesaje de la el."
        )
      ) {
        try {
          await axios.post("/blocked", {
            blockerId: this.user._id,
            blockedId: this.otherUser._id,
          });
          alert("Utilizator blocat.");
          this.$router.push("/chat/:id"); // redirecționare, opțional
        } catch (err) {
          console.error("❌ Eroare la blocare:", err);
        }
      }
    },

    async checkIfBlocked() {
      try {
        const res = await axios.get(
          `/blocked/${this.user._id}/${this.otherUser._id}`
        );
        this.isBlocked = res.data.blocked;
      } catch (err) {
        console.error("❌ Eroare la verificare blocare:", err);
      }
    },
    async checkIfWasBlocked() {
      try {
        const res = await axios.get(
          `/blocked/${this.otherUser._id}/${this.user._id}`
        );
        this.wasBlocked = res.data.blocked;
      } catch (err) {
        console.error("❌ Eroare la verificare blocare inversă:", err);
      }
    },
    async unblockUser() {
      if (
        confirm("Deblochezi acest utilizator? Veți putea comunica din nou.")
      ) {
        try {
          await axios.delete("/blocked", {
            data: {
              blockerId: this.user._id,
              blockedId: this.otherUser._id,
            },
          });
          this.isBlocked = false;
        } catch (err) {
          console.error("❌ Eroare la deblocare:", err);
        }
      }
    },

    formatDate(date) {
      return new Date(date).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    scrollToBottom() {
      const el = this.$refs.chatBox;
      if (el) el.scrollTop = el.scrollHeight;
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
.chat-page {
  max-width: 700px;
  margin: 4rem auto;
  padding: 1rem;
  background: #f1f8e9;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  height: 80vh;
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  color: #1b5e20;
}

.menu-wrapper {
  position: relative;
}

.menu-button {
  font-size: 2rem;
  background: rgba(217, 242, 208, 1);
  border: none;
  border-radius: 8px;
  cursor: pointer;
  color: #1b5e20;
  padding: 0.2rem 0.6rem;
  transition: background-color 0.2s ease;
}

.menu-button:hover {
  background-color: #c5e1a5;
}

.menu-options {
  position: absolute;
  top: 40px;
  right: 0;
  background: white;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 200px;
  font-family: "Inria Sans", sans-serif;
}

.menu-options p {
  margin: 10px 0;
  cursor: pointer;
  font-weight: bold;
  color: #1b5e20;
  transition: color 0.2s ease;
}

.menu-options p:hover {
  text-decoration: underline;
  color: #33691e;
}

.modal {
  background: #f1f8e9;
  padding: 2rem;
  border-radius: 16px;
  max-width: 450px;
  width: 90%;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  font-family: "Inria Sans", sans-serif;
}

.modal h3 {
  color: #1b5e20;
  margin-bottom: 1rem;
  text-align: center;
}

.modal label {
  display: block;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #2e7d32;
}

.modal textarea,
.modal select {
  width: 100%;
  margin-bottom: 1rem;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  font-size: 0.95rem;
}

.modal textarea::placeholder {
  color: #999;
}

.modal-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-actions button {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

.modal-actions button:first-child {
  background-color: #1b5e20;
  color: white;
}

.modal-actions button:first-child:hover {
  background-color: #093b12;
}

.modal-actions button:last-child {
  background-color: #b71c1c;
  color: white;
}

.modal-actions button:last-child:hover {
  background-color: #7f0000;
}


.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}
/* 
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  max-width: 400px;
  width: 90%;
}

.modal textarea,
.modal select {
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 1rem;
  padding: 0.5rem;
}

.modal-actions {
  display: flex;
  justify-content: space-between;
} */

.chat-box {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  border-radius: 8px;
  background: white;
}

.message {
  margin-bottom: 1rem;
  max-width: 70%;
  padding: 0.6rem;
  border-radius: 12px;
}

.sent {
  background: #c8e6c9;
  align-self: flex-end;
  margin-left: auto;
  text-align: right;
}

.received {
  background: #e0f2f1;
  align-self: flex-start;
  margin-right: auto;
  text-align: left;
}

.text {
  margin: 0;
  font-weight: bold;
}

.time {
  font-size: 0.75rem;
  color: gray;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.chat-input input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 8px;
  border: 1px solid #ccc;
}

.chat-input button {
  background-color: #1b5e20;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-back {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 0.4rem 1rem;
  border-radius: 8px;
  cursor: pointer;
}

.blocked-banner {
  background: #ffebee;
  color: #c62828;
  padding: 0.7rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-weight: bold;
  text-align: center;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
</style>
