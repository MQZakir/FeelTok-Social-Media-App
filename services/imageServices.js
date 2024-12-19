import * as FileSystem from 'expo-file-system'
import { decode } from 'base64-arraybuffer'
import { supabase } from '../lib/supabase'
import { supabaseURL } from '../constants/keys'

export const getUserImageSrc = imagePath => {
    if (imagePath) {
        return getSupabaseFileUrl(imagePath);
    } else {
        return require('../assets/default-user.jpg')
    }
}

export const getSupabaseFileUrl = filePath => {
    if (filePath) {
        return { uri: `${supabaseURL}/storage/v1/object/sign/uploads/${filePath}` }
    }
    else {
        return null
    }
}

export const uploadFile = async (folderName, fileUri, isImage = true) => {
    try {
        let fileName = getFilePath(folderName, isImage);
        const fileBase64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64
        });
        let imageData = decode(fileBase64)
        console.log("Decoded image data: ", imageData);
        let { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(fileName, imageData, {
                cacheControl: '3600',
                upsert: false,
                contentType: isImage ? 'images/*' : 'videos/*'
            });
        if (error) {
            console.log('File upload error: ', error)
            return { success: false, msg: 'Could not upload media' }
        }
        console.log(data)
        return { success: true, data: data.path }
    } catch (error) {
        console.log('File upload error: ', error)
        return { success: false, msg: 'Could not upload media' }
    }
}

export const getFilePath = (folderName, isImage) => {
    return `/${folderName}/${(new Date()).getTime()}${isImage ? '.png' : '.mp4'}`;
}