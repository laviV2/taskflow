"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const team = await db_1.prisma.user.findMany({
            select: {
                id: true, name: true, email: true, role: true, avatar_url: true, createdAt: true,
                assignedTasks: true
            }
        });
        res.json(team);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/invite', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { email, role, name } = req.body;
    try {
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing)
            return res.status(400).json({ error: 'User exists' });
        // Dummy password for invited users
        const password = await bcrypt_1.default.hash('password123', 10);
        const user = await db_1.prisma.user.create({
            data: { email, role, name, password }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id/role', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const user = await db_1.prisma.user.update({
            where: { id: req.params.id },
            data: { role: req.body.role }
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await db_1.prisma.user.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
