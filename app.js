const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(session({
    secret: 'my-secret-key-123',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));

app.get('/', (req, res) => {
    const theme = req.cookies.theme || 'light';
    
    const bgColor = theme === 'dark' ? '#333' : '#fff';
    const textColor = theme === 'dark' ? '#fff' : '#000';

    res.send(`
        <div style="background-color: ${bgColor}; color: ${textColor}; height: 100vh; padding: 20px;">
            <h1>Trang chủ</h1>
            <p>Giao diện hiện tại: <strong>${theme}</strong></p>
            <ul>
                <li><a href="/set-theme/light" style="color: ${textColor}">Đổi sang Light Theme</a></li>
                <li><a href="/set-theme/dark" style="color: ${textColor}">Đổi sang Dark Theme</a></li>
                <li><a href="/login" style="color: ${textColor}">Đăng nhập</a></li>
                <li><a href="/profile" style="color: ${textColor}">Trang cá nhân (Cần đăng nhập)</a></li>
            </ul>
        </div>
    `);
});

app.get('/set-theme/:theme', (req, res) => {
    const theme = req.params.theme;

    if (theme === 'light' || theme === 'dark') {
        res.cookie('theme', theme, { maxAge: 86400000 });
        res.send(`
            <h3>Đã cài đặt giao diện thành: ${theme}</h3>
            <a href="/">Quay lại trang chủ</a>
        `);
    } else {
        res.status(400).send('Theme không hợp lệ. Chỉ chấp nhận "light" hoặc "dark".');
    }
});

app.get('/login', (req, res) => {
    if (req.session.username) {
        return res.redirect('/profile');
    }

    res.send(`
        <h2>Đăng nhập</h2>
        <form method="POST" action="/login">
            <input type="text" name="username" placeholder="Nhập username của bạn" required />
            <button type="submit">Đăng nhập</button>
        </form>
    `);
});

app.post('/login', (req, res) => {
    const { username } = req.body;

    if (username) {
        req.session.username = username;
        req.session.loginTime = new Date().toLocaleString('vi-VN');
        req.session.viewCount = 0;
        
        res.redirect('/profile');
    } else {
        res.send('Vui lòng nhập username. <a href="/login">Thử lại</a>');
    }
});

app.get('/profile', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send(`
            <h3>Bạn chưa đăng nhập! Vui lòng đăng nhập để xem trang này.</h3>
            <a href="/login">Đi đến trang Đăng nhập</a>
        `);
    }

    req.session.viewCount++;

    res.send(`
        <h2>Thông tin cá nhân</h2>
        <p><strong>Username:</strong> ${req.session.username}</p>
        <p><strong>Thời điểm đăng nhập:</strong> ${req.session.loginTime}</p>
        <p><strong>Số lần truy cập trang này trong phiên hiện tại:</strong> ${req.session.viewCount}</p>
        <br/>
        <a href="/">Về trang chủ</a> | <a href="/logout">Đăng xuất</a>
    `);
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Lỗi khi đăng xuất!');
        }
        res.clearCookie('connect.sid'); 
        
        res.send(`
            <h3>Đã đăng xuất thành công.</h3>
            <a href="/">Về trang chủ</a> | <a href="/login">Đăng nhập lại</a>
        `);
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});