"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const where = req.user?.role === 'admin' ? {} : { assignee_id: req.user?.id };
        const tasks = await db_1.prisma.task.findMany({
            where,
            include: { project: true, assignee: true }
        });
        res.json(tasks);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticate, async (req, res) => {
    const { title, description, status, priority, project_id, assignee_id, due_date } = req.body;
    try {
        const task = await db_1.prisma.task.create({
            data: {
                title,
                description,
                status,
                priority,
                project_id,
                assignee_id,
                creator_id: req.user.id,
                due_date: due_date ? new Date(due_date) : null,
            }
        });
        res.json(task);
    }
    catch (error) {
        console.error('Task Creation Error:', error);
        res.status(500).json({ error: error.message || 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticate, async (req, res) => {
    const { title, description, status, priority, assignee_id, due_date } = req.body;
    try {
        const task = await db_1.prisma.task.update({
            where: { id: req.params.id },
            data: {
                title, description, status, priority, assignee_id,
                due_date: due_date ? new Date(due_date) : null,
            }
        });
        res.json(task);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const task = await db_1.prisma.task.findUnique({ where: { id: req.params.id } });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        if (req.user?.role !== 'admin' && task.creator_id !== req.user?.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        await db_1.prisma.task.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id/comments', auth_1.authenticate, async (req, res) => {
    try {
        const comments = await db_1.prisma.comment.findMany({
            where: { task_id: req.params.id },
            include: { user: true },
            orderBy: { createdAt: 'asc' }
        });
        res.json(comments);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/comments', auth_1.authenticate, async (req, res) => {
    const { content } = req.body;
    try {
        const comment = await db_1.prisma.comment.create({
            data: {
                content,
                task_id: req.params.id,
                user_id: req.user.id
            },
            include: { user: true }
        });
        res.json(comment);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
