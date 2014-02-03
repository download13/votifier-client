var net = require('net');
var fs = require('fs');
var ursa = require('ursa');

exports.getValidPublicKey = function(pem) { // Creates PEM file from whatever it is that Votifier puts out
	pem = pem.trimLeft();
	if(pem.indexOf('-----BEGIN PUBLIC KEY-----') != 0) {
		var lines = [];
		pem = pem.replace(/[\r\n]+/g, '');
		while(pem.length > 0) {
			lines.push(pem.substr(0, 64));
			pem = pem.substr(64);
		}
		pem = lines.
		pem = '-----BEGIN PUBLIC KEY-----\n' + lines.join('\n') + '\n-----END PUBLIC KEY-----\n';
	}
	try {
		ursa.createPublicKey(pem, 'utf8');
	} catch(e) {
		return null;
	}
	return pem;
}

function VotifierService(serviceName) {
	this.name = serviceName.trim();
	this._start = 'VOTE\n' + this.name + '\n';
}
VotifierService.prototype.vote = function(username, voterIp, address, port, pem, cb) {
	var data = this._start + username.trim() + '\n' + voterIp + '\n' + Math.floor(Date.now() / 1000) + '\n';
	port = port || 8192;
	var pubkey = ursa.createPublicKey(pem, 'utf8');
	var packet = pubkey.encrypt(data, 'utf8', 'binary', ursa.RSA_PKCS1_PADDING);

	net.createConnection(port, address).on('readable', function() {
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
