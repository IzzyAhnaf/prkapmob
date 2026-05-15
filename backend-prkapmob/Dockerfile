# Menggunakan base image Bun (karena Elysia berjalan di atas Bun)
FROM oven/bun:latest

# Menentukan folder kerja di dalam kontainer
WORKDIR /app

# Menyalin file konfigurasi package
COPY package.json ./
# Jika ada bun.lockb, uncomment baris di bawah ini
# COPY bun.lockb ./

# Menginstal dependensi
RUN bun install

# Menyalin seluruh kode source
COPY . .

# Membuka port yang digunakan Elysia
EXPOSE 3000

# Perintah untuk menjalankan server
CMD ["bun", "run", "src/index.ts"]