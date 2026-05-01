"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Triggering server restart to pick up new .env
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const tasks_1 = __importDefault(require("./routes/tasks"));
const team_1 = __importDefault(require("./routes/team"));
const attendance_1 = __importDefault(require("./routes/attendance"));
const leave_1 = __importDefault(require("./routes/leave"));
const messages_1 = __importDefault(require("./routes/messages"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
app.use((0, cors_1.default)({
    origin: true,
    credentials: true,
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
const path_1 = __importDefault(require("path"));
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/api/auth', auth_1.default);
app.use('/api/projects', projects_1.default);
app.use('/api/tasks', tasks_1.default);
app.use('/api/team', team_1.default);
app.use('/api/attendance', attendance_1.default);
app.use('/api/leaves', leave_1.default);
app.use('/api/messages', messages_1.default);
// SPA Routing: Serve index.html for any non-API routes
app.get('/{*splat}', (req, res) => {
    if (req.path.startsWith('/api'))
        return res.status(404).json({ error: 'Not found' });
    res.sendFile(path_1.default.join(__dirname, '../public/index.html'));
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
