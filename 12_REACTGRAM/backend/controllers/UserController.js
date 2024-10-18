const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;

// Gerando token do usuário
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '7d',
    });
};

// Registro de usuário e login
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Verifica se o usuário já existe
        const user = await User.findOne({ email });

        if (user) {
            return res.status(422).json({ errors: ['Por favor, utilize outro e-mail.'] });
        }

        // Gera o hash da senha
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // Cria um novo usuário
        const newUser = await User.create({
            name,
            email,
            password: passwordHash,
        });

        if (!newUser) {
            return res.status(422).json({ errors: ['Houve um erro, por favor tente mais tarde.'] });
        }

        // Retorna o token do usuário
        res.status(201).json({
            _id: newUser._id,
            token: generateToken(newUser._id),
        });

    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Login do usuário
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca o usuário no banco de dados
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ errors: ['Usuário não encontrado.'] });
        }

        // Verifica a senha
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ errors: ['Senha inválida.'] });
        }

        // Retorna o usuário com o token
        res.status(200).json({
            _id: user._id,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Get current logged in user
const getCurrentUser = async(req, res) =>{
    const user = req.user

    res.status(200).json(user)
}

module.exports = {
    register,
    login,
    getCurrentUser,
};
