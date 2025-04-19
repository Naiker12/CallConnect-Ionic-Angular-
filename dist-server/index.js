"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express = tslib_1.__importStar(require("express"));
const http = tslib_1.__importStar(require("http"));
const cors = tslib_1.__importStar(require("cors"));
const socket_io_1 = require("socket.io");
const firebase_push_1 = require("./notifications/firebase-push");
const socket_manager_1 = require("./socket/socket-manager");
const app = express();
const server = http.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*'
    }
});
// Middlewares
app.use(cors());
app.use(express.json());
// Initialize Firebase Admin SDK
(0, firebase_push_1.initializeFirebase)();
// Configure WebSocket
(0, socket_manager_1.setupSocketManager)(io);
// Test route
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'server is running ^' });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`* server listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map