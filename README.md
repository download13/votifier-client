#votifier-client

**Install** `npm install votifier-client`

## API

### getValidPublicKey(key)

Creates a PEM formatted key from the raw key data given by Votifier

### new VotifierService(name)

Creates a votifier service with the given name. Has only one method.

* vote(voteObject)

  `voteObject` properties are as follows:
  * username - Minecraft username of the user who voted
  * voterIP - IP address of the user who voted (defaults to 127.0.0.1)
  * address - Address of the votifier server
  * port - Port of the votifier server (defaults to 8192)
  * pubkey - PEM formatted public key of the votifier server

## Usage

```javascript
var VotifierService = require('votifier-client').VotifierService;

var service = new VotifierService('tiddlywinks');
service.vote({
    username: 'Notch',
    address: '<server ip>',
    pubkey: publicKey // We got this by magic earlier
});
```
