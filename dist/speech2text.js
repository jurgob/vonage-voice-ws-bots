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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transcribe_file = exports.transcribe = exports.ttsClient = exports.client = void 0;
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
exports.client = new speech.SpeechClient();
exports.ttsClient = new textToSpeech.TextToSpeechClient();
function transcribe() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('transcribe inner');
        // The path to the remote LINEAR16 file
        //   const gcsUri = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/blob/master/sample.wav?raw=true';
        const gcsUri = 'gc://cloud-samples-data/speech/brooklyn_bridge.wav';
        //
        // The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const audio = {
            uri: gcsUri,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };
        const request = {
            audio: audio,
            config: config,
        };
        // Detects speech in the audio file
        const [response] = yield exports.client.recognize(request);
        console.log(`response: ${response}`);
        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');
        console.log(`Transcription: ${transcription}`);
        return transcription;
    });
}
exports.transcribe = transcribe;
function transcribe_file() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('transcribe inner');
        // The path to the remote LINEAR16 file
        //   const gcsUri = 'https://github.com/rafaelreis-hotmart/Audio-Sample-files/blob/master/sample.wav?raw=true';
        const gcsUri = 'gc://cloud-samples-data/speech/brooklyn_bridge.wav';
        //
        // The audio file's encoding, sample rate in hertz, and BCP-47 language code
        const audio = {
            uri: gcsUri,
        };
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        };
        const request = {
            audio: audio,
            config: config,
        };
        // Detects speech in the audio file
        const [response] = yield exports.client.recognize(request);
        console.log(`response: ${response}`);
        const transcription = response.results
            .map((result) => result.alternatives[0].transcript)
            .join('\n');
        console.log(`Transcription: ${transcription}`);
        return transcription;
    });
}
exports.transcribe_file = transcribe_file;
