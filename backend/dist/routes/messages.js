"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all messages for a project
router.get('/project/:projectId', auth_1.authenticate, async (req, res) => {
    try {
        const projectId = req.params.projectId;
        const messages = await db_1.prisma.message.findMany({
            where: { project_id: projectId },
            include: { sender: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get all messages between current user and another user
router.get('/user/:userId', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.params.userId;
        const messages = await db_1.prisma.message.findMany({
            where: {
                OR: [
                    { sender_id: req.user.id, receiver_id: userId },
                    { sender_id: userId, receiver_id: req.user.id }
                ],
                project_id: { equals: null }
            },
            include: { sender: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(messages);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Send a message
router.post('/', auth_1.authenticate, async (req, res) => {
    const { content, receiver_id, project_id } = req.body;
    try {
        const message = await db_1.prisma.message.create({
            data: {
                content,
                sender_id: req.user.id,
                receiver_id: receiver_id || null,
                project_id: project_id || null
            },
            include: { sender: true }
        });
        res.json(message);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get recent chats/contacts (for sidebar in messages)
router.get('/contacts', auth_1.authenticate, async (req, res) => {
    try {
        const users = await db_1.prisma.user.findMany({
            where: { id: { not: req.user.id } },
            select: { id: true, name: true, role: true, avatar_url: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
