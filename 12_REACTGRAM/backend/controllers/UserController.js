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
    
    const {name, email, password} = req.body

    // check if users exist
    const user = await User.findOne({email})

    if(user){
        res.status(422).json({errors: ['Por favor, utilize outro e-mail']})
        return
    }

    // Generate password hash
    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    // Create user
    const newUser = await User.create({
        name,
        email,
        password: passwordHash
    })

    // If user was created sucessfully, return the token
    if(!newUser){
        res.status(422).json({errors: ['Houve um erro, por favor tente mais tarde.']})
        return
    }

    res.status(201).json({
        _id: newUser._id,
        token: generateToken(newUser._id)
    })

}

module.exports = {
    register,
}