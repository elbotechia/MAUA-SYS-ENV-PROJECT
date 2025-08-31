import { handleHttpError } from '../errors/handleError.js';
import { Book } from '../models/schemas/book.js';
import { Profile } from '../models/schemas/profile.js';
import { Storage } from '../models/schemas/storage.js';
import { User } from '../models/schemas/user.js';
import path from 'path';

export class BookController {
    constructor() {

    }

    // Método auxiliar para salvar arquivo no Storage
    async saveFileToStorage(file) {
        if (!file) return null;
        
        try {
            const storage = new Storage({
                url: `/uploads/${path.relative('uploads', file.path).replace(/\\/g, '/')}`,
                filename: file.originalname
            });
            await storage.save();
            return storage._id;
        } catch (error) {
            console.error('Error saving file to storage:', error);
            return null;
        }
    }

    async getBooks(req, res){
        try {
            // Buscar livros no banco com populate para author (Profile)
            const books = await Book.find({ isActive: true })
                .populate('author', 'nomeReferencial username')
                .populate('cover', 'url filename')
                .populate('createdBy', 'username')
                .sort({ createdAt: -1 })
                .lean();
            
            res.render('pages/books', { 
                title: 'Nossos Livros',
                titlePage: 'Biblioteca',
                books: books || [] 
            });
        } catch (error) {
            console.error('Error fetching books:', error);
            res.render('error', { error: 'Erro ao carregar livros' });
        }
    }

    async getBookById(req, res){
        try {
            const { id } = req.params;
            
            const book = await Book.findById(id)
                .populate('author', 'nomeReferencial username emailInstitucional bio fotoPerfil')
                .populate('cover', 'url filename')
                .populate('pdf', 'url filename')
                .populate('icon', 'url filename')
                .populate('createdBy', 'username')
                .populate('comments.user', 'username')
                .populate('ratings.user', 'username');

            if (!book) {
                return res.render('error', { error: 'Livro não encontrado' });
            }

            // Incrementar visualizações
            await Book.findByIdAndUpdate(id, { $inc: { views: 1 } });
            
            res.json({data: book})
        } catch (error) {
            console.error('Error fetching book:', error);
            handleHttpError(res, 'ERROR_GET_BOOK', 500);
        }
    }

    async createBook(req, res){
        try {
            console.log('Files received:', req.files);
            console.log('Body received:', req.body);

            // Processar uploads de arquivos
            let coverId = null, pdfId = null, iconId = null;

            if (req.files) {
                if (req.files.coverFile && req.files.coverFile[0]) {
                    coverId = await this.saveFileToStorage(req.files.coverFile[0]);
                }
                if (req.files.pdfFile && req.files.pdfFile[0]) {
                    pdfId = await this.saveFileToStorage(req.files.pdfFile[0]);
                }
                if (req.files.iconFile && req.files.iconFile[0]) {
                    iconId = await this.saveFileToStorage(req.files.iconFile[0]);
                }
            }

            const bookData = {
                title: req.body.title,
                description: req.body.description,
                author: req.body.author, // ObjectId do Profile
                code: req.body.code,
                publishedYear: req.body.publishedYear ? parseInt(req.body.publishedYear) : null,
                theme: req.body.theme,
                pages: req.body.pages ? parseInt(req.body.pages) : null,
                language: req.body.language || 'pt-BR',
                status: req.body.status === 'on',
                sinopsis: req.body.sinopsis,
                url: req.body.url,
                repository: req.body.repository,
                documentations: req.body.documentations ? req.body.documentations.split(',').map(doc => doc.trim()).filter(doc => doc) : [],
                tags: req.body.tags ? req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
                cover: coverId,
                pdf: pdfId,
                icon: iconId,
                createdBy: req.user ? req.user._id : null,
                isActive: req.body.isActive === 'on'
            };

            console.log('Book data to save:', bookData);

            const book = new Book(bookData);
            await book.save();
            
            console.log('Book saved successfully:', book._id);
            res.redirect('/books/' + book._id);
        } catch (error) {
            console.error('Error creating book:', error);
            res.render('error', { 
                error: 'Erro ao criar livro: ' + error.message,
                title: 'Erro',
                titlePage: 'Erro'
            });
        }
    }

    async updateBook(req, res){
        try {
            const { id } = req.params;
            const updateData = {
                title: req.body.title,
                description: req.body.description,
                author: req.body.author,
                code: req.body.code,
                publishedYear: req.body.publishedYear,
                theme: req.body.theme,
                pages: req.body.pages,
                language: req.body.language,
                sinopsis: req.body.sinopsis,
                url: req.body.url,
                repository: req.body.repository,
                documentations: req.body.documentations ? req.body.documentations.split(',') : [],
                tags: req.body.tags ? req.body.tags.split(',') : []
            };

            await Book.findByIdAndUpdate(id, updateData, { new: true });
            res.redirect('/books/' + id);
        } catch (error) {
            console.error('Error updating book:', error);
            res.render('error', { error: 'Erro ao atualizar livro' });
        }
    }

    async deleteBook(req, res){
        try {
            const { id } = req.params;
            await Book.findByIdAndUpdate(id, { isActive: false });
            res.redirect('/books');
        } catch (error) {
            console.error('Error deleting book:', error);
            res.render('error', { error: 'Erro ao deletar livro' });
        }
    }

    // Métodos adicionais para as novas funcionalidades
    async addComment(req, res) {
        try {
            const { id } = req.params;
            const { comment } = req.body;
            
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }

            await Book.findByIdAndUpdate(id, {
                $push: {
                    comments: {
                        user: req.user._id,
                        comment: comment,
                        date: new Date()
                    }
                }
            });

            res.redirect('/books/' + id);
        } catch (error) {
            console.error('Error adding comment:', error);
            res.render('error', { error: 'Erro ao adicionar comentário' });
        }
    }

    async addRating(req, res) {
        try {
            const { id } = req.params;
            const { rating } = req.body;
            
            if (!req.user) {
                return res.status(401).json({ error: 'Usuário não autenticado' });
            }

            // Remover avaliação anterior do mesmo usuário
            await Book.findByIdAndUpdate(id, {
                $pull: { ratings: { user: req.user._id } }
            });

            // Adicionar nova avaliação
            await Book.findByIdAndUpdate(id, {
                $push: {
                    ratings: {
                        user: req.user._id,
                        rating: parseInt(rating)
                    }
                }
            });

            res.redirect('/books/' + id);
        } catch (error) {
            console.error('Error adding rating:', error);
            res.render('error', { error: 'Erro ao adicionar avaliação' });
        }
    }

    async downloadBook(req, res) {
        try {
            const { id } = req.params;
            
            const book = await Book.findById(id).populate('pdf', 'url filename');
            
            if (!book || !book.pdf) {
                return res.render('error', { error: 'PDF não encontrado' });
            }

            // Incrementar downloads
            await Book.findByIdAndUpdate(id, { $inc: { downloads: 1 } });

            res.redirect(book.pdf.url);
        } catch (error) {
            console.error('Error downloading book:', error);
            res.render('error', { error: 'Erro ao fazer download' });
        }
    }

    // Métodos para formulários
    async getCreateForm(req, res) {
        try {
            // Buscar autores disponíveis
            const authors = await Profile.find({ isActive: true }, 'nomeReferencial username').lean();
            
            res.render('pages/book-form', {
                title: 'Adicionar Livro',
                titlePage: 'Novo Livro',
                book: null,
                authors: authors,
                action: 'create'
            });
        } catch (error) {
            console.error('Error loading create form:', error);
            res.render('error', { error: 'Erro ao carregar formulário' });
        }
    }

    async getEditForm(req, res) {
        try {
            const { id } = req.params;
            
            const book = await Book.findById(id);
            const authors = await Profile.find({ isActive: true }, 'nomeReferencial username').lean();
            
            if (!book) {
                return res.render('error', { error: 'Livro não encontrado' });
            }
            
            res.render('pages/book-form', {
                title: 'Editar Livro',
                titlePage: 'Editar Livro',
                book: book,
                authors: authors,
                action: 'edit'
            });
        } catch (error) {
            console.error('Error loading edit form:', error);
            res.render('error', { error: 'Erro ao carregar formulário' });
        }
    }
}