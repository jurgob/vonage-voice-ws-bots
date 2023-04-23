# neru-ts-express-teamplate

## prerequisites
- install neru cli
- install node version 16  or nvm (https://github.com/nvm-sh/nvm)


## install

```bash
npx degit jurgob/neru-ts-express-teamplate my_neru_project
cd my_neru_project
nvm use #if you are an nvm user, if not be sure you are on node 16
npm i
```

## create and configure vonage app

```bash
neru app create --name my-app
```

this will output an APPLICATION_ID e.g. 

```bash 
✅ application successfully created - application_name="my-app" application_id="60e6b7b8-8d2e-4457-a641-76798774161a"
```
open the file .env.local and write add the following: 

```bash
export NERU_APPLICATION_ID="60e6b7b8-8d2e-4457-a641-76798774161a"
```




## run it locally

set your env var like this: 

```bash 
export NERU_APP_PORT=3000
```

then run it locally:

```bash
npm run dev
```


## run test

```bash
npm test
```
