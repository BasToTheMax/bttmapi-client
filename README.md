# bttmapi-client
> The official js client for bttmapi

## Note
To use this, you will need to have an API key.
You can request one via our [Discord](https://discord.gg/jT5XbjExeD).

## Features

- All endpoints
- Automatic server selection
- Automatic retrying
## Usage/Examples

### Importing
```js
const BTTMApi = require('bttmapi-client');
const API = new BTTMApi(<key>);
```

### Using (async)
```js
const result = await API.ping();
```

### Using (promises)
```js
API.ping().then((result) => {
  // do something with the result
});
```
## Install
Run this to install the package
```bash
npm install bttmapi-client
```


## Authors
- [@BasToTheMax](https://www.github.com/BasToTheMax)


## FAQ

*No questions where asked yet*
## Support

For support, make an issue or join our [Discord](https://discord.gg/jT5XbjExeD) server


## Used By

This project is used by the following companies:

*None so far, please contact me via discord if you want to be here!*
## License

This project is MIT licensed:
[More info](https://choosealicense.com/licenses/mit/)

