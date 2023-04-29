# neru-ts-express-teamplate

## prerequisites
- install neru cli
- install node version 16  or nvm (https://github.com/nvm-sh/nvm)


## install

```bash
npx degit jurgob/vonage-voice-ws-bots vonage-voice-ws-bots
cd vonage-voice-ws-bots
nvm use #if you are an nvm user, if not be sure you are on node 16
npm i
```




## run it locally
create a .env.local documents and put in it: 

```bash
export OPENAI_API_KEY="<open ai key>"
export OPENAI_ORG_ID="<open org id>"
```

create a file `gapp-creds.json`

put there the credentials of your google engine app. 
be sure your google app has the text to speach and the speach to text enabled!


set your env var like this: 


then run it locally:

you will need 3 terminal

1. in the first terminal, you will expose your desktop. is important you do it as the first thing: 

```bash
npm run tunnel
```

2. run the voice websocket bot service:
```bash
npm run dev
```

3. run the vonage example: 
```bash
cd src_capi_fn
nvm use 
npm start
```

now if you call your LVN you will hear the echo demo. 




```bash
npm run dev
```


## run test

```bash
npm test
```
