const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    prenom: {
        type: String,
        required: [true, 'Le prénom est requis'],
        trim: true,
        maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    nom: {
        type: String,
        required: [true, 'Le nom est requis'],
        trim: true,
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    email: {
        type: String,
        required: [true, 'L\'email est requis'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format d\'email invalide']
    },
    telephone: {
        type: String,
        required: [true, 'Le téléphone est requis'],
        trim: true,
        match: [/^(\+213|0)[5-7][0-9]{8}$/, 'Format de téléphone invalide']
    },
    password: {
        type: String,
        required: [true, 'Le mot de passe est requis'],
        minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
        select: false // Ne pas inclure le mot de passe dans les requêtes par défaut
    },
    adresse: {
        type: String,
        required: [true, 'L\'adresse est requise'],
        trim: true,
        maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    ville: {
        type: String,
        default: '',
        trim: true,
        maxlength: [50, 'La ville ne peut pas dépasser 50 caractères']
    },
    wilaya: {
        type: String,
        required: [true, 'La wilaya est requise'],
        trim: true,
        enum: [
            'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna', 'Béjaïa', 'Biskra', 'Béchar',
            'Blida', 'Bouira', 'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou',
            'Alger', 'Djelfa', 'Jijel', 'Sétif', 'Saïda', 'Skikda', 'Sidi Bel Abbès', 'Annaba',
            'Guelma', 'Constantine', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
            'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf',
            'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela', 'Souk Ahras', 'Tipaza',
            'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
        ]
    },
    codePostal: {
        type: String,
        default: '',
        trim: true,
        match: [/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres']
    },
    dateNaissance: {
        type: Date,
        validate: {
            validator: function(date) {
                return date <= new Date();
            },
            message: 'La date de naissance ne peut pas être dans le futur'
        }
    },
    genre: {
        type
