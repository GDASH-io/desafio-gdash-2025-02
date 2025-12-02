const bcrypt = require('bcryptjs');

const hash = "$2a$10$UmumibQXrRwiqBRkpH5xguoEmUBMR2Sm2r3sqCmuW2kSJR7HDVTN6";
const senha = "123456";

bcrypt.compareSync(senha, hash);
