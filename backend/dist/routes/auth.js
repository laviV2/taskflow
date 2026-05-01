"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/signup', async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = await db_1.prisma.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: 'Email already exists' });
        const passwordHash = await bcrypt_1.default.hash(password, 10);
        const user = await db_1.prisma.user.create({
            data: { name, email, password: passwordHash, role: role === 'admin' ? 'admin' : 'member' }
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });
        const isValid = await bcrypt_1.default.compare(password, user.password);
        if (!isValid)
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
        res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await db_1.prisma.user.findUnique({ where: { id: req.user?.id } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
