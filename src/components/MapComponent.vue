<template>
  <div id="map" style="width: 100%; height: 500px"></div>
</template>

<script>
export default {
  name: "MapComponent",
  props: {
    anunturi: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      map: null,
      markers: [],
    };
  },
  watch: {
    anunturi: {
      handler(newData) {
        this.setMarkers([...newData]); // forțăm o instanță nouă
      },
      deep: true, // 🟢 foarte important!
      immediate: true,
    },
  },
  mounted() {
    this.loadGoogleMaps().then(() => {
      this.initMap();
      this.setMarkers(this.anunturi);
    });
  },
  methods: {
    loadGoogleMaps() { // încărcăm Google Maps API
      return new Promise((resolve) => { // Folosim Promise pentru a aștepta încărcarea scriptului
        if (window.google) return resolve(); 
        const script = document.createElement("script"); // creăm un element script
        const apiKey = process.env.VUE_APP_GOOGLE_MAPS_API_KEY; // obținem cheia API din .env
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapCallback`; // adăugăm cheia API și callback-ul
        script.async = true; // încărcăm scriptul în mod asincron
        script.defer = true; // defer pentru a nu bloca încărcarea paginii
        window.initMapCallback = resolve; // definim callback-ul care va fi apelat când scriptul este încărcat
        document.head.appendChild(script); // adăugăm scriptul în head-ul documentului
      });
    },
    initMap() {
      this.map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 45.9432, lng: 24.9668 },
        zoom: 7,
      });
    },
    clearMarkers() {
      this.markers.forEach((marker) => marker.setMap(null));
      this.markers = [];
    },
    setMarkers(anunturi) { // Metodă pentru a seta markerii pe hartă
      if (!this.map) return; // Verificăm dacă harta este inițializată
      this.clearMarkers(); // Curățăm markerii anteriori
      anunturi.forEach((anunt) => { // Iterăm prin fiecare anunț
        if (anunt.lat && anunt.lng) { // Verificăm dacă anunțul are coordonate
          const marker = new google.maps.Marker({ // Creăm un nou marker
            position: { lat: anunt.lat, lng: anunt.lng }, // Setăm poziția markerului
            map: this.map, // Asociem markerul cu harta
            title: anunt.produs || "Camion", // Titlul markerului
          }); 
          // Verificăm dacă este un anunț sau un camion
          let content = ""; // Inițializăm conținutul pentru InfoWindow
          if (anunt.pret_lei_tona && anunt.moneda) { // Dacă anunțul are preț și monedă
            content = `<strong>${anunt.produs}</strong><br/>
          ${anunt.judet || ""} - ${anunt.localitate || ""}<br/>
          ${anunt.pret_lei_tona} ${anunt.moneda}/tonă`; // Afișăm detalii despre produs
          } else { // Dacă este un camion
            content = `<strong>Camion: ${anunt.produs || "Șofer necunoscut"}</strong>`; // Afișăm detalii despre camion
          }
          const info = new google.maps.InfoWindow({ content }); // Creăm un InfoWindow cu conținutul specificat
          marker.addListener("click", () => { // Adăugăm un listener pentru click pe marker
            info.open(this.map, marker); // Deschidem InfoWindow la click
            this.$emit("marker-clicked", anunt); // ⬅️ emitere spre HartaAnunturi.vue
          });
          this.markers.push(marker); // Adăugăm markerul la lista de markerii
        }
      });
    },
    setMarkerData(newData) {
      this.setMarkers(newData);
    },
  },
};
</script>
