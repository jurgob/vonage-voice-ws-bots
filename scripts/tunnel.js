const localtunnel = require('localtunnel');
const fs = require('fs');

(async () => {
  const tunnel = await localtunnel({ port: 3000 });
  const tunnelCapiFn = await localtunnel({ port: 3001 });

const tunnelDomain = tunnel.clientId+".loca.lt"
  console.log({
    tunnel: tunnelDomain
  })
  const tunnelDomainCapiFn = tunnelCapiFn.clientId+".loca.lt"
  console.log({
    tunnel: tunnelDomainCapiFn
  })
  fs.writeFileSync('.env.srv.local', tunnelDomain);
  fs.writeFileSync('.env.capifn.local', tunnelDomainCapiFn);

  tunnel.on('close', () => {
    // tunnels are closed
  });
})();