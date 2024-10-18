const User = require('../models/User');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const authGuard = async (req, res, next) => {
    // Acessando o header corretamente como um objeto
    const authHeader = req.headers['authorization']; 

    // Verificando e extraindo o token no formato "Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1]; 

    // Verifica se o token está presente
    if (!token) {
        return res.status(401).json({ errors: ['Acesso negado!'] });
    }

    try {
        // Verifica se o token é válido
        const verified = jwt.verify(token, jwtSecret);

        // Busca o usuário no banco de dados sem a senha
        req.user = await User.findById(verified.id).select('-password');

        next(); // Prossegue para a próxima função

    } catch (error) {
        res.status(401).json({ errors: ['Token inválido.'] });
    }
};

module.exports = authGuard;