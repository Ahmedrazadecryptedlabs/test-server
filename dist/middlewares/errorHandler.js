"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    err.status = err.status || 500;
    err.message = err.message || "error";
    res.status(err.status).json({
        status: err.status,
        message: err.message,
    });
};
exports.default = errorHandler;
