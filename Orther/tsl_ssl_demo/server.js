/* eslint-disable no-console */
const tls = require('tls')
const fs = require('fs')

const options = {
	key: fs.readFileSync('ryans-key.pem'),
	cert: fs.readFileSync('ryans-cert.pem'),

	// This is necessary only if using the client certificate authentication.
	requestCert: true,

	// This is necessary only if the client uses the self-signed certificate.
	ca: [fs.readFileSync('ryans-cert.pem')],
}

const server = tls.createServer(options, (socket) => {
	console.log('server connected', socket.authorized ? 'authorized' : 'unauthorized')
	socket.write('welcome!\n')
	socket.setEncoding('utf8')
	socket.pipe(socket)
})

server.listen(8000, () => {
	console.log('server bound')
})
