# Cooked: Sổ tay công thức nấu ăn

Cooked là web app một trang (SPA) để xem, tìm kiếm và đăng công thức nấu ăn. Người dùng có thể đánh giá món, lưu món yêu thích và lên thực đơn cho cả tuần.

Dự án không dùng database và không dùng JWT. Dữ liệu nằm trong file JSON trên server Express, còn phân quyền được giả lập ở phía Frontend.

## Website làm được gì

Khách (chưa đăng nhập) xem danh sách công thức và tìm theo tên. Có thể lọc theo loại món, thời gian nấu, độ khó, hoặc nhập nhiều nguyên liệu để xem những món khớp nhiều nhất.

Thành viên đăng, sửa và xóa công thức của mình, với form thêm hoặc bớt dòng nguyên liệu và bước làm. Thành viên còn chấm 1 đến 5 sao và bình luận (mỗi món một lần), lưu món yêu thích, xếp thực đơn 7 ngày x 3 bữa. Từ thực đơn, web tự gộp các nguyên liệu trùng tên và đơn vị thành một danh sách đi chợ.

Admin duyệt công thức mới, ẩn bình luận vi phạm, quản lý loại món và xem các món được đánh giá cao nhất.

## Công nghệ

- Frontend: React (Vite), React Router, Redux Toolkit (thực đơn tuần), Context API (vai trò người dùng giả lập và giao diện sáng/tối)
- Backend: Node.js, Express, Multer (upload ảnh)
- Dữ liệu: file JSON trong `server/data`

## Yêu cầu

- Node.js 18 trở lên
- npm
- Git

## Cài đặt

```bash
git clone <url-repo>
cd recipe-app

cd server
npm install

cd ../client
npm install
```

## Nạp dữ liệu mẫu (seed)

Chạy một lần trước khi khởi động server lần đầu:

```bash
cd server
npm run seed
```

Lệnh này tạo `users.json` và `recipes.json` trong `server/data`, gồm các tài khoản demo bên dưới và vài công thức mẫu.

Chạy lại lệnh sẽ ghi đè toàn bộ dữ liệu hiện có, kể cả công thức bạn đã đăng thử. Muốn giữ dữ liệu cũ thì sao chép thư mục `server/data` ra chỗ khác trước.

## Chạy dự án

Mở hai cửa sổ terminal.

Terminal 1, server:

```bash
cd server
npm start
```

Server chạy ở http://localhost:5000.

Terminal 2, client:

```bash
cd client
npm run dev
```

Mở http://localhost:5173 trên trình duyệt. Nếu server chạy ở cổng khác, sửa địa chỉ API trong `client/src/api.js`.

Ảnh tải lên được lưu ở `server/public/uploads`. Tạo thư mục này nếu chưa có.

## Tài khoản demo

Web dùng đăng nhập giả lập: sau khi đăng nhập, `userId` và vai trò được lưu vào Context và LocalStorage. Mật khẩu dưới đây chỉ để thử nghiệm.

| Vai trò | Email | Mật khẩu | Truy cập được |
| --- | --- | --- | --- |
| Khách | không cần đăng nhập | | `/`, `/recipe/:id`, `/login`, `/register` |
| Thành viên | member@cooked.test | member123 | thêm `/my-account/*`, `/recipe/create`, `/recipe/edit/:id` |
| Admin | admin@cooked.test | admin123 | thêm `/admin/*` |

Thành viên truy cập trang `/admin` sẽ bị chặn. Người chưa đăng nhập vào trang thành viên sẽ được chuyển về `/login`.

## Các trang chính

| Đường dẫn | Trang |
| --- | --- |
| `/` | Trang chủ: tìm kiếm, bộ lọc, danh sách món |
| `/recipe/:id` | Chi tiết món, đánh giá, bình luận |
| `/login`, `/register` | Đăng nhập, đăng ký |
| `/my-account/profile` | Thông tin tài khoản |
| `/my-account/my-recipes` | Công thức của tôi |
| `/my-account/favorites` | Món yêu thích |
| `/my-account/weekly-menu` | Thực đơn tuần và danh sách đi chợ |
| `/recipe/create`, `/recipe/edit/:id` | Tạo và sửa công thức |
| `/admin/dashboard` | Thống kê |
| `/admin/pending-recipes` | Duyệt công thức |
| `/admin/categories` | Quản lý loại món |
| `/admin/comments` | Quản lý bình luận |
| `*` | Trang 404 |

## API

Server Express cung cấp ba nhóm endpoint: `/api/recipes`, `/api/users` và `/api/menus`, dùng đúng các method GET, POST, PUT và DELETE.

## Cấu trúc thư mục

```text
recipe-app
|-- client                 React (Vite)
|   |-- src
|       |-- components
|       |-- pages
|       |-- hooks          useDebounce, useFetch
|       |-- redux          store, menuSlice
|       |-- context        AuthContext
|-- server                 Express
    |-- routes
    |-- controllers
    |-- middlewares        multer, xử lý lỗi
    |-- data               users.json, recipes.json
    |-- public/uploads
```
