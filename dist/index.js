"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const neru_alpha_1 = require("neru-alpha");
const app = (0, express_1.default)();
const port = process.env.NERU_APP_PORT;
app.use(express_1.default.json());
app.get('/_/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(200);
}));
app.get('/', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    res.send('hello world').status(200);
}));
app.get('/token', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const token = neru_alpha_1.neru.createVonageToken({ exp: Date.now() + 100000000 });
    res.json({
        token
    }).status(200);
}));
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
