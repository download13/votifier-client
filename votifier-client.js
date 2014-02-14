var net = require('net');
var fs = require('fs');
var ursa = require('ursa');

exports.getValidPublicKey = function(key) { // Creates PEM formatted key from the raw key data Votifier gives out
	key = key.trimLeft();
	if(key.indexOf('-----BEGIN PUBLIC KEY-----') != 0) {
		var lines = [];
		key = key.replace(/[\r\n]+/g, '');
		while(key.length > 0) {
			lines.push(key.substr(0, 64));
			key = key.substr(64);
		}
		key = lines.
		key = '-----BEGIN PUBLIC KEY-----\n' + lines.join('\n') + '\n-----END PUBLIC KEY-----\n';
	}
	try {
		ursa.createPublicKey(key, 'utf8');
	} catch(e) {
		return null;
	}
	return key;
}

function VotifierService(serviceName) {
	this.name = serviceName.trim();
	this._start = 'VOTE\n' + this.name + '\n';
}
// Required options: username, voterIP, address, port, pubkey
VotifierService.prototype.vote = function(vote, cb) {
	var voterIP = vote.voterIP || '127.0.0.1';
	var port = vote.port || 8192;
	var data = this._start + vote.username.trim() + '\n' + voterIP + '\n' + Math.floor(Date.now() / 1000) + '\n';
	var pubkey = ursa.createPublicKey(vote.pubkey, 'utf8');
	var packet = pubkey.encrypt(data, 'utf8', 'binary', ursa.RSA_PKCS1_PADDING);

	net.createConnection(port, vote.address).on('readable', function() {
		var version = this.read();
		if(version == null) return;
		version = version.toString('utf8').trim();
		if(version.indexOf('VOTIFIER ') == 0) {
			this.end(packet, 'binary');
			cb(true);
		} else {
			this.end();
			this.destroy();
			cb(false);
		}
	});
}

exports.VotifierService = VotifierService;
