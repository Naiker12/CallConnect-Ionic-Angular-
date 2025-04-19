"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserToken = exports.getUserToken = exports.saveUserToken = void 0;
const userTokens = new Map();
const saveUserToken = (userId, token) => {
    userTokens.set(userId, token);
    console.log(`💾 Token saved for user ${userId}`);
};
exports.saveUserToken = saveUserToken;
const getUserToken = (userId) => {
    return userTokens.get(userId);
};
exports.getUserToken = getUserToken;
const removeUserToken = (userId) => {
    if (userTokens.has(userId)) {
        userTokens.delete(userId);
        console.log(`🗑️ Token removed for user ${userId}`);
    }
};
exports.removeUserToken = removeUserToken;
//# sourceMappingURL=token-helper.js.map