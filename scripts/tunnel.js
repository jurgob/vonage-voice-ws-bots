const localtunnel = require('localtunnel');
const ngrok = require('ngrok');
const fs = require('fs');

// type Service = "ngrok" | "localtunnel";

async function localTunnel(){
  const tunnel = await localtunnel({ port: 3000 });
  const tunnelCapiFn = await localtunnel({ port: 5001 });

  const tunnelDomain = tunnel.clientId+".loca.lt"
  const tunnelDomainCapiFn = tunnelCapiFn.clientId+".loca.lt"

  return [
    {domain: tunnelDomain,port:3000},
    {domain: tunnelDomainCapiFn,port:5001}
  ]
}

async function ngrokTunnel(){
    
    let url = await ngrok.connect({
        port:3000,
        region: 'eu',
        bind_tls: true
    });
    url = url.split('://')[1]

    let url2 = await ngrok.connect({
        port:5001,
        region: 'eu',
        bind_tls: true
    });
    url2 = url2.split('://')[1]

    console.log(url2)
    return [
        {domain: url,port:3000},
        {domain: url2,port:5001}
    ]
}

async function tunnelFunction(service){
    if(["ngrok" , "lt"].includes(service) === false) throw new Error("service not supported")
    
    if(service === "ngrok"){
        return ngrokTunnel()
    }else{
        return localTunnel()
    }
}

(async () => {
  const service = "ngrok"
  console.log(`statring tunnel with service ${service}`)
  
  const [t1, t2] = await tunnelFunction(service);

  console.log(`${t1.port} ${t1.domain}`)
  console.log(`${t2.port} ${t2.domain}`)

  fs.writeFileSync('.env.srv.local', t1.domain);
  fs.writeFileSync('.env.capifn.local', t2.domain);

})();