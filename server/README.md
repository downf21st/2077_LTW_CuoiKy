# Cooked API (Express)

Chạy server:

```bash
npm install
npm start
```

Mặc định API ở `http://localhost:5000`. Dữ liệu nằm trong `data/*.json`; ảnh tải lên được lưu dưới `public/uploads` và truy cập qua `/uploads/<tên-file>`.

## Quyền truy cập demo

Các endpoint cần user nhận `x-user-id`. Server tra `id` và `role` trong `data/users.json`; không gửi role từ client. Đây là cơ chế giả lập cho bài tập, không thay thế xác thực production.

| Tài khoản | `x-user-id` |
| --- | --- |
| member | `user-001` |
| admin | `user-002` |

## Công thức

| Method | Đường dẫn | Ghi chú |
| --- | --- | --- |
| GET | `/api/recipes` | Hỗ trợ `search`, `category`, `maxTime`, `difficulty`, `ingredients`, `authorId`, `page`, `limit`. Chỉ món `approved` hiển thị công khai; tác giả/admin có thể xem món `pending` của mình hoặc trong quyền admin. Tìm nguyên liệu trả `matchCount`; mọi món có `averageRating` và `reviewCount` tính từ review, danh sách không trả nội dung review. |
| GET | `/api/recipes/:id` | Chi tiết có `averageRating`, `reviewCount` và `reviews`; bình luận bị ẩn được trả về rỗng. Món `pending` trả 404 với người không có quyền xem. |
| POST | `/api/recipes` | `multipart/form-data`; ảnh ở field `image`, `ingredients`, `steps`, `equipment` gửi dạng JSON. Tạo món `pending`. |
| PUT | `/api/recipes/:id` | Cập nhật các trường hợp lệ; có thể kèm ảnh mới ở field `image`. Món sửa chuyển về `pending`. |
| DELETE | `/api/recipes/:id` | Chỉ tác giả/admin; xóa món và cố gắng dọn ảnh tải lên cũ. |
| GET | `/api/categories` | Danh sách category. |

Nguyên liệu có cấu trúc `{ "name": "...", "quantity": 100, "unit": "g" }`. Các unit được chấp nhận: `g`, `ml`, `muỗng canh`, `muỗng cà phê`. Mỗi bước gồm `title`, `duration`, `instruction`.

## Tài khoản và yêu thích

| Method | Đường dẫn | Ghi chú |
| --- | --- | --- |
| POST | `/api/users/login` | JSON `{ "email": "...", "password": "..." }`. |
| POST | `/api/users/register` | JSON `{ "name": "...", "email": "...", "password": "..." }`. Email trùng trả 409. |
| GET | `/api/users/:id/favorites` | Danh sách recipe đầy đủ; chỉ user đó hoặc admin. |
| POST | `/api/users/:id/favorites` | JSON `{ "recipeId": "..." }`; đã lưu trả 409. |
| DELETE | `/api/users/:id/favorites/:recipeId` | Bỏ món khỏi danh sách. |

Danh sách yêu thích được lưu trong `data/favorites.json` và khởi tạo khi phát sinh lần lưu đầu tiên.

Các thao tác ghi recipe được xếp hàng trong một tiến trình Node.js và ghi qua file tạm để tránh request đồng thời ghi đè nhau. Cách này phù hợp server demo chạy một tiến trình; nếu chạy nhiều worker/máy chủ, cần thay JSON bằng database hoặc cơ chế khóa dùng chung.

Chạy `npm run seed` tạo dữ liệu demo còn thiếu, thêm review mẫu và hai công thức `pending` để thử quyền duyệt; `menus.json` được khởi tạo rỗng. Seed giữ nguyên file đã tồn tại và tránh thêm trùng các mục mẫu.

Endpoint trả lỗi JSON dạng `{ "success": false, "message": "..." }`. Dữ liệu thiếu/sai kiểu trả 400; thiếu đăng nhập trả 401; không đủ quyền trả 403; không tìm thấy tài nguyên trả 404; ảnh quá lớn trả 413; định dạng ảnh không hỗ trợ trả 415.

## Kiểm thử Postman

Import `Cooked API.postman_collection.json`. Tạo biến collection `baseUrl` (mặc định `http://localhost:5000`). Ở request tạo công thức, chọn một file JPG/PNG cho field `image`; các request sau tự lấy `recipeId` do bước tạo trả về. Chạy tuần tự cả collection để bước thêm/xóa yêu thích và tạo/sửa/xóa công thức kiểm tra trọn luồng. Collection dọn món thử còn sót ở đầu lần chạy và xóa món vừa tạo ở cuối.

Nếu lần chạy bị dừng giữa chừng, dùng request DELETE công thức với `recipeId` đang lưu trong collection để dọn món thử; request DELETE yêu thích bỏ qua món chưa được lưu.
