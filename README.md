# 🏆 Gaming League 🎮

Ứng dụng web quản lý **giải đấu PlayStation nội bộ** theo thể thức **vòng tròn (Round-Robin)**.

## 🚀 Tính năng chính

- 🆕 Tạo giải đấu mới
- 👥 Người chơi tự đăng ký
- ⚙️ Admin điều khiển bắt đầu giải đấu
- 📊 Bảng xếp hạng theo thời gian thực
- 🎮 Ghi kết quả từng trận đấu
- 🛡️ Chế độ Admin bảo vệ chức năng nhạy cảm
- 🌙 Giao diện đẹp, hỗ trợ Dark Mode
- 🔔 Tích hợp thông báo đẩy (Push Notification) (TODO)

---

## 🖼️ Giao diện

| Trang | Mô tả |
|-------|-------|
| `/leagues/new` | Admin tạo giải đấu |
| `/leagues/[leagueId]/join` | Người chơi đăng ký |
| `/leagues/[leagueId]/start` | Admin bắt đầu giải đấu |
| `/leagues/[leagueId]` | Trang hiển thị bảng đấu và kết quả |

---

## 🔧 Công nghệ sử dụng

| Công nghệ | Mô tả |
|----------|-------|
| **Next.js App Router** | Framework React với SSR & Routing hiện đại |
| **Firebase Realtime Database** | Lưu trữ realtime thông tin giải đấu |
| **Tailwind CSS** + **shadcn/ui** | UI hiện đại, dễ tuỳ biến, hỗ trợ Dark Mode |
| **LocalStorage** | Lưu trạng thái người dùng & quyền admin |
| **Web Push API** | Gửi thông báo đẩy khi có kết quả mới |
| **Service Worker** | Xử lý thông báo từ phía trình duyệt |

---

## ⚙️ Cài đặt

### 1. Clone repo & cài dependencies

```bash
git clone https://github.com/yourname/gaming-league.git
cd gaming-league
npm install
```

### 2. Cấu hình `.env.local` (TODO)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_DATABASE_URL=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
```

### 3. Chạy local

```bash
npm run dev
```

---

## 🛡️ Chế độ Admin

- Admin chuyển trạng thái bằng nút **"as Admin"** trên Header
- Trạng thái lưu trong `localStorage` (`adminFlag`)
- Một số trang (tạo/bắt đầu giải) yêu cầu quyền Admin

---

## 🔔 Push Notification

### Đăng ký
- Người dùng có thể bật thông báo bằng nút 🔔 trong trang giải đấu

### Gửi
- Gửi thông báo từ API `/api/send-notification`
- Sử dụng VAPID để xác thực server gửi push

---

## 📁 Cấu trúc thư mục

```
app/
  leagues/
    [leagueId]/        # Trang League chính
    new/               # Tạo giải đấu
    start/             # Bắt đầu giải đấu (admin)
    join/              # Người chơi tham gia
components/
  ui/                  # Các component từ shadcn/ui
lib/
  firebase.ts          # Firebase config
  utils.ts             # Hàm tính toán & helper
  auth.ts              # `isAdminUser`, `useAuth`, `AuthGuard`
public/
  sw.js                # Service worker cho Push
```