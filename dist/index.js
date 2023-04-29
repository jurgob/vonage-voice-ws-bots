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
exports.ttsClient = exports.client = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const { Readable } = require('stream');
const isBuffer = require('is-buffer');
const chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;
const app = (0, express_1.default)();
const expressWs = require("express-ws")(app);
const WebSocket = require('ws');
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
exports.client = new speech.SpeechClient();
exports.ttsClient = new textToSpeech.TextToSpeechClient();
// const {transcribe,client,ttsClient} = require("./speech2text");
const port = process.env.PORT || 3000;
const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization: process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
function httpError(err, res) {
    if (err.response) {
        res.status(err.response.status).json(err.response.data);
    }
    else {
        res.status(500).json(err);
    }
}
//speech to text
//http server
app.use(express_1.default.json());
app.get('/_/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.sendStatus(200);
}));
app.get('/ping', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        status: "ok"
    });
}));
// app.get('/trans_file', async (req, res) => {
//     try{
//         console.log('transcribe')
//         const text = await transcribe();
//         res.json(text).status(200);
//     }catch(err){
//         httpError(err, res);
//     }
// });
app.get('/completitions', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prompt = req.query.prompt;
        const completion = yield openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 150,
        });
        console.log(completion.data.choices[0].text);
        res.json(completion.data).status(completion.status);
    }
    catch (err) {
        httpError(err, res);
    }
}));
app.get('/models', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const models = yield openai.listModels();
        // const completion = await openai.createCompletion({
        //     model: "text-davinci-003",
        //     prompt: "Hello world",
        //     });
        res.json(models.data).status(models.status);
    }
    catch (err) {
        httpError(err, res);
    }
}));
// @ts-ignore
app.ws("/echo", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("received ws connection echo");
    ws.on('message', (msg) => {
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN)
                ws.send(msg);
        }, 500);
    });
}));
// @ts-ignore
app.ws("/transcribe", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    const { webhook_url, webhook_method } = req.query;
    // axios
    console.log("received ws connection transcribe", { webhook_method, webhook_url });
    const request = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
        interimResults: false,
    };
    const gRecognizeStream = exports.client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data) => {
        console.log('streaming rec res', data);
        console.log('TRANSCRIBE> ', data.results[0].alternatives[0].transcript);
        if (webhook_url) {
            let webhook_request = {
                url: webhook_url,
                method: webhook_method,
            };
            if (webhook_method === 'POST') {
                webhook_request.data = data;
            }
            else if (webhook_method === 'GET') {
                webhook_request.params = data;
            }
            console.log(`webhook_request`, webhook_request);
            //hit back the webhook in background
            (0, axios_1.default)(webhook_request)
                .then((res) => {
                console.log(`statusCode: ${res.status}`);
                console.log(res);
            })
                .catch((error) => {
                console.error(error);
            });
        }
        // this.config.handler();
        //ws.send(msg);
    });
    ws.on('message', (msg) => {
        if (ws.readyState === WebSocket.OPEN) {
            if (typeof msg !== "string") {
                gRecognizeStream.write(msg);
            }
        }
    });
    ws.on("close", () => {
        gRecognizeStream.destroy();
    });
}));
//ASSISTANT
// @ts-ignore
app.ws("/assistant", (ws, req) => __awaiter(void 0, void 0, void 0, function* () {
    const { webhook_url, webhook_method } = req.query;
    // axios
    console.log("received ws connection transcribe", { webhook_method, webhook_url });
    const request = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
        interimResults: false,
    };
    const gRecognizeStream = exports.client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data) => __awaiter(void 0, void 0, void 0, function* () {
        console.log('streaming rec res', data);
        const prompt = data.results[0].alternatives[0].transcript;
        console.log('TRANSCRIBE> ', prompt);
        const completion = yield openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 150,
        });
        const completition_text = completion.data.choices[0].text;
        console.log(`completition_text ${completition_text}`);
        const [ttsResponse] = yield exports.ttsClient.synthesizeSpeech({
            input: { text: completition_text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: {
                audioEncoding: 'LINEAR16',
                sampleRateHertz: 16000
            },
        });
        console.log(`ttsResponse`, ttsResponse);
        var chunker = new SizeChunker({
            chunkSize: 640 // must be a number greater than zero. 
        });
        const audioStream = Readable.from(ttsResponse.audioContent);
        audioStream.pipe(chunker);
        chunker.on('data', function (chunk) {
            const data = chunk.data;
            let buf;
            if (data.length == 640) {
                try {
                    ws.send(data);
                }
                catch (e) {
                }
                ;
            }
            else {
                buf += data;
                if (buf.length == 640) {
                    try {
                        ws.send(data);
                    }
                    catch (e) {
                    }
                    ;
                    buf = null;
                }
            }
        });
    }));
    ws.on('message', (msg) => {
        if (ws.readyState === WebSocket.OPEN) {
            if (typeof msg !== "string") {
                gRecognizeStream.write(msg);
            }
        }
    });
    ws.on("close", () => {
        gRecognizeStream.destroy();
    });
}));
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
