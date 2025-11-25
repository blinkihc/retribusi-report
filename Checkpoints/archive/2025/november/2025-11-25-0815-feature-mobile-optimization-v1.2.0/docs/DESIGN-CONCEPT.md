# 🎨 Design Concept: Government Structured Brutalism

**Project**: Sistem Monitoring dan Pelaporan Retribusi Daerah  
**Style**: Structured Neo-Brutalism (Enterprise Variant)  
**Focus**: Clarity, Authority, Accessibility

---

## 1. Design Philosophy

Kita mengadopsi pendekatan **"Structured Brutalism"**. Berbeda dengan Neo-Brutalism murni yang anarkis/eksperimental, style ini diadaptasi untuk konteks Enterprise/Government.

### Key Principles:
1.  **Clarity Over Decoration** (Kejelasan di atas Dekorasi)
    *   Tidak ada shadow halus (soft shadow) yang samar.
    *   Tidak ada gradien yang tidak perlu.
    *   Batas antar elemen (border) harus tegas dan jelas.

2.  **Authority & Trust** (Otoritas & Kepercayaan)
    *   Garis tebal (Stroke) memberikan kesan kokoh/stabil.
    *   Kontras tinggi memberikan kesan transparan dan tegas.

3.  **Tactile Accessibility** (Aksesibilitas Taktil)
    *   Tombol terlihat "bisa ditekan".
    *   Input field terlihat "bisa diisi".
    *   Hirarki informasi sangat jelas bagi user yang kurang tech-savvy.

---

## 2. Core Visual Elements

### 🔲 Borders & Strokes
*   **Base Border**: `1px` solid untuk elemen sekunder (garis tabel, divider).
*   **Active/Focus Border**: `2px` solid untuk elemen interaktif (tombol, input focus).
*   **Color**: Slate-900 (`#0f172a`) atau Black (`#000000`).

### ⬛ Shadows (The Brutalist Touch)
Alih-alih soft shadow, kita gunakan **Hard Shadows** (tanpa blur).

*   **Card Shadow**:
    ```css
    box-shadow: 4px 4px 0px 0px #000000;
    border: 2px solid #000000;
    ```
*   **Button Shadow (Rest)**:
    ```css
    box-shadow: 2px 2px 0px 0px #000000;
    border: 1px solid #000000;
    ```
*   **Button Shadow (Active/Pressed)**:
    ```css
    box-shadow: 0px 0px 0px 0px #000000;
    transform: translate(2px, 2px);
    ```
    *Effect: Memberikan feedback fisik yang sangat memuaskan saat diklik.*

### 📐 Radius
*   **Slightly Rounded**: `0.375rem` (6px) atau `0.5rem` (8px).
*   Jangan gunakan `full rounded` (pill shape) kecuali untuk status badge.
*   Sudut yang sedikit tajam mempertahankan kesan serius tapi tidak kaku.

---

## 3. Color Palette

Menggunakan warna identitas pemerintah, tapi dengan aplikasi yang flat & bold.

### Primary (Government Blue)
*   **Main**: `#2563eb` (Blue-600) - *Vibrant tapi resmi.*
*   **Surface**: `#eff6ff` (Blue-50) - *Background card/section.*
*   **Stroke**: `#1e3a8a` (Blue-900) - *Text & Border.*

### Semantic (Status)
Warna status harus "nendang" (pop) agar operator langsung sadar.

*   **Success (Lapor/Bayar OK)**:
    *   Bg: `#dcfce7` (Green-100)
    *   Text/Border: `#15803d` (Green-700)
*   **Warning (Belum Lapor)**:
    *   Bg: `#fef9c3` (Yellow-100)
    *   Text/Border: `#a16207` (Yellow-700)
*   **Error (Gagal/Lewat)**:
    *   Bg: `#fee2e2` (Red-100)
    *   Text/Border: `#b91c1c` (Red-700)

### Neutral (Backgrounds)
*   **Page Bg**: `#f8fafc` (Slate-50) atau Pattern Dots halus.
*   **Card Bg**: `#ffffff` (White).

---

## 4. Typography System

Font harus sans-serif yang geometris untuk mendukung kesan modern dan keterbacaan angka.

*   **Family**: `Inter` (Existing) atau `Plus Jakarta Sans`.
*   **Headings**: Bold (`700`) atau ExtraBold (`800`).
*   **Body**: Medium (`500`) untuk data, Regular (`400`) untuk paragraf.

**Number Formatting (PENTING untuk Retribusi):**
*   Gunakan `Tabular figures` (angka monospaced) agar nominal di tabel sejajar vertikal.
    ```css
    font-variant-numeric: tabular-nums;
    ```

---

## 5. Component Examples

### A. The "Action" Button
Tombol utama untuk "Simpan Laporan" atau "Export".
*   Bg: Primary Blue
*   Text: White (Bold)
*   Border: 2px Solid Black
*   Shadow: 4px Hard Black Shadow
*   **Hover**: Background sedikit lebih terang.
*   **Click**: Shadow hilang, tombol turun 4px.

### B. The "Data" Card (Dashboard)
Kartu untuk summary "Total Pendapatan Hari Ini".
*   Bg: White
*   Border: 2px Solid Slate-200 (Inactive) atau Black (Active/Hover)
*   Accent: Bar warna tebal di sebelah kiri (e.g., Blue strip).
*   **Interaction**: Saat di-hover, border jadi hitam dan muncul shadow kasar.

### C. The "Strict" Table
Tabel laporan retribusi.
*   **Header**: Bg Black/Dark Blue, Text White, Uppercase, Tracking wide.
*   **Rows**: Zebra striping (White & Slate-50).
*   **Cell Borders**: Vertical borders 1px solid Slate-200 (memisahkan kolom dengan tegas).
*   **Visual**: Seperti spreadsheet excel tapi lebih modern.

### D. Form Inputs
*   Label: Bold, di atas input.
*   Input: Bg White, Border 1px Slate-400.
*   **Focus State**:
    *   Bg: Yellow-50 (sedikit kuning/highlight)
    *   Border: 2px Solid Blue/Black
    *   Ring: Tidak ada glow soft, tapi hard outline.

---

## 7. Motion & Texture Guidelines

### A. Micro-interactions (Snappy > Floaty)
Animasi harus cepat, tegas, dan memberikan feedback fisik. Jangan gunakan animasi yang lambat atau memantul (bouncy).

*   **Duration**: Cepat! `150ms` - `200ms`.
*   **Easing**: `ease-out` atau `linear`.
*   **Feedback**:
    *   **Click**: Element harus "turun" (`translate-y`) saat di-klik aktif.
    *   **Hover**: Element "naik" atau border berubah warna instan.
    *   **Toast/Alert**: Slide-in cepat dari pinggir, tanpa fade-in yang lama.
*   **❌ Forbidden**: Bouncy effects, slow fades (>300ms), floating elements.

### B. Background Treatment (Texture > Illustration)
Hindari ilustrasi kartun/flat yang mengurangi kesan profesional. Gunakan pattern geometris subtil untuk mengisi kekosongan.

*   **Pattern**: Dot grid (halftone) atau Graph paper grid.
*   **Opacity**: Sangat tipis (`opacity: 0.03` atau `3%`).
*   **Placement**:
    *   **Dashboard/Forms**: Background bersih/polos (`Slate-50`) untuk fokus data.
    *   **Login/Empty States**: Boleh gunakan pattern geometris abstrak (Wireframe style) di pojok layar.
*   **Style**: Technical/Blueprint look.

---

## 8. Implementation Strategy (Tailwind)

Kita bisa mencapai ini dengan utility class Tailwind tanpa CSS kustom yang rumit.

**Example Tailwind Classes:**

*   **Neo-Brutalist Button**:
    `bg-blue-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all`

*   **Neo-Brutalist Card**:
    `bg-white border-2 border-slate-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-lg`

*   **Alert Box**:
    `bg-red-100 border-l-4 border-red-700 text-red-900 p-4 font-bold`

---

## 7. Why This Works Here?

1.  **Operator Friendly**: Target pengguna kita adalah operator dinas yang butuh kejelasan. Tombol yang "timbul" dan input yang "tegas" mengurangi keraguan saat bekerja cepat.
2.  **Data Integrity**: Tampilan tabel yang tegas (seperti Excel) memudahkan scanning data nominal uang, mengurangi risiko salah baca.
3.  **Modern Identity**: Mengubah stigma aplikasi pemerintah yang "kuno" menjadi sesuatu yang fresh, fungsional, dan berwibawa.

---

**Status**: Concept Ready for Review
**Next Step**: Create Tailwind config preset / utility components.
