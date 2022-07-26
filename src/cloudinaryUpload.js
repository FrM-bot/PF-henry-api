import { v2 as cloudinary } from 'cloudinary'

export const upload = async (filePath) => {
  return cloudinary.uploader.upload(filePath, {
    folder: 'images'
  })
}
