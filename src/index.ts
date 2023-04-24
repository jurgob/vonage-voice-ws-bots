import express, { Application } from "express";

const app = express();
const expressWs = require("express-ws")(app);
const WebSocket = require('ws');
const {transcribe,client} = require("./speech2text");

const port = process.env.PORT || 3000;


const { Configuration, OpenAIApi } = require("openai");
const configuration = new Configuration({
    organization:"org-oMJBQkryXF2ijjAwXneePuI2",
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


    // ws.on("message", async (msg) => {
    //  console.log("received ws msg");
    //   if (typeof msg === "string") {
    //     console.log(msg);
    //   } else {
    //     console.log(msg);
    //     // STTConnector.stream(msg);
    //   }
    // });
  
    // ws.on("close", () => {
    // //   STTConnector.destroy();
    // });
  });

  // @ts-ignore
app.ws("/transcribe", async (ws, req) => {
    console.log("received ws connection transcribe");
    const request = {
        audio: {

        },
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
            // console.log('streaming rec res',data);

            console.log('TRANSCRIBE> ',data.results[0].alternatives[0].transcript);
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




app.listen(port, () => {
    console.log(`App listening on port ${port}`)
});
