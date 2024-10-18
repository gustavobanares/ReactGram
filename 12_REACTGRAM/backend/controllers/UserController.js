const User = require('../models/User')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_SECRET

// Generating user token
const generateToken = (id) =>{
    return jwt.sign({id}, jwtSecret, {
        expiresIn: '7d',
    })
}

// Register user and sign in
const register = async (req, res) =>{
    res.send('Registro')
}

module.exports = {
    register,
}