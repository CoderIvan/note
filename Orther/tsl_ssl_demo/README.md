# TLS/SSL

## 基本过程
1. 客户端向服务器端索要并验证公钥。
1. 双方协商生成"对话密钥"。
1. 双方采用"对话密钥"进行加密通信。

## Nodejs API

The TLS/SSL is a public/private key infrastructure (PKI). For most common cases, each client and server must have a private key.

Private keys can be generated in multiple ways. The example below illustrates use of the OpenSSL command-line interface to generate a 2048-bit RSA private key:
```sh
openssl genrsa -out ryans-key.pem 2048
```
The file will actually produce a public - private key pair. 

With TLS/SSL, all servers (and some clients) must have a certificate. Certificates are public keys that correspond to a private key, and that are digitally signed either by a Certificate Authority or by the owner of the private key (such certificates are referred to as "self-signed"). The first step to obtaining a certificate is to create a Certificate Signing Request (CSR) file.

The OpenSSL command-line interface can be used to generate a CSR for a private key:
```sh
openssl req -new -sha256 -key ryans-key.pem -out ryans-csr.pem
```
Once the CSR file is generated, it can either be sent to a Certificate Authority for signing or used to generate a self-signed certificate.

Creating a self-signed certificate using the OpenSSL command-line interface is illustrated in the example below:
```sh
openssl x509 -req -in ryans-csr.pem -signkey ryans-key.pem -out ryans-cert.pem
```
Once the certificate is generated, it can be used to generate a .pfx or .p12 file:
```sh
openssl pkcs12 -export -in ryans-cert.pem -inkey ryans-key.pem -out ryans.pfx

openssl pkcs12 -in ryans.pfx -out test.key.pem -nodes

## modify test.key.pem

openssl rsa -in test.key.pem -out test_new.key.pem
```

Where:

* in: is the signed certificate
* inkey: is the associated private key
* certfile: is a concatenation of all Certificate Authority (CA) certs into a single file, e.g. cat ca1-cert.pem ca2-cert.pem > ca-cert.pem

## Question

* `public key`、`csr`与`certificate`的不同
> `.csr` This is a Certificate Signing Request. It includes some/all of the key details of the requested certificate such as subject, organization, state, whatnot, as well as the public key of the certificate to get signed.

* `.pem`指的是什么
> PEM is a de facto file format for storing and sending cryptography keys, certificates, and other data, based on a set of 1993 IETF standards defining "privacy-enhanced mail." 

* `.pfx`与`.p12`又是什么
> Originally defined by RSA in the Public-Key Cryptography Standards, the "12" variant was enhanced by Microsoft. This is a passworded container format that contains both public and private certificate pairs. Unlike .pem files, this container is fully encrypted. Openssl can turn this into a .pem file with both public and private keys: openssl pkcs12 -in file-to-convert.p12 -out converted-file.pem -nodes

## Reference

> [SSL/TLS协议运行机制的概述](http://www.ruanyifeng.com/blog/2014/02/ssl_tls.html)

> [nodejs api](https://nodejs.org/dist/latest-v9.x/docs/api/tls.html)

> [RSA加密演算法](https://zh.wikipedia.org/wiki/RSA%E5%8A%A0%E5%AF%86%E6%BC%94%E7%AE%97%E6%B3%95)

> [PEM](https://en.wikipedia.org/wiki/Privacy-enhanced_Electronic_Mail)

> [Key File Format](https://serverfault.com/questions/9708/what-is-a-pem-file-and-how-does-it-differ-from-other-openssl-generated-key-file)

> [PKCS_12](https://en.wikipedia.org/wiki/PKCS_12)

> [How to convert a private key to an RSA private key?](https://stackoverflow.com/questions/17733536/how-to-convert-a-private-key-to-an-rsa-private-key)

> [k8sp/tls](https://github.com/k8sp/tls)