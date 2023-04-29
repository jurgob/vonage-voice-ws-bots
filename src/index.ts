import express, { Application } from "express";
import axios from "axios";

const { Readable } = require('stream');
const isBuffer = require('is-buffer')
const chunkingStreams = require('chunking-streams');
var SizeChunker = chunkingStreams.SizeChunker;


const app = express();
const expressWs = require("express-ws")(app);
const WebSocket = require('ws');
const {transcribe,client,ttsClient} = require("./speech2text");

const port = process.env.PORT || 3000;


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization:process.env.OPENAI_ORG_ID,
    apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

function httpError(err:any, res:any){
    if (err.response) {
        res.status(err.response.status).json(err.response.data);
    } else {
        res.status(500).json(err);
    }
}

//speech to text




//http server
app.use(express.json());

app.get('/_/health', async (req, res) => {
    res.sendStatus(200);
});

app.get('/ping', async (req, res) => {
    res.status(200).json({
        status:"ok"
    });
});

app.get('/trans_file', async (req, res) => {
    try{
        console.log('transcribe')
        const text = await transcribe();
        res.json(text).status(200);
    }catch(err){
        httpError(err, res);
    }
});

app.get('/completitions', async (req, res, next) => {
    try{
        const prompt = req.query.prompt;
        const completion = await openai.createCompletion({
            model: "text-davinci-003",
            prompt,
            max_tokens: 150,
            });
            console.log(completion.data.choices[0].text);
            res.json(completion.data).status(completion.status);
    }catch(err){
        httpError(err, res);
    }
  
});


app.get('/models', async (req, res, next) => {
    try{
        const models = await openai.listModels();
        // const completion = await openai.createCompletion({
        //     model: "text-davinci-003",
        //     prompt: "Hello world",
        //     });

            res.json(models.data).status(models.status);
    }catch(err){
        httpError(err, res);
    } 
});

// @ts-ignore
app.ws("/echo", async (ws, req) => {
    console.log("received ws connection echo");
    ws.on('message', (msg) => {
        setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN) ws.send(msg);
        }, 500); 
    });
  });

// @ts-ignore
app.ws("/transcribe", async (ws, req) => {
    const {webhook_url, webhook_method} = req.query;
    // axios
    console.log("received ws connection transcribe", {webhook_method, webhook_url});
    const request = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
        interimResults: false,
    }

    const gRecognizeStream = client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", (data: any) => {
            console.log('streaming rec res',data);

            console.log('TRANSCRIBE> ',data.results[0].alternatives[0].transcript);
            if (webhook_url){

                let webhook_request:any = {
                    url: webhook_url,
                    method: webhook_method,
                };
                if (webhook_method === 'POST'){
                    webhook_request.data = data; 
                }else if (webhook_method === 'GET'){
                    webhook_request.params = data;
                }
                console.log(`webhook_request`, webhook_request)
                //hit back the webhook in background
                axios(webhook_request)
                    .then((res) => {
                        console.log(`statusCode: ${res.status}`)
                        console.log(res)
                    })
                    .catch((error) => {
                        console.error(error)
                    })
            }

            // this.config.handler();
            //ws.send(msg);
        });

    ws.on('message', (msg) => {
        if (ws.readyState === WebSocket.OPEN) {
            if (typeof msg !== "string"){
                gRecognizeStream.write(msg);
            }
        }
    });

    ws.on("close", () => {
        gRecognizeStream.destroy();
    });

})

//ASSISTANT


// @ts-ignore
app.ws("/assistant", async (ws, req) => {
    const {webhook_url, webhook_method} = req.query;
    // axios
    console.log("received ws connection transcribe", {webhook_method, webhook_url});
    const request = {
        config: {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
        },
        interimResults: false,
    }

    const gRecognizeStream = client
        .streamingRecognize(request)
        .on("error", console.error)
        .on("data", async (data: any) => {
            console.log('streaming rec res',data);

            const prompt = data.results[0].alternatives[0].transcript;
            console.log('TRANSCRIBE> ',prompt);

            const completion = await openai.createCompletion({
               model: "text-davinci-003",
                prompt,
                max_tokens: 150,
            });
            const completition_text = completion.data.choices[0].text;
            
            console.log(`completition_text ${completition_text}`)
            const [ttsResponse] = await ttsClient.synthesizeSpeech({
                input: {text: completition_text},
                voice: {languageCode: 'en-US', ssmlGender: 'NEUTRAL'},
                audioConfig: {
                    audioEncoding: 'LINEAR16',
                    sampleRateHertz: 16000
                },
            })

            console.log(`ttsResponse`, ttsResponse)
            var chunker = new SizeChunker({
                chunkSize: 640 // must be a number greater than zero. 
            });
            
            const audioStream = Readable.from(ttsResponse.audioContent);

            audioStream.pipe(chunker);
            chunker.on('data', function(chunk: any) {
                const data = chunk.data;
                let buf: any;
                if (data.length == 640){
                    try {
                       ws.send(data);
                    }
                    catch (e) {
                    };
                }
                else{
                    buf += data;
                    if (buf.length == 640){
                        try {
                           ws.send(data);
                        }
                        catch (e) {
                        };
                        buf = null;
                    }
                }
            });
        
        });

    ws.on('message', (msg: any) => {
        if (ws.readyState === WebSocket.OPEN) {
            if (typeof msg !== "string"){
                gRecognizeStream.write(msg);
            }
        }
    });

    ws.on("close", () => {
        gRecognizeStream.destroy();
    });

})



app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
