/**
 * ==============================================================================
 * LOGIKA KALKULATOR ARITMATIKA DASAR (JAVASCRIPT TUTORIAL)
 * ==============================================================================
 * Halo! Selamat datang di sesi coding kalkulator.
 * Di sini kita bakal membedah langkah demi langkah bagaimana logika
 * kalkulator bekerja dengan JavaScript murni (Vanilla JS).
 * 
 * Konsep utama yang dipelajari:
 * 1. State Management (Menyimpan data angka & operator)
 * 2. Manipulasi String & Angka (Type Casting)
 * 3. Logika Aritmatika (+, -, *, /) serta penanganan kasus bagi nol (edge case)
 * 4. DOM Manipulation (Menghubungkan JS ke tampilan HTML)
 * 5. Event Handling (Klik mouse & Tombol keyboard)
 * ==============================================================================
 */

// ==========================================
// 1. STATE MANAGEMENT (Tempat Menyimpan Data)
// ==========================================
// Pikirkan variabel-variabel ini sebagai "memori sementara" kalkulator kita.
let currentOperand = '0';     // Angka yang lagi diketik / hasil saat ini di layar bawah
let previousOperand = '';    // Angka pertama yang disimpan sebelum operator dipilih
let selectedOperator = null; // Simbol matematika (+, −, ×, ÷) yang lagi aktif
let shouldResetScreen = false; // Penanda (flag): apakah angka berikutnya harus menimpa angka lama?
const calculationHistory = []; // Menyimpan riwayat hitungan sebelumnya

// ==========================================
// 2. SELEKSI ELEMEN DOM (Document Object Model)
// ==========================================
// Kita ambil elemen HTML berdasarkan ID dan Class agar bisa dimanipulasi dengan JS.
const currentOperandEl = document.getElementById('currentOperand');
const previousOperandEl = document.getElementById('previousOperand');
const historyListEl = document.getElementById('historyList');
const btnClearHistoryEl = document.getElementById('btnClearHistory');

// ==========================================
// 3. FUNGSI LOGIKA UTAMA (Core Functions)
// ==========================================

/**
 * [Fungsi 1: Menambah Angka]
 * Dipanggil tiap kali user menekan tombol angka 0-9.
 */
function appendNumber(number) {
  // Kalau baru saja selesai menekan tombol '=', kita reset layarnya
  // supaya angka baru tidak menempel di belakang hasil hitungan lama.
  if (currentOperand === '0' || shouldResetScreen) {
    currentOperand = number;
    shouldResetScreen = false;
  } else {
    // Batasi panjang angka maksimal 14 karakter agar tampilan layar tidak rusak/overflow
    if (currentOperand.length >= 14) return;
    currentOperand += number; // Gabungkan sebagai string (contoh: '1' + '2' = '12')
  }
  
  updateDisplay();
}

/**
 * [Fungsi 2: Menambah Titik Desimal / Koma]
 * Logika penting: Dalam satu angka, tidak boleh ada 2 titik desimal (misal: "3.14.5" tidak valid!).
 */
function appendDecimal() {
  if (shouldResetScreen) {
    currentOperand = '0.';
    shouldResetScreen = false;
    updateDisplay();
    return;
  }

  // Cek apakah angka sekarang sudah memiliki titik desimal
  if (!currentOperand.includes('.')) {
    currentOperand += '.';
  }
  
  updateDisplay();
}

/**
 * [Fungsi 3: Memilih Operator Matematika]
 * Dipanggil saat user menekan +, −, ×, atau ÷.
 */
function chooseOperator(operator) {
  // Kalau ada perhitungan tertunda (previousOperand & currentOperand sudah ada),
  // selesaikan dulu perhitungan sebelumnya secara otomatis (contoh: 5 + 3 kemudian pencet *).
  if (selectedOperator !== null && !shouldResetScreen) {
    calculate();
  }

  selectedOperator = operator;
  previousOperand = currentOperand; // Pindahkan angka saat ini ke riwayat atas
  shouldResetScreen = true;        // Layar disiapkan untuk menerima input angka kedua
  
  updateDisplay();
  highlightActiveOperatorButton(operator);
}

/**
 * [Fungsi 4: Logika Eksekusi Hitungan (Kalkulasi)]
 * Inti dari kalkulator: Menghitung operasi aritmatika berdasarkan operator yang dipilih.
 */
function calculate() {
  // Validasi: Kalau belum ada operator yang dipilih, jangan lakukan apa-apa
  if (selectedOperator === null || shouldResetScreen) return;

  // Konversi input teks (string) menjadi angka desimal (number float)
  const prev = parseFloat(previousOperand);
  const curr = parseFloat(currentOperand);

  // Jika input bukan angka valid, batalkan proses
  if (isNaN(prev) || isNaN(curr)) return;

  let computationResult = 0;

  // Percabangan (Switch Case) untuk mengeksekusi operasi matematika dasar:
  switch (selectedOperator) {
    case '+': // Tambah (Penjumlahan)
      computationResult = prev + curr;
      break;

    case '−': // Kurang (Pengurangan)
    case '-':
      computationResult = prev - curr;
      break;

    case '×': // Kali (Perkalian)
    case '*':
      computationResult = prev * curr;
      break;

    case '÷': // Bagi (Pembagian)
    case '/':
      // Kasus Khusus: Pembagian dengan angka 0 dalam matematika tidak terdefinisi!
      if (curr === 0) {
        showCalculationError("Tidak bisa bagi 0!");
        return;
      }
      computationResult = prev / curr;
      break;

    default:
      return;
  }

  // Solusi Masalah Presisi Floating Point di JS (misal 0.1 + 0.2 = 0.30000000000000004)
  // Kita bulatkan maksimal hingga 10 angka di belakang koma:
  computationResult = Math.round(computationResult * 1e10) / 1e10;

  // Catat riwayat perhitungan ke dalam history
  recordHistory(prev, selectedOperator, curr, computationResult);

  // Perbarui state setelah perhitungan selesai
  currentOperand = computationResult.toString();
  previousOperand = '';
  selectedOperator = null;
  shouldResetScreen = true;

  updateDisplay();
  highlightActiveOperatorButton(null);
}

/**
 * [Fungsi 5: Reset Semua (Tombol AC - All Clear)]
 * Mengembalikan kalkulator ke kondisi awal.
 */
function clearAll() {
  currentOperand = '0';
  previousOperand = '';
  selectedOperator = null;
  shouldResetScreen = false;
  
  updateDisplay();
  highlightActiveOperatorButton(null);
}

/**
 * [Fungsi 6: Hapus Karakter Terakhir (Tombol DEL)]
 * Menghapus 1 digit paling belakang, mirip tombol Backspace.
 */
function deleteLastDigit() {
  if (shouldResetScreen) return;

  // Kalau sisa 1 angka atau string kosong, ubah kembali jadi '0'
  if (currentOperand.length <= 1) {
    currentOperand = '0';
  } else {
    // Ambil string dari indeks ke-0 sampai satu huruf sebelum terakhir
    currentOperand = currentOperand.slice(0, -1);
  }

  updateDisplay();
}

/**
 * [Fungsi 7: Ubah Tanda Positif / Negatif (±)]
 * Mengalikan angka dengan -1 untuk mengubah tanda angka.
 */
function toggleSign() {
  if (currentOperand === '0') return;
  
  if (currentOperand.startsWith('-')) {
    currentOperand = currentOperand.substring(1); // Buang tanda minus
  } else {
    currentOperand = '-' + currentOperand;       // Tambahkan tanda minus
  }

  updateDisplay();
}

// ==========================================
// 4. PEMBARUAN TAMPILAN (UI Display Helpers)
// ==========================================

/**
 * Memformat angka dengan pemisah ribuan agar enak dibaca (contoh: 1,000,000)
 */
function formatNumberWithCommas(numberString) {
  if (numberString === '' || numberString === undefined) return '';
  if (numberString === 'Tidak bisa bagi 0!') return numberString;

  // Pisahkan bagian integer dan bagian desimal jika ada tanda titik
  const parts = numberString.split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  let formattedInteger;
  if (isNaN(parseFloat(integerPart))) {
    formattedInteger = integerPart;
  } else {
    // Format bagian integer dengan koma lokal
    formattedInteger = parseFloat(integerPart).toLocaleString('en-US');
  }

  // Jika ada koma/titik desimal, gabungkan kembali
  if (decimalPart !== undefined) {
    return `${formattedInteger}.${decimalPart}`;
  }
  return formattedInteger;
}

/**
 * Memperbarui teks pada elemen display kalkulator
 */
function updateDisplay() {
  currentOperandEl.textContent = formatNumberWithCommas(currentOperand);

  if (selectedOperator !== null) {
    previousOperandEl.textContent = `${formatNumberWithCommas(previousOperand)} ${selectedOperator}`;
  } else {
    previousOperandEl.textContent = '';
  }
}

/**
 * Menampilkan pesan error ramah jika ada perhitungan terlarang (seperti dibagi 0)
 */
function showCalculationError(message) {
  currentOperand = message;
  previousOperand = '';
  selectedOperator = null;
  shouldResetScreen = true;
  
  updateDisplay();
  highlightActiveOperatorButton(null);
}

/**
 * Memberikan visual glow/highlight pada tombol operator yang sedang aktif
 */
function highlightActiveOperatorButton(operator) {
  const operatorButtons = document.querySelectorAll('.btn-operator');
  operatorButtons.forEach(btn => {
    if (operator && (btn.dataset.operator === operator || (operator === '-' && btn.dataset.operator === '−'))) {
      btn.classList.add('active-operator');
    } else {
      btn.classList.remove('active-operator');
    }
  });
}

// ==========================================
// 5. RIWAYAT PERHITUNGAN (History Log)
// ==========================================

/**
 * Menyimpan kalkulasi ke riwayat dan merender ke layar
 */
function recordHistory(prev, operator, curr, result) {
  const equationText = `${formatNumberWithCommas(prev.toString())} ${operator} ${formatNumberWithCommas(curr.toString())}`;
  const resultText = formatNumberWithCommas(result.toString());

  calculationHistory.unshift({ equation: equationText, result: resultText });

  // Batasi riwayat maksimal 8 item terakhir
  if (calculationHistory.length > 8) {
    calculationHistory.pop();
  }

  renderHistory();
}

/**
 * Merender daftar riwayat ke HTML
 */
function renderHistory() {
  if (calculationHistory.length === 0) {
    historyListEl.innerHTML = '<li class="history-empty">Belum ada riwayat perhitungan</li>';
    return;
  }

  historyListEl.innerHTML = '';
  calculationHistory.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.title = 'Klik untuk menggunakan hasil ini';
    li.innerHTML = `
      <span>${item.equation} =</span>
      <span class="history-item-result">${item.result}</span>
    `;

    // Fitur interaktif: Klik riwayat untuk memakai lagi angkanya
    li.addEventListener('click', () => {
      // Ambil angka murni tanpa koma pemisah ribuan
      currentOperand = item.result.replace(/,/g, '');
      shouldResetScreen = true;
      updateDisplay();
    });

    historyListEl.appendChild(li);
  });
}

// Bersihkan riwayat
btnClearHistoryEl.addEventListener('click', () => {
  calculationHistory.length = 0;
  renderHistory();
});

// ==========================================
// 6. EVENT LISTENER: KLIK TOMBOL (Mouse Click)
// ==========================================

// Tangkap semua tombol angka (0-9)
document.querySelectorAll('[data-number]').forEach(button => {
  button.addEventListener('click', () => {
    appendNumber(button.dataset.number);
  });
});

// Tangkap semua tombol operator (+, −, ×, ÷)
document.querySelectorAll('[data-operator]').forEach(button => {
  button.addEventListener('click', () => {
    chooseOperator(button.dataset.operator);
  });
});

// Tangkap tombol aksi khusus (Clear, Delete, Equals, Decimal, Sign)
document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    switch (action) {
      case 'clear':
        clearAll();
        break;
      case 'delete':
        deleteLastDigit();
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'toggle-sign':
        toggleSign();
        break;
      case 'equals':
        calculate();
        break;
      default:
        break;
    }
  });
});

// ==========================================
// 7. EVENT LISTENER: DUKUNGAN KEYBOARD (Bonus)
// ==========================================
// Biar kalkulatornya makin mantap, user bisa pakai keyboard langsung!
window.addEventListener('keydown', (event) => {
  const key = event.key;

  // Angka 0 - 9
  if (key >= '0' && key <= '9') {
    appendNumber(key);
  }

  // Desimal (. atau ,)
  if (key === '.' || key === ',') {
    appendDecimal();
  }

  // Operator Aritmatika
  if (key === '+') chooseOperator('+');
  if (key === '-') chooseOperator('−');
  if (key === '*' || key.toLowerCase() === 'x') chooseOperator('×');
  if (key === '/') {
    event.preventDefault(); // Cegah shortcut pencarian browser Firefox / Chrome
    chooseOperator('÷');
  }

  // Tombol Enter atau '=' untuk menghitung
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    calculate();
  }

  // Backspace untuk hapus 1 angka
  if (key === 'Backspace') {
    deleteLastDigit();
  }

  // Escape untuk Reset Semua (AC)
  if (key === 'Escape') {
    clearAll();
  }
});

// Inisialisasi awal tampilan
updateDisplay();
