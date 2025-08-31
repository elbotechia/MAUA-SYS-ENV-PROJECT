import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Configuração para upload de imagens (covers, icons)
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/images/');
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Configuração para upload de PDFs
const pdfStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/pdfs/');
    },
    filename: function (req, file, cb) {
        const uniqueName = uuidv4() + '-' + Date.now() + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

// Filtros de arquivo
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, WebP)!'), false);
    }
};

const pdfFileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Apenas arquivos PDF são permitidos!'), false);
    }
};

// Middleware para upload de múltiplos tipos de arquivo
const uploadBookFiles = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === 'coverFile' || file.fieldname === 'iconFile') {
                cb(null, 'uploads/images/');
            } else if (file.fieldname === 'pdfFile') {
                cb(null, 'uploads/pdfs/');
            } else {
                cb(null, 'uploads/misc/');
            }
        },
        filename: function (req, file, cb) {
            const uniqueName = uuidv4() + '-' + Date.now() + path.extname(file.originalname);
            cb(null, uniqueName);
        }
    }),
    fileFilter: function (req, file, cb) {
        if (file.fieldname === 'coverFile' || file.fieldname === 'iconFile') {
            imageFileFilter(req, file, cb);
        } else if (file.fieldname === 'pdfFile') {
            pdfFileFilter(req, file, cb);
        } else {
            cb(null, true);
        }
    },
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
}).fields([
    { name: 'coverFile', maxCount: 1 },
    { name: 'iconFile', maxCount: 1 },
    { name: 'pdfFile', maxCount: 1 }
]);

// Middleware simples para imagens
const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

// Middleware simples para PDFs
const uploadPDF = multer({
    storage: pdfStorage,
    fileFilter: pdfFileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

export {
    uploadBookFiles,
    uploadImage,
    uploadPDF
};