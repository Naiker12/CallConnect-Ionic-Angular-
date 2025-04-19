"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocketManager = void 0;
const token_helper_1 = require("../utils/token-helper");
const firebase_push_1 = require("../notifications/firebase-push");
const setupSocketManager = (io) => {
    io.on('connection', (socket) => {
        console.log(`🔌 New client connected: ${socket.id}`);
        socket.on('register-token', ({ userId, token }) => {
            try {
                (0, token_helper_1.saveUserToken)(userId, token);
                socket.emit('token-registered', { success: true });
            }
            catch (error) {
                console.error('Error saving token:', error);
                socket.emit('token-error', { error: 'Failed to save token' });
            }
        });
        socket.on('start-call', async (payload) => {
            const { from, to } = payload;
            try {
                const token = await (0, token_helper_1.getUserToken)(to);
                if (!token) {
                    console.warn(`No token found for user ${to}`);
                    socket.emit('call-error', { error: 'Recipient not available' });
                    return;
                }
                const notificationPayload = {
                    notification: {
                        title: ' Incoming Call',
                        body: `You have a call from ${from}`,
                    },
                    data: {
                        type: 'call',
                        from,
                        to,
                        roomId: payload.roomId || '',
                    },
                };
                await (0, firebase_push_1.sendPushNotification)(token, notificationPayload);
                socket.emit('call-started', { success: true });
            }
            catch (error) {
                console.error('Call failed:', error);
                socket.emit('call-error', { error: 'Failed to initiate call' });
            }
        });
        socket.on('call-response', (response) => {
            if (response.type === 'accept' && response.roomId) {
                socket.join(response.roomId);
                io.to(response.roomId).emit('call-accepted');
            }
            else {
                socket.emit('call-rejected');
            }
        });
        socket.on('disconnect', () => {
            console.log(` Client disconnected: ${socket.id}`);
        });
    });
};
exports.setupSocketManager = setupSocketManager;
//# sourceMappingURL=socket-manager.js.map