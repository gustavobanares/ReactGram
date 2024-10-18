const mongoose = require('mongoose')
const {Schema} = mongoose

const userSchema = newSchema({
    name: String,
    emaill: String,
    password: String,
    profileImage: String,
    bio: String,
}, {    
    timeStamps: true
})

const User = mongoose.model('User', userSchema)

module.exports = User