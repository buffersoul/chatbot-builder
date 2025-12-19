const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    // Check if credentials are provided in env vars (best practice for different environments)
    // For local dev, we might use a service account key file path
    // For production (Cloud Run/App Engine), it might auto-detect

    try {
        const serviceAccount = {
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Fix newline issues in env vars
        };

        if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET
            });
            console.log('Firebase Admin initialized successfully');
        } else {
            // Fallback for when no creds are present (e.g. initial setup), prevents crash but warns
            console.warn('Firebase credentials missing. Firebase features will not work.');
        }


    } catch (error) {
        console.error('Firebase initialization error:', error);
    }
}

const storage = admin.storage().bucket();

/**
 * Upload a file to Firebase Storage.
 * @param {Object} file - The file object from Multer (file.buffer, file.originalname, etc.)
 * @param {String} destination - The path in the bucket (e.g., 'companies/{id}/documents/')
 * @returns {Promise<String>} - The public URL or path
 */
const uploadFile = async (file, destination) => {
    if (!storage.name) {
        throw new Error('Firebase Storage not initialized');
    }

    const filename = `${Date.now()}_${file.originalname}`;
    const filePath = `${destination}${filename}`;
    const fileRef = storage.file(filePath);

    await fileRef.save(file.buffer, {
        metadata: {
            contentType: file.mimetype,
        },
    });

    // Make the file public (optional, depending on security requirements. 
    // RAG docs usually shouldn't be public, but for now we might keep them private and generate signed URLs)
    // For this implementation, we will keep them private and return the path.
    return filePath;
};

/**
 * Get a signed URL for reading a private file.
 * @param {String} filePath - The path in the bucket
 * @returns {Promise<String>}
 */
const getSignedUrl = async (filePath) => {
    if (!storage.name) return null;

    const file = storage.file(filePath);
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60, // 1 hour
    });
    return url;
};

module.exports = {
    uploadFile,
    getSignedUrl,
    storage
};
