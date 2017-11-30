/* eslint-disable no-console */
const tls = require('tls')
const fs = require('fs')

const options = {
	// Necessary only if using the client certificate authentication
	key: fs.readFileSync('ryans-key.pem'),
	cert: fs.readFileSync('ryans-cert.pem'),

	// Necessary only if the server uses the self-signed certificate
	ca: [fs.readFileSync('ryans-cert.pem')],

	checkServerIdentity: () => undefined,
}

const socket = tls.connect(8000, options, () => {
	console.log('client connected', socket.authorized ? 'authorized' : 'unauthorized')
	process.stdin.pipe(socket)
	process.stdin.resume()
})

socket.setEncoding('utf8')

socket.on('data', (data) => {
	console.log(data)
})

socket.on('end', () => {
	socket.close()
})
