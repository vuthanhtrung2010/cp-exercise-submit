# Tự động thu bài
## HDSD:
Trong hướng dẫn này mình sẽ dùng [Bun](https://bun.com/). Bạn cũng có thể dùng NPM để chạy, chỉ việc thay thế bun bằng npm.

- Clone repository về (hoặc có thể tải file zip về rồi unzip)
- Config file `.env`
1. `CONFIG_USERS` là đường dẫn đến file chứa các users theo format: `username:pass:name`
2. `CONFIG_PROBLEMS` là tên các bài. Viết in hoa?
3. `CONFIG_STATEMENTS` là thư mục dẫn đến đường dẫn đề thi, có thể download qua `/download`
4. `OUTPUT_DIR` là thư mục lưu bài thí sinh, sẽ lưu vào thư mục đó theo `username/TENFILE`.

- Cài modules:
```bash
bun install
```
hoặc:
```bash
npm i
```

- Run build bằng cách:
```bash
bun run build
```
or
```bash
npm run build
```

- Chạy:
```bash
bun start
```
hoặc
```bash
npm start
```
