import { Request, Response } from 'express';
import { uploadImageToCloudinary } from '../config/cloudinary';

export async function uploadMedia(req: Request, res: Response): Promise<void> {
  try {
    const { image, folder } = req.body;

    if (!image || typeof image !== 'string') {
      res.status(400).json({
        success: false,
        message: 'Image data is required (base64 string or data URL).',
      });
      return;
    }

    const uploadResult = await uploadImageToCloudinary(
      image,
      folder || 'omas_aluminium/snapshots'
    );

    res.status(200).json({
      success: true,
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
      width: uploadResult.width,
      height: uploadResult.height,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to upload media to Cloudinary.',
    });
  }
}
