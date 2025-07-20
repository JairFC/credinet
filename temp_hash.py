import bcrypt

password = b"Sparrow20"
hashed_password = bcrypt.hashpw(password, bcrypt.gensalt())
print(hashed_password.decode('utf-8'))
