const Photo = require('../models/Photo');
const User = require('../models/User');
const mongoose = require('mongoose');

// Insert a photo, with a user related to it
const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const image = req.file?.filename;

    const reqUser = req.user;

    try {
        const user = await User.findById(reqUser._id);

        if (!user) {
            return res.status(404).json({ errors: ['Usuário não encontrado.'] });
        }

        const newPhoto = await Photo.create({
            image,
            title,
            userId: user._id,
            userName: user.name,
        });

        if (!newPhoto) {
            return res.status(422).json({ errors: ['Erro ao criar a foto.'] });
        }

        res.status(201).json({ 
            id: newPhoto._id, 
            message: 'Foto criada com sucesso.', 
            photo: newPhoto 
        });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Remove a photo from DB
const deletePhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    try {
        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        // Check if photo belongs to user
        if (photo.userId.toString() !== reqUser._id.toString()) {
            return res.status(403).json({ errors: ['Você não tem permissão para excluir esta foto.'] });
        }

        await Photo.findByIdAndDelete(photo._id);

        res.status(200).json({ id: photo._id, message: 'Foto excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor. Tente novamente mais tarde.'] });
    }
};

// Get all photos
const getAllPhotos = async(req, res) =>{

    const photos = await Photo.find({}).sort([['createdAt', -1]]).exec()

    return res.status(200).json(photos)

}

// Get user photos
const getUserPhotos = async (req, res) => {
    const { id } = req.params;

    try {
        // Busca todas as fotos onde o userId é igual ao ID passado na URL
        const photos = await Photo.find({ userId: id }).sort({ createdAt: -1 });

        if (!photos || photos.length === 0) {
            return res.status(404).json({ errors: ['Nenhuma foto encontrada para este usuário.'] });
        }

        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ errors: ['Erro ao buscar fotos.'] });
    }
};

// Get photo by id
const getPhotoById = async (req, res) => {
    const { id } = req.params;

    try {
        // Verificar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ errors: ['ID inválido.'] });
        }

        const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        res.status(200).json(photo);
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Update a photo
const updatePhoto = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;

    const reqUser = req.user;

    try {
        // Verificar se o ID é válido
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ errors: ['ID inválido.'] });
        }

        const photo = await Photo.findById(id);

        // Verificar se a foto existe
        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        // Verificar se a foto pertence ao usuário autenticado
        if (!photo.userId.equals(reqUser._id)) {
            return res.status(403).json({ errors: ['Você não tem permissão para atualizar esta foto.'] });
        }

        // Atualizar o título, se fornecido
        if (title) {
            photo.title = title;
        }

        await photo.save();

        res.status(200).json({ photo, message: 'Foto atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};
module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
};
