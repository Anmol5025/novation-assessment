const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

const uploadFile = async (fileBuffer, filename, folder = 'legal-documents') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: `${Date.now()}-${filename}`,
        format: 'pdf'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            size: result.bytes
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    return true;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
};

module.exports = { uploadFile, deleteFile };
