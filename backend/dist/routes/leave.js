"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Apply for leave
router.post('/', auth_1.authenticate, async (req, res) => {
    const { reason, startDate, endDate } = req.body;
    try {
        const leave = await db_1.prisma.leave.create({
            data: {
                user_id: req.user.id,
                reason,
                startDate: new Date(startDate).toISOString(),
                endDate: new Date(endDate).toISOString()
            }
        });
        res.json(leave);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Get leaves
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        if (req.user?.role === 'admin') {
            const leaves = await db_1.prisma.leave.findMany({ include: { user: true }, orderBy: { createdAt: 'desc' } });
            res.json(leaves);
        }
        else {
            const leaves = await db_1.prisma.leave.findMany({ where: { user_id: req.user.id }, orderBy: { createdAt: 'desc' } });
            res.json(leaves);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Approve/Reject leave
router.put('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    const { status } = req.body; // 'Approved' or 'Rejected'
    try {
        const leave = await db_1.prisma.leave.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(leave);
    }
    catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
