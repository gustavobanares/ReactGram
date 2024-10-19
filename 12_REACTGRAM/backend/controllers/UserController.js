const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const jwtSecret = process.env.JWT_SECRET;

// Gerando token do usuário
const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: '7d',
    });
};

// Registro de usuário
const register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(422).json({ errors: ['Por favor, utilize outro e-mail.'] });
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            name,
            email,
            password: passwordHash,
        });

        res.status(201).json({
            _id: newUser._id,
            token: generateToken(newUser._id),
        });

    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Login de usuário
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user) {
            return res.status(404).json({ errors: ['Usuário não encontrado.'] });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(422).json({ errors: ['Senha inválida.'] });
        }

        res.status(200).json({
            _id: user._id,
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });

    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Usuário logado atualmente
const getCurrentUser = async (req, res) => {
    res.status(200).json(req.user);
};

// Atualização de usuário
const update = async (req, res) => {
    const { name, password, bio } = req.body;
    let profileImage = req.file ? req.file.filename : null;

    const user = await User.findById(req.user._id).select('-password');

    if (name) user.name = name;
    if (password) {
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, salt);
    }
    if (profileImage) user.profileImage = profileImage;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json(user);
};

// Buscar usuário por ID
const getUserById = async (req, res) => {
    const { id } = req.params;

    // Validação de ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ errors: ['ID inválido.'] });
    }

    try {
        const user = await User.findById(id).select('-password');

        if (!user) {
            return res.status(404).json({ errors: ['Usuário não encontrado.'] });
        }

        res.status(200).json(user);

    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

module.exports = {
    register,
    login,
    getCurrentUser,
    update,
    getUserById,
};