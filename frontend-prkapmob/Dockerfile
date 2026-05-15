# Menggunakan base image Node.js
FROM node:22-alpine

# Menentukan folder kerja di dalam kontainer
WORKDIR /app

# Menyalin file konfigurasi
COPY package.json ./

# Menginstal dependensi
RUN npm install

# Menyalin seluruh kode source
COPY . .

# Membuka port default Vite
EXPOSE 5173

# Menjalankan server Vite agar bisa diakses dari luar kontainer (--host)
CMD ["npm", "run", "dev", "--", "--host"]