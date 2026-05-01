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
        let projects;
        if (req.user?.role === 'admin') {
            projects = await db_1.prisma.project.findMany({
                include: { members: { include: { user: true } }, tasks: true }
            });
        }
        else {
            projects = await db_1.prisma.project.findMany({
                where: { members: { some: { user_id: req.user?.id } } },
                include: { members: { include: { user: true } }, tasks: true }
            });
        }
        const projectsWithProgress = projects.map(p => {
            const total = p.tasks.length;
            const done = p.tasks.filter((t) => t.status?.toLowerCase() === 'done').length;
            let progress = total > 0 ? Math.round((done / total) * 100) : 0;
            // Override for closed projects
            if (p.status?.toLowerCase() === 'closed' || p.status?.toLowerCase() === 'completed') {
                progress = 100;
            }
            console.log(`Project: ${p.name}, Total: ${total}, Done: ${done}, Progress: ${progress}%`);
            return { ...p, progress };
        });
        res.json(projectsWithProgress);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.get('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const project = await db_1.prisma.project.findUnique({
            where: { id: req.params.id },
            include: {
                members: { include: { user: true } },
                tasks: { include: { assignee: true, comments: true } }
            }
        });
        if (!project)
            return res.status(404).json({ error: 'Project not found' });
        const total = project.tasks.length;
        const done = project.tasks.filter((t) => t.status === 'Done').length;
        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
        res.json({ ...project, progress });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { name, description, color, due_date, members } = req.body;
    try {
        const project = await db_1.prisma.project.create({
            data: {
                name,
                description,
                color,
                due_date: due_date ? new Date(due_date) : null,
                owner_id: req.user.id,
            }
        });
        if (members && members.length > 0) {
            await db_1.prisma.projectMember.createMany({
                data: members.map((user_id) => ({
                    project_id: project.id,
                    user_id
                }))
            });
        }
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { name, description, color, due_date } = req.body;
        const project = await db_1.prisma.project.update({
            where: { id: req.params.id },
            data: { name, description, color, due_date: due_date ? new Date(due_date) : null }
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await db_1.prisma.project.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
router.post('/:id/members', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { user_id } = req.body;
    try {
        const member = await db_1.prisma.projectMember.create({
            data: { project_id: req.params.id, user_id },
            include: { user: true }
        });
        res.json(member);
    }
    catch (error) {
        res.status(400).json({ error: 'User already in project or invalid ID' });
    }
});
router.delete('/:id/members/:userId', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await db_1.prisma.projectMember.deleteMany({
            where: { project_id: req.params.id, user_id: req.params.userId }
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
