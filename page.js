// page.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Elemen DOM untuk Routing ---
  const dynamicContent = document.getElementById('dynamic-content');
  const mainPlayerSection = document.getElementById('main-player-section');
  const navLinks = document.querySelectorAll('.nav-link');

    // Mapping untuk nama file Markdown
  const fileMap = {
    'about': 'about.md',
    'harga': 'harga.md',
    'aktivasi': 'cara-aktivasi.md' // Catatan: Menggunakan 'aktivasi.md' sesuai kesepakatan terakhir
  };

    // MAPPING UNTUK JUDUL HALAMAN
  const titleMap = {
    'home': 'Beranda',
    'about': 'Profil Perusahaan',
    'harga': 'Plan & Harga Langganan',
    'aktivasi': 'Panduan Aktivasi Akun'
  };

    // Fungsi stopPlayer akan memanggil fungsi global closePlayer() dari player.js.
  const stopPlayer = window.closePlayer || (() => {});


    /**
     * Fungsi untuk memperbarui <title> dokumen
     */
  function updateTitle(pageKey) {
    const baseTitle = "CalincingTV";
        // Menggunakan titleMap[pageKey] untuk mendapatkan judul spesifik, jika tidak ada, default ke string kosong.
    const suffix = titleMap[pageKey] ? ` - ${titleMap[pageKey]}` : "";
    document.title = baseTitle + suffix;
  }


    /**
     * Tampilkan bagian utama (Player TV dan Daftar Saluran)
     */
  function showMainPlayerSection() {
    dynamicContent.classList.add('hidden');
    mainPlayerSection.classList.remove('hidden');
        updateTitle('home'); // Panggil updateTitle untuk Home
        // Saat kembali ke Home, player.js akan memuat channel secara otomatis
        // karena window.location.search kosong (seperti yang didefinisikan di player.js Anda).
      }


    /**
     * Memuat konten Markdown dari file
     */
      async function loadMarkdownContent(page) {
        const fileName = fileMap[page];
        const path = `halaman/${fileName}`;
        // Jika fileName tidak ditemukan di fileMap (misalnya, jika ada 'apk' tapi sudah dihapus dari map), kembali ke Home.
        if (!fileName) return showMainPlayerSection();

        // 1. Hentikan Player yang sedang berjalan
        stopPlayer();

        try {
          const response = await fetch(path);

          if (!response.ok) {
           dynamicContent.innerHTML = `<p class="text-red-500 text-center text-xl p-8">Konten untuk halaman ini (${path}) tidak ditemukan. (Error ${response.status})</p>`;
         } else {
          const markdownText = await response.text();
                // 2. Konversi Markdown ke HTML
          const htmlContent = marked.parse(markdownText);
          dynamicContent.innerHTML = `<div class="p-8 bg-gray-800 rounded-lg shadow-xl">${htmlContent}</div>`;
        }

            // 3. Update tampilan: Sembunyikan Player, Tampilkan Konten
        mainPlayerSection.classList.add('hidden');
        dynamicContent.classList.remove('hidden');

            // PANGGIL updateTitle DI SINI setelah konten berhasil dimuat
        updateTitle(page); 

      } catch (error) {
        console.error(`Gagal memuat file Markdown ${path}:`, error);
        dynamicContent.innerHTML = `<p class="text-red-500 text-center text-xl p-8">Terjadi kesalahan saat memuat konten.</p>`;
        mainPlayerSection.classList.add('hidden');
        dynamicContent.classList.remove('hidden');

            // Panggil updateTitle meskipun ada error, agar title tetap relevan
        updateTitle(page); 
      }
    }

    /**
     * Mengatur status aktif pada menu navigasi
     */
    function setActiveNav(activePage) {
      navLinks.forEach(link => {
        link.classList.remove('text-red-400', 'font-bold');
        link.classList.add('text-white');
        if (link.getAttribute('data-page') === activePage) {
          link.classList.add('text-red-400', 'font-bold');
          link.classList.remove('text-white');
        }
      });
    }

    /**
     * Memproses parameter URL untuk menentukan halaman mana yang harus dimuat (ROUTER)
     */
    function handleRouting() {
      const urlParams = new URLSearchParams(window.location.search);
      let currentPage = 'home';

      if (urlParams.has('about')) {
        currentPage = 'about';
        loadMarkdownContent('about');
      } else if (urlParams.has('aktivasi')) {
        currentPage = 'aktivasi';
        loadMarkdownContent('aktivasi');
      } else if (urlParams.has('harga')) {
        currentPage = 'harga';
        loadMarkdownContent('harga');
      } else {
            // Default: Halaman Home
        currentPage = 'home';
        showMainPlayerSection();
      }

      setActiveNav(currentPage);
    }

    // --- Event Listener Navigasi (Mencegah reload pada halaman MD) ---
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const page = this.getAttribute('data-page');

        if (page !== 'home') {
          e.preventDefault();
                // Mengubah URL tanpa me-reload halaman penuh (SPA)
          history.pushState(null, '', `./?${page}`);
          handleRouting();
        }
            // Tautan Home dibiarkan melakukan reload standar untuk memastikan player.js
            // berjalan bersih sesuai logika awalnya.
      });
    });

    // Jalankan router saat halaman pertama kali dimuat dan saat tombol back/forward ditekan
    handleRouting();
    window.addEventListener('popstate', handleRouting);
  });