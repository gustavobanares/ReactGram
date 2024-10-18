const {body} = require("express-validator")

const userCreateValidation = () =>{
    return[
    body('name')
        .isString()
        .withMessage('O nome e obrigatorio.')
        .isLength({min: 3})
        .withMessage('O nome precisa ter no minimo 3 caracteres.'), 
    body('email')
        .isString()
        .withMessage('O e-mail e obrigatorio')
        .isEmail()
        .withMessage('Insira um e-mail valido.'), 
    body('password')
        .isString()
        .withMessage("A senha e obrigatoria.")
        .isLength({min: 5})
        .withMessage('A senha precisa ter no minimo 5 caracteres.'), 
    body("confirmpassword")
        .isString()
        .withMessage('A confirmacao de senha e obrigatoria.')
        .custom((value, {req}) =>{
            if(value != req.body.password) {
                throw new Error('As senhas nao sao iguais.')
            }
            return true
        }),
    ]
} 

const loginValidation = () =>{
    return[
        body('email')
            .isString()
            .withMessage('O e-mail e obrigatorio.')
            .isEmail()
            .withMessage('Insira um e-mail valido.'),
        body('password')
            .isString()
            .withMessage('A senha e obrigatoria.')    
    ]
}

module.exports = {
    userCreateValidation,
    loginValidation,
}
