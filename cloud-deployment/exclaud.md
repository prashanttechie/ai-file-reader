## create ssh key
```ssh-keygen -t rsa -b 4096 -C "prshntmishra033@gmail.com" ```
## it created public key and private key and passphrase is - pass123
## upload the public key to excloud ssh section. Use this ssh while creating instance

## after creating instance run below command to connect to instance
``` ssh -i ai-experiment ubuntu@210.79.129.144 ```