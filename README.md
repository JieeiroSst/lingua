# Lingua

Ứng dụng ReactJS thử nghiệm giúp:

- Hội thoại luân phiên hai chiều: tiếng Việt → tiếng Anh và tiếng Anh → tiếng Việt; kiểm tra/sửa transcript, kiểm tra/sửa bản dịch rồi mới xác nhận phát bằng giọng đích.
- Nhập văn bản tiếng Anh để nghe phát âm.
- Tra từ tiếng Anh với nghĩa tiếng Việt, IPA và âm thanh mẫu; luyện đọc câu tiếng Anh và xem điểm so khớp transcript.
- Lưu và nghe lại các câu trong lịch sử trên chính trình duyệt đang dùng.

## Chạy ứng dụng

Yêu cầu Node.js 18 trở lên. Cài dependency và chạy Vite:

```bash
make install
make dev
```

Mở URL localhost do Vite hiển thị. Tạo bản build production bằng `npm run build`.
Chạy các kiểm thử logic bằng `make test`; chạy cả test và production build bằng `make check`. Có thể dùng `make preview` để build và xem trước production app.

Nhận diện giọng nói cần quyền truy cập micro và thường chỉ hoạt động trên HTTPS hoặc localhost. Chrome và Edge có hỗ trợ Web Speech API tốt hơn; một số trình duyệt khác có thể không cung cấp tính năng nhận diện giọng nói.

## Deploy bằng Docker

Build image và chạy container:

```bash
docker build -t lingua .
docker run --rm -p 8080:8080 lingua
```

Mở `http://localhost:8080`. Image dùng multi-stage build và Nginx non-root; khi deploy công khai, đặt HTTPS tại reverse proxy/hosting để trình duyệt cho phép dùng micro.

## Deploy bằng Vercel

`vercel.json` đã cấu hình lệnh build, thư mục `dist`, fallback cho ứng dụng SPA và các security headers.

Có thể deploy qua Vercel CLI:

```bash
npm install --global vercel
vercel login
vercel
vercel --prod
```

Hoặc import repository trong Vercel Dashboard; thiết lập build command là `npm run build` và output directory là `dist`. Vercel tự cấp HTTPS, cần thiết để trình duyệt cho phép truy cập micro.

## Cấu trúc frontend

```text
src/
├── app/                 # Ứng dụng gốc và bố cục trang
├── features/
│   ├── conversation/    # Phiên dịch trực tiếp, nhận diện giọng nói
│   ├── dictionary/      # Từ điển Anh – Việt và phát âm mẫu
│   ├── learning/        # Kết hợp các công cụ học tiếng Anh
│   ├── history/         # Lịch sử hội thoại và lưu trữ cục bộ
│   ├── pronunciation/   # Luyện nói và tính điểm so khớp
│   └── practice/        # Nhập tiếng Anh và luyện phát âm
├── shared/
│   ├── components/      # Thành phần dùng chung như icon
│   ├── hooks/           # Tích hợp Web Speech API dùng chung
│   └── services/        # Dịch vụ dịch ngôn ngữ dùng chung
└── main.jsx             # Điểm khởi chạy React
```

## Giới hạn bản thử nghiệm

- Dịch tự động sử dụng MyMemory API công khai, không cần API key. Đây là dịch vụ bên thứ ba, cần internet, có thể giới hạn lượt dùng hoặc thay đổi khả năng truy cập; không nên dùng cho nội dung nhạy cảm.
- Nhận diện hội thoại dùng cấu hình `vi-VN`/`en-US` và yêu cầu tối đa ba phương án; hỗ trợ thực tế và độ chính xác phụ thuộc trình duyệt, micro, môi trường và dịch vụ nhận diện. Hãy kiểm tra/sửa cả transcript lẫn bản dịch trước khi xác nhận; một số trình duyệt không cung cấp phương án thay thế. Hai lượt dùng luân phiên vì một micro không thể tách đáng tin cậy hai người nói cùng lúc. Không thể đảm bảo dịch tự động chính xác tuyệt đối.
- Từ điển dùng dictionaryapi.dev và bản dịch tiếng Việt dùng MyMemory; cần internet và có thể chịu giới hạn của dịch vụ công khai.
- Điểm luyện phát âm so sánh từ trong transcript tiếng Anh do trình duyệt nhận diện với câu mẫu (khoảng cách chỉnh sửa từ). Điểm này không phân tích âm vị, trọng âm hoặc chất giọng và có thể sai theo khả năng nhận diện.
- Giọng đọc bản dịch phụ thuộc vào các giọng tiếng Anh/tiếng Việt được cài đặt trên thiết bị.
- Lịch sử chỉ nằm trong `localStorage` của trình duyệt hiện tại; xóa dữ liệu trang web sẽ xóa lịch sử.

## Bảo mật khi triển khai

- Vite áp dụng CSP và các security headers trong môi trường phát triển (`npm run dev`) và xem trước production (`npm run preview`). CSP chỉ cho phép script cùng origin, Google Fonts và API dịch đang dùng; đồng thời chặn object nhúng và framing.
- Khi deploy thư mục `dist/` lên hosting/CDN, cấu hình các headers tương đương tại hosting. Vite không thể đính kèm HTTP headers vào bản build tĩnh. HSTS chỉ nên bật tại hosting khi toàn bộ website đã chạy ổn định qua HTTPS.
- Không đặt API key hoặc bí mật trong frontend. Nếu chuyển sang dịch vụ dịch cần xác thực, gọi dịch vụ đó qua backend/proxy và giới hạn quota tại server.
- Nội dung giọng nói được gửi đến dịch vụ nhận diện của trình duyệt; câu cần dịch gửi đến MyMemory; từ tra cứu gửi đến dictionaryapi.dev. Không dùng bản thử nghiệm với dữ liệu nhạy cảm; để tăng riêng tư, cần thay các dịch vụ này bằng backend do bạn kiểm soát.
- Lịch sử được kiểm tra cấu trúc khi đọc và chỉ lưu tối đa 100 mục. `localStorage` không phải kho lưu trữ an toàn trước mã độc chạy cùng origin.

## Deploy 
- https://lingua-mocha-ten.vercel.app