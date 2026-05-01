"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Sign In
router.post('/signin', auth_1.authenticate, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await db_1.prisma.attendance.findFirst({
            where: {
                user_id: req.user.id,
                date: { gte: today }
            }
        });
        if (existing) {
            return res.status(400).json({ error: 'Already signed in today' });
        }
        const attendance = await db_1.prisma.attendance.create({
            data: { user_id: req.user.id }
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Sign Out
router.post('/signout', auth_1.authenticate, async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existing = await db_1.prisma.attendance.findFirst({
            where: {
                user_id: req.user.id,
                date: { gte: today }
            }
        });
        if (!existing) {
            return res.status(400).json({ error: 'Not signed in today' });
        }
        if (existing.signOut) {
            return res.status(400).json({ error: 'Already signed out' });
        }
        const attendance = await db_1.prisma.attendance.update({
            where: { id: existing.id },
            data: { signOut: new Date() }
        });
        res.json(attendance);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get Attendance
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            const allAttendance = await db_1.prisma.attendance.findMany({ include: { user: true }, orderBy: { date: 'desc' } });
            res.json(allAttendance);
        }
        else {
            const myAttendance = await db_1.prisma.attendance.findMany({ where: { user_id: req.user.id }, orderBy: { date: 'desc' } });
            res.json(myAttendance);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
