/**

what's in this file: 
In this file you specify a JS module with some callbacks. Basically those callbacks get calls when you receive an event from the vonage backend. There's also a 
special route function that is called on your conversation function start up allowing your to expose new local http endpoint

the event you can interract here are the same you can specify in your application: https://developer.nexmo.com/application/overview

event callbacks for rtc: 
 - rtcEvent (event, context)

event callbacks for anything else (those one are just standard express middleware access req.nexmo to get the context): 

voice callbacks 
 - voiceEvent (req, res, next)
 - voiceAnswer (req, res, next)

messages callbacks (if you specifiy one of thise, you need to declare both of them, those one are just standard express middleware access req.nexmo ):
- messagesInbound (req, res, next)
- messagesStatus (req, res, next)


route(app) // app is an express app




nexmo context: 
you can find this as the second parameter of rtcEvent funciton or as part or the request in req.nexmo in every request received by the handler 
you specify in the route function.

it contains the following: 
const {
        generateBEToken,
        generateUserToken,
        logger,
        csClient,
        storageClient
} = nexmo;

- generateBEToken, generateUserToken,// those methods can generate a valid token for application
- csClient: this is just a wrapper on https://github.com/axios/axios who is already authenticated as a nexmo application and 
    is gonna already log any request/response you do on conversation api. 
    Here is the api spec: https://jurgob.github.io/conversation-service-docs/#/openapiuiv3
- logger: this is an integrated logger, basically a bunyan instance
- storageClient: this is a simple key/value inmemory-storage client based on redis

*/



/** 
 * 
 * This function is meant to handle all the asyncronus event you are gonna receive from conversation api 
 * 
 * it has 2 parameters, event and nexmo context
 * @param {object} event - this is a conversation api event. Find the list of the event here: https://jurgob.github.io/conversation-service-docs/#/customv3
 * @param {object} nexmo - see the context section above
 * */

const DATACENTER = `https://api.nexmo.com` 
const SERVER_URL_DOMAIN=process.env.SERVER_URL_DOMAIN
const WS_CALLBACK_URL = `wss://${SERVER_URL_DOMAIN}`

console.log(`HOSTNAME: ${SERVER_URL_DOMAIN}`)

function getDomain(url){
    const domain = url.split('://')[1]
    return domain;
}

const voiceEvent = async (req, res, next) => {
    const { logger, csClient } = req.nexmo;

    try { 
        // logger.info("voiceEvent", { req_body   : req.body})
        res.json({})

    } catch (err) {
        
        logger.error("Error on voiceEvent function")
    }
    
}

const voiceAnswer = async (req, res, next) => {
    const { logger, csClient,config } = req.nexmo;
    logger.info("req", { req_body   : req.body})
    try {
        
        // const wsboturl = `${WS_CALLBACK_URL}/echo`
        const wsboturl = `${WS_CALLBACK_URL}/transcribe?webhook_url=${config.server_url}/webhook/transcriptions&webhook_method=POST`


        return res.json([
            {
                "action": "talk",
                "text": "You are listening to a Call made with Voice API"
            },
            {
              action: "connect",
              endpoint: [
                {
                  type: "websocket",
                  uri: wsboturl,
                  "content-type": "audio/l16;rate=16000",
                },
              ],
            },
          ])

    } catch (err) {
        logger.error("Error on voiceAnswer function")
    }

}

const route = (app, express) => {
    app.post("/webhook/transcriptions", async (req, res) => {
        const { logger, csClient, config } = req.nexmo;

        try {
            const data = req.body
            console.log(`TRANSCRIPTION RCV: ${data.results[0].alternatives[0].transcript}`)
            // const { data } = await csClient.get(`/v3/users/${username}`)
            res.json(req.body)
        } catch (err) {
            logger.error("Error on /api/users/:username route", err)
        }
    })
}



module.exports = {
    voiceEvent,
    voiceAnswer,
    route
}