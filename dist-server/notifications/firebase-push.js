"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPushNotification = exports.initializeFirebase = void 0;
const tslib_1 = require("tslib");
const firebase_admin_1 = tslib_1.__importDefault(require("firebase-admin"));
const path_1 = tslib_1.__importDefault(require("path"));
const initializeFirebase = () => {
    const serviceAccountPath = path_1.default.resolve(__dirname, '../../firebase-service-account.json');
    if (!firebase_admin_1.default.apps.length) {
        firebase_admin_1.default.initializeApp({
            credential: firebase_admin_1.default.credential.cert(serviceAccountPath),
        });
        console.log("Firebase Admin initialized");
    }
};
exports.initializeFirebase = initializeFirebase;
const sendPushNotification = async (token, payload) => {
    try {
        const message = {
            token: token,
            ...payload,
        };
        const response = await firebase_admin_1.default.messaging().send(message);
        console.log("Push notification sent:", response);
    }
    catch (error) {
        console.error('Error sending push notification:', error);
    }
};
exports.sendPushNotification = sendPushNotification;
//# sourceMappingURL=firebase-push.js.map