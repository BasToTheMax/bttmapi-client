var rp = require('request-promise');
var fs = require('fs');

class Client {
    constructor(key, servers, scheme) {
        if (!key) {
            return this.error('ERR_NO_KEY', "You didn't provide any key!");
        }
        if (!servers) {
            if (fs.existsSync(`${__dirname}/servers.json`)) {
                servers = JSON.parse(fs.readFileSync(`${__dirname}/servers.json`).toString())
            } else {
                servers = [
                    'bttmapi1.bastothemax.nl'
                ];
                this.saveServers();
            }
        }
        if (!scheme) {
            scheme = 'https';
        }

        this.key = key;
        this.servers = servers;
        this.oldServers = [];
        this.scheme = scheme;
        
        this.server = null;
        this.fails = {};
    }

    async saveServers() {
        var servers = await rp('https://raw.githubusercontent.com/BasToTheMax/bttmapi-client/main/serverlist.json');
        fs.writeFileSync(`${__dirname}/servers.json`, JSON.stringify(servers));
        console.log(`\tSaved all servers`);
    }

    getServer() {
        if (this.servers.length == 0) {
            console.log(`\tAll servers failed. Re-trying...`);
            this.servers = this.oldServers;
        }
        var server = this.servers[Math.floor(Math.random() * this.servers.length)];

        this.server = server;

        return server;
    }

    error(type, msg) {
        throw new Error(`${type}: ${msg}`);
    }

    async request(method, path, body, params) {
        // console.log(this.fails);
        if (this.fails[`${method}.${path}.${body}.${params}`] > 5) {
            return {
                ok: false
            };
        }
        var server = this.server;
        if (!server) server = this.getServer();

        var res = await rp({
            uri: `${this.scheme}://${server}${path}?key=${this.key}&${params}`,
            method: method,
            body: body,
            simple: false,
            resolveWithFullResponse: true
        });

        // console.log(res.statusCode, res.body);
        var status = res.statusCode;

        if (status == 200) return JSON.parse(res.body);
        else if (status == 502) {
            this.removeServer();
            this.server = null;

            console.log(`\tServer "${this.server}" is down, trying on another server...`);
            if (this.fails[`${method}.${path}.${body}.${params}`] == null || this.fails[`${method}.${path}.${body}.${params}`] == undefined || this.fails[`${method}.${path}.${body}.${params}`] == NaN) {
                console.log(`\tFail count not found for ${path}`);
                this.fails[`${method}.${path}.${body}.${params}`] = 0;
            }
            this.fails[`${method}.${path}.${body}.${params}`]++;

            return await this.request(method, path, body, params);
        }
        else if (status == 429) {
            this.removeServer();
            this.server = null;

            console.log(`\tServer "${this.server}" is ratelimited, trying on another server...`);
            if (this.fails[`${method}.${path}.${body}.${params}`] == null || this.fails[`${method}.${path}.${body}.${params}`] == undefined || this.fails[`${method}.${path}.${body}.${params}`] == NaN) {
                console.log(`\tFail count not found for ${path}`);
                this.fails[`${method}.${path}.${body}.${params}`] = 0;
            }
            this.fails[`${method}.${path}.${body}.${params}`]++;

            return await this.request(method, path, body, params);
        } else {
            return this.error('ERR_INVALID_STATUS', `Response status of ${method} ${path} was ${status}. Expected:  200!`);
        }
    }

    async ping() {
        return await this.request('GET', '/ping', null, null);
    }

    removeServer() {
        // get current servers
        var server = this.server;
        var servers = this.servers;
        var oldServers = this.oldServers;

        // add to removed servers
        oldServers.push(server);

        // Get server index
        var serverIndex = servers.indexOf(server);

        // Remove server
        servers.splice(serverIndex, 1);

        // Save servers
        this.servers = servers;

        // save removed servers
        this.oldServers = oldServers;
    }
}

module.exports = Client;