const Photo = require('../models/Photo');
const User = require('../models/User');
const mongoose = require('mongoose');

// Insert a photo
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
            photo: newPhoto,
        });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Delete a photo
const deletePhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        if (photo.userId.toString() !== reqUser._id.toString()) {
            return res.status(403).json({ errors: ['Você não tem permissão para excluir esta foto.'] });
        }

        await Photo.findByIdAndDelete(photo._id);

        res.status(200).json({ id: photo._id, message: 'Foto excluída com sucesso.' });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Get all photos
const getAllPhotos = async (req, res) => {
    const photos = await Photo.find({}).sort([['createdAt', -1]]).exec();
    return res.status(200).json(photos);
};

// Get user photos
const getUserPhotos = async (req, res) => {
    const { id } = req.params;

    try {
        const photos = await Photo.find({ userId: id }).sort({ createdAt: -1 });

        if (!photos || photos.length === 0) {
            return res.status(404).json({ errors: ['Nenhuma foto encontrada para este usuário.'] });
        }

        res.status(200).json(photos);
    } catch (error) {
        res.status(500).json({ errors: ['Erro ao buscar fotos.'] });
    }
};

// Get photo by ID
const getPhotoById = async (req, res) => {
    const { id } = req.params;

    try {
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
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).json({ errors: ['ID inválido.'] });
        }

        const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        if (!photo.userId.equals(reqUser._id)) {
            return res.status(403).json({ errors: ['Você não tem permissão para atualizar esta foto.'] });
        }

        if (title) {
            photo.title = title;
        }

        await photo.save();
        res.status(200).json({ photo, message: 'Foto atualizada com sucesso!' });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Like a photo
const likePhoto = async (req, res) => {
    const { id } = req.params;
    const reqUser = req.user;

    try {
        const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        if (photo.likes.includes(reqUser._id)) {
            return res.status(422).json({ errors: ['Você já curtiu esta foto.'] });
        }

        photo.likes.push(reqUser._id);
        await photo.save();

        res.status(200).json({ photoId: id, userId: reqUser._id, message: 'A foto foi curtida.' });
    } catch (error) {
        res.status(500).json({ errors: ['Erro no servidor.'] });
    }
};

// Comment functionality
const commentPhoto = async(req, res) =>{

    const {id} = req.params
    const {comment} = req.body

    const reqUser = req.user

    const user = await User.findById(reqUser)

    const photo = await Photo.findById(id);

        if (!photo) {
            return res.status(404).json({ errors: ['Foto não encontrada.'] });
        }

        
    // Put comment in the array comments
    const userComment = {
        comment,
        userName: user.name,
        userImage: user.profileimage,
        userId: user._id
    }

    photo.comments.push(userComment)

    await photo.save()

    res.status(200).json({
        comment: userComment,
        message: 'O comentario foi adicionado com sucesso!'
    })
}





module.exports = {
    insertPhoto,
    deletePhoto,
    getAllPhotos,
    getUserPhotos,
    getPhotoById,
    updatePhoto,
    likePhoto,
    commentPhoto,
};