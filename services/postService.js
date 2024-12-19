import { supabase } from "../lib/supabase";
import { uploadFile } from "./imageServices";

export const createPost = async (post) => {
    try {
        // uploading image
        if (post.file && typeof post.file === "object") {
            const isImage = post.file.type === "image";
            const folderName = isImage ? "postImages" : "postVideos";

            // Upload file using the uploadFile function
            const fileResult = await uploadFile(folderName, post.file.uri, isImage);

            if (fileResult.success) {
                console.log(fileResult.data)
                const filePath = fileResult.data; // Ensure this is the relative path of the uploaded file

                // Generate a signed URL for the uploaded file
                const { data: signedUrlData, error: signedUrlError } = await supabase
                    .storage
                    .from('uploads') // Correct storage bucket name
                    .createSignedUrl(filePath, 60 * 60 * 24 * 365); // URL valid for 1 year

                if (signedUrlError) {
                    console.error("Error generating signed URL:", signedUrlError);
                    return { success: false, msg: "Error generating signed URL!" };
                }

                // Assign the signed URL to the post object
                post.file = signedUrlData.signedUrl;
            } else {
                // Handle upload failure
                console.error("File upload failed:", fileResult.msg);
                return fileResult;
            }
        }

        console.log(post)

        const { data, error } = await supabase
            .from('posts')
            .upsert(post)
            .select()
            .single()

        if (error) {
            console.error('Create post error: ', error)
            return { success: false, msg: 'Couldnt create post!' }
        }
        return { success: true, data: data }
    } catch (err) {
        console.log('Error', err)
        return { success: false, msg: 'Could create post!' }
    }
}
