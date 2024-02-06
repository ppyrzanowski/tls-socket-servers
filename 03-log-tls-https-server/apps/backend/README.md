# 03-log-tls-https-server

HTTPS-Webserver for logging information about the connecting clients TLS handshake and connection.

## Generate Selfsigned Certificate and Keys

Generate server private key pem file and signed server certificate pem file

CN - Common Name must be `localhost.`, when executing localy. In production this would be the
hostname of socket server (Validate if claims of server are true)

```bash
# Generate server-certificate its private-key
openssl req -newkey rsa:2048 -nodes -keyout src/server/certificates/key.pem -x509 -days 365 -out src/server/certificates/certificate.pem
# Copy server-certificate into client directory
cp src/server/certificates/certificate.pem src/client/certificates/server-certificate.pem
```

## Execution

After generating the server private key, server-certificate and creating a copy of server-certificate for the client:

1. Install node packages with `pnpm install`.
2. Build the project with `pnpm build`.
3. Start the server with `pnpm run server`. -> Starts HTTPS server at port `9443`.
4. Start the client with `pnpm run client`. -> Sends on HTTPS request to the server.
5. Server is killed with `Ctlr-c`.
