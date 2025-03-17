"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AppError_1 = require("./AppError");
const validatePayload = (schema, payload) => {
    var _a, _b;
    const { error } = schema.validate(payload);
    if ((error === null || error === void 0 ? void 0 : error.details) && error.details.length > 0) {
        throw new AppError_1.ValidationError((_b = (_a = error.details[0]) === null || _a === void 0 ? void 0 : _a.message) !== null && _b !== void 0 ? _b : "Validation error occurred.");
    }
};
exports.default = validatePayload;
