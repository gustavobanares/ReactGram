const Photo = require('../models/Photo');
const User = require('../models/User');
const mongoose = require('mongoose');

// Insert a photo, with a user related to it
const insertPhoto = async (req, res) => {
    const { title } = req.body;
    const image = req.file?.filename;  // Verificação opcional

    const reqUser = req.user;

    try {
        const user = await User.findById(reqUser._id);

        if (!user) {
            return res.status(404).json({ errors: ['Usuário não encontrado.'] });
        }

        // Create a photo
        const newPhoto = await Photo.create({
            image,
            title,
            userId: user._id,
            userName: user.name,
        });

        res.status(201).json(newPhoto);
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor. Tente novamente mais tarde.'] });
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

module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
};
