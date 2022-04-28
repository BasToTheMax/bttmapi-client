var Client = require('.');
var client = new Client('QLRBHUQ-6IZUFFY-V4TWV3A-22JTLEI');

async function test() {
    var result = await client.ping();

    // console.log(result);
}
test();