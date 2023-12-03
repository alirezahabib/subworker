export default {
  async fetch(request, env) {
    try {
      const { pathname } = new URL(request.url);

      if (pathname.startsWith("/status")) {
        const httpStatusCode = Number(pathname.split("/")[2]);

        return Number.isInteger(httpStatusCode)
          ? fetch("https://http.cat/" + httpStatusCode)
          : new Response("That's not a valid HTTP status code.");
      }

      if (pathname.startsWith("/SecretPath1") || 
          pathname.startsWith("/SecretPath2")) {
        let response = await fetch("https://gist.githubusercontent.com/alirezahabib/link-to-gist-raw-file/raw/subscriptionlist.txt");
        let text = await response.text();
        let configs = await Promise.all(get_configs());
        return new Response(btoa(`${text}\n${configs.join('\n')}` + "-Update:" + get_date()));
      }

      // You may define different access levels to different lists 
      if (pathname.startsWith("/SecretPath3")) {
        let response = await fetch("https://gist.githubusercontent.com/alirezahabib/link-to-gist-raw-file-2/raw/mysub-reality.txt");
        let text = await response.text();
        return new Response(btoa(text + "-Update:" + get_date()));
      }

      return fetch("https://welcome.developers.workers.dev");
    } catch(e) {
      return new Response(err.stack, { status: 500 });
    }
  }
}

function get_date() {
  return new Date().toLocaleString('en-GB', { timeZone: 'Asia/Tehran' }).replaceAll(' ','');
}

function get_configs() {
    const config1 = "vless://75d447cb-9103-41d0-ae96-9d2fc63041d0@";  // V2ray / Xray config link initial
    const config2 = ":443?encryption=none&security=tls&sni=mysni.example.net&type=ws&host=host.example.net&path=examplepath#MyConfig-";
    
    // Retrieving clean CF ips
    const domains = [
        "mci.ircf.space",
        "mcix.ircf.space",
        "mtn.ircf.space",
        "mtnx.ircf.space",
        "mkh.ircf.space",
        "hwb.ircf.space",
        "ast.ircf.space",
        "sht.ircf.space",
        "prs.ircf.space",
        "rsp.ircf.space",
        "ztl.ircf.space",
        "psm.ircf.space",
        "fnv.ircf.space"
    ];

    // Use Cloudflare DoH for better latency (You are running this on a Cloudflare worker server!)
    return domains.map(domain => {
        const url = `https://cloudflare-dns.com/dns-query?name=${domain}&type=A`;

        return fetch(url, {
            headers: {
                'Accept': 'application/dns-json'
            }
        })
            .then(response => response.json())
            .then(data => {
                const ipAddress = data.Answer[0].data;
                return `${config1}${ipAddress}${config2}${ipAddress}`;
            })
            .catch(error => {
                console.error(`Error resolving IP address for ${domain}: ${error}`);
                return null;
            });
    }).filter(config => config !== null);
}
