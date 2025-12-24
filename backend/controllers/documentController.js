const { Document } = require('../models');
const { uploadFile } = require('../services/firebaseService');
const { processDocument } = require('../services/ingestionService');

/**
 * Upload a document to the Knowledge Base.
 */
const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const { company_id } = req;
        const { bot_id } = req.body;
        const file = req.file;

        if (!bot_id) {
            return res.status(400).json({ error: 'bot_id is required' });
        }

        // Upload to Firebase
        const destination = `companies/${company_id}/bots/${bot_id}/documents/`;
        const firebasePath = await uploadFile(file, destination);

        // Create Database Record
        const document = await Document.create({
            company_id,
            bot_id,
            filename: file.originalname,
            file_type: file.mimetype === 'application/pdf' ? 'pdf' :
                file.mimetype === 'text/plain' ? 'txt' : 'docx',
            file_size: file.size,
            firebase_path: firebasePath,
            status: 'pending'
        });

        // Trigger Async Ingestion
        processDocument(document.id, file.buffer, document.file_type);

        res.status(201).json({
            message: 'Document uploaded and processing started',
            document
        });

    } catch (error) {
        console.error('Document upload error:', error);
        res.status(500).json({ error: 'Internal server error during upload' });
    }
};

/**
 * List all documents for the authenticated company.
 */
const list = async (req, res) => {
    try {
        const { company_id } = req;
        const { botId } = req.query;

        if (!botId) {
            return res.status(400).json({ error: 'botId query parameter is required' });
        }

        const documents = await Document.findAll({
            where: { company_id, bot_id: botId },
            order: [['created_at', 'DESC']]
        });

        // Optionally generate signed URLs if needed for frontend download
        // For now, just returning metadata is safer/faster

        res.json({ documents });
    } catch (error) {
        console.error('List documents error:', error);
        res.status(500).json({ error: 'Internal server error fetching documents' });
    }
};

/**
 * Delete a document.
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        const { company_id } = req;

        const document = await Document.findOne({ where: { id, company_id } });
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        // TODO: Delete from Firebase (optional, or mark as deleted)
        // For now, we just delete the record or mark status

        await document.destroy();

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Delete document error:', error);
        res.status(500).json({ error: 'Internal server error deleting document' });
    }
};

module.exports = {
    upload,
    list,
    remove
};
