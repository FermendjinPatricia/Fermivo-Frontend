<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-2">📤 Conținut primit prin Share</h2>
    <p v-if="title"><strong>Titlu:</strong> {{ title }}</p>
    <p v-if="text"><strong>Text:</strong> {{ text }}</p>
    <p v-if="url"><strong>URL:</strong> <a :href="url" class="text-blue-600 underline">{{ url }}</a></p>
    <div v-if="fileUrl">
      <strong>Fișier:</strong>
      <img v-if="isImage" :src="fileUrl" alt="Preview" class="mt-2 w-64" />
      <p v-else><a :href="fileUrl" download>Descarcă fișier</a></p>
    </div>
  </div>
</template>

<script>
export default {
  name: "ShareReceiver",
  data() {
    return {
      title: '',
      text: '',
      url: '',
      fileUrl: null,
      isImage: false
    };
  },
  async mounted() {
    if ('launchQueue' in window && 'files' in LaunchParams.prototype) {
      window.launchQueue.setConsumer(async (launchParams) => {
        if (!launchParams.files.length) return;

        const fileHandle = launchParams.files[0];
        const file = await fileHandle.getFile();
        this.fileUrl = URL.createObjectURL(file);
        this.isImage = file.type.startsWith("image/");
      });
    }

    // fallback pentru POST cu form data
    const formData = await this.readFormData();
    if (formData) {
      this.title = formData.get("title") || '';
      this.text = formData.get("text") || '';
      this.url = formData.get("url") || '';

      const file = formData.get("file");
      if (file && file.name) {
        this.fileUrl = URL.createObjectURL(file);
        this.isImage = file.type.startsWith("image/");
      }
    }
  },
  methods: {
    async readFormData() {
      try {
        const response = await fetch(window.location.href, {
          method: "POST"
        });
        return await response.formData();
      } catch (err) {
        return null;
      }
    }
  }
};
</script>
