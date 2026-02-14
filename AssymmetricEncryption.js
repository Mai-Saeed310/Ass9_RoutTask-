/*
Asymmetric encryption is a type of encryption that uses two different keys:
    1- Public Key – can be shared with anyone. It is used to encrypt data.
    2- Private Key – must be kept secret. It is used to decrypt data that was encrypted with the public key.

How it works:
    the sender uses the recipient's public key to encrypt the data. 
    The recipient then uses their private key to decrypt the data.

Common Uses: 
    Secure emails 
    Digital signatures
    Encrypting sensitive data like passwords or personal information

Why it is secure:
    The private key is never shared, so only the intended recipient can decrypt the data.

Key Components:
    Plaintext
    Encryption algorithm
    Public and private keys
    Ciphertext
    Decryption algorithm

Algorithms: 
    RSA (Rivest–Shamir–Adleman)
    DSS (Digital Signature Standard)
*/