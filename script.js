let restaurants = {}; // Akan diisi dari file JSON
let cart = {}; // {item_id: {restaurant: "...", name: "...", price: ..., qty: ...}}

// Fungsi untuk format harga ke Rupiah
function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0 // Tidak menampilkan desimal
    }).format(number);
}

// Fungsi untuk mengambil data restoran dari file JSON secara asinkron
async function fetchRestaurantsData() {
    try {
        const response = await fetch('restaurants.json'); // Mengambil data dari file JSON
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        restaurants = await response.json(); // Mengisi variabel 'restaurants' dengan data yang diambil
        console.log('Data restoran berhasil dimuat:', restaurants);
        initializeApp(); // Panggil fungsi inisialisasi setelah data berhasil dimuat
    } catch (error) {
        console.error('Gagal memuat data restoran:', error);
        alert('Gagal memuat data restoran. Silakan coba lagi nanti.');
    }
}

// Fungsi inisialisasi aplikasi setelah data restoran tersedia
function initializeApp() {
    const restaurantListDiv = document.getElementById('restaurant-list');
    restaurantListDiv.innerHTML = ''; // Pastikan bersih sebelum mengisi ulang

    for (const name in restaurants) {
        const rest = restaurants[name];
        const restCard = document.createElement('div');
        restCard.className = 'restaurant-card';
        restCard.innerHTML = `
            <h3>${name}</h3>
            <p>${rest.description}</p>
        `;
        // Menambahkan event listener untuk menampilkan menu saat kartu restoran diklik
        restCard.addEventListener('click', () => showRestaurantMenu(name));
        restaurantListDiv.appendChild(restCard);
    }
    updateCartDisplay(); // Inisialisasi tampilan keranjang
}


// Muat daftar restoran saat halaman dimuat (memanggil fetchRestaurantsData)
document.addEventListener('DOMContentLoaded', fetchRestaurantsData);

// Menampilkan menu restoran yang dipilih
function showRestaurantMenu(restaurantName) {
    // Pastikan restoran ada di data sebelum mencoba menampilkan menunya
    if (!restaurants[restaurantName]) {
        console.error(`Restoran ${restaurantName} tidak ditemukan.`);
        return;
    }

    const menuTitle = document.getElementById('menu-title');
    const menuDescription = document.getElementById('menu-description');
    const menuItemsDiv = document.getElementById('menu-items');

    menuTitle.textContent = `Menu ${restaurantName}`;
    menuDescription.textContent = restaurants[restaurantName].description;
    menuItemsDiv.innerHTML = ''; // Kosongkan menu sebelumnya

    const menu = restaurants[restaurantName].menu;
    for (const itemName in menu) {
        const itemDetails = menu[itemName];
        const menuItemDiv = document.createElement('div');
        menuItemDiv.className = 'menu-item';
        menuItemDiv.innerHTML = `
            <div class="item-info">
                <h4>${itemName}</h4>
                <p>${itemDetails.description}</p>
                <span class="price">${formatRupiah(itemDetails.price)}</span>
            </div>
            <button class="add-to-cart-btn" onclick="addToCart('${restaurantName}', '${itemName}', ${itemDetails.price})">Tambah</button>
        `;
        menuItemsDiv.appendChild(menuItemDiv);
    }
}

// Menambahkan item ke keranjang
function addToCart(restaurantName, itemName, itemPrice) {
    // Membuat ID unik untuk item di keranjang (restoran-nama_item), mengganti spasi dengan underscore
    const itemId = `${restaurantName.replace(/\s/g, '_')}-${itemName.replace(/\s/g, '_')}`; 

    if (cart[itemId]) {
        cart[itemId].qty++; // Jika item sudah ada, tambahkan kuantitasnya
    } else {
        // Jika item belum ada, tambahkan sebagai item baru
        cart[itemId] = {
            restaurant: restaurantName,
            name: itemName,
            price: itemPrice,
            qty: 1
        };
    }
    updateCartDisplay(); // Perbarui tampilan keranjang setelah penambahan
    alert(`${itemName} dari ${restaurantName} berhasil ditambahkan ke keranjang.`);
}

// Memperbarui tampilan keranjang belanja dan total harga
function updateCartDisplay() {
    const cartItemsListDiv = document.getElementById('cart-items-list');
    const cartTotalSpan = document.getElementById('cart-total-price');
    const cartCountSpan = document.getElementById('cart-count');
    let totalPrice = 0;
    let totalItemsInCart = 0;

    cartItemsListDiv.innerHTML = ''; // Kosongkan daftar keranjang saat ini

    if (Object.keys(cart).length === 0) {
        cartItemsListDiv.innerHTML = '<p>Keranjang kosong.</p>'; // Tampilkan pesan jika keranjang kosong
    } else {
        for (const itemId in cart) {
            const item = cart[itemId];
            const cartItemDiv = document.createElement('div');
            cartItemDiv.className = 'cart-item';
            cartItemDiv.innerHTML = `
                <div class="cart-item-info">
                    <span>${item.name}</span>
                    <span class="qty">${item.qty}x dari ${item.restaurant}</span>
                </div>
                <span class="cart-item-price">${formatRupiah(item.price * item.qty)}</span>
            `;
            cartItemsListDiv.appendChild(cartItemDiv);
            totalPrice += item.price * item.qty; // Hitung total harga
            totalItemsInCart += item.qty; // Hitung total kuantitas item
        }
    }

    cartTotalSpan.textContent = formatRupiah(totalPrice); // Update tampilan total harga
    cartCountSpan.textContent = totalItemsInCart; // Update tampilan jumlah item di ikon keranjang
}

// Fungsi checkout sederhana
function checkout() {
    if (Object.keys(cart).length === 0) {
        alert("Keranjang belanja Anda masih kosong. Silakan tambahkan item terlebih dahulu.");
        return;
    }

    // Mengambil nilai total dari elemen HTML untuk konfirmasi
    const currentTotalText = document.getElementById('cart-total-price').textContent;
    const confirmCheckout = confirm(`Total belanja Anda adalah ${currentTotalText}\n\nLanjutkan pembayaran?`);

    if (confirmCheckout) {
        alert("Pesanan Anda berhasil ditempatkan! Selamat menikmati.");
        cart = {}; // Kosongkan keranjang setelah checkout
        updateCartDisplay(); // Perbarui tampilan keranjang yang kosong
    }
}
