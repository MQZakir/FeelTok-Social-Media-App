import React, { useState } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Keyboard,
    TouchableWithoutFeedback
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { getUserImageSrc, uploadFile } from '../services/imageServices';

export default function CreateAccount({ route, navigation }) {
    const { email, password } = route.params; // Received from the verification screen

    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [bio, setBio] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handlePickImage = async () => {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        console.log("Permission status: ", status);
        if (status !== 'granted') {
            alert('Sorry, we need media library permissions to make this work!');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });

        console.log("Picker result: ", result);

        setProfileImage(result.assets[0]?.uri);

    };

    const checkUsernameAvailability = async (username) => {
        const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('username', username);

        return data.length === 0; // True if username is available
    };

    const handleCreateAccount = async () => {
        if (!name || !username || !bio) {
            setError('All fields are required.');
            return;
        }

        const isUsernameAvailable = await checkUsernameAvailability(username);
        if (!isUsernameAvailable) {
            setError('Username already exists. Please choose a unique one.');
            return;
        }
        console.log('Image details before upload: ', profileImage);

        let signedUrl = null; // Variable to store the signed URL

        // Upload profile image if selected
        if (profileImage) {
            console.log('Image details before upload: ', profileImage);

            // if (Platform.OS === 'android' && uri) {
            //     // Create a Blob from the base64 string
            //     const imageBlob = new Blob(
            //         [new Uint8Array(Buffer.from(fileInfo, 'base64'))],
            //         { type: 'image/jpeg' } // Ensure the MIME type matches the image type (you can adjust as needed)
            //     );

            //     // Now you can upload the imageBlob to Supabase
            //     const imageRes = await uploadFile('profiles', imageBlob, true);
            //     console.log("Upload response:", imageRes);
            // }

            // Upload the file to Supabase Storage
            const imageRes = await uploadFile('profiles', profileImage, true); // Ensure 'uploadFile' is working for Supabase
            console.log("Upload response:", imageRes);

            if (imageRes.success) {
                console.log("Profile image uploaded at path: ", imageRes.data);

                // Generate a signed URL for the uploaded file
                const { data: signedUrlData, error: signedUrlError } = await supabase
                    .storage
                    .from('uploads') // Ensure this matches your Supabase storage bucket
                    .createSignedUrl(imageRes.data, 60 * 60 * 24 * 365); // URL valid for 1 year

                if (signedUrlError) {
                    console.error('Error generating signed URL:', signedUrlError);
                    setError('Failed to generate image URL. Please try again.');
                    return;
                }

                signedUrl = signedUrlData.signedUrl; // Assign the signed URL
                console.log('Generated Signed URL:', signedUrl);
            } else {
                console.error("Image upload failed.");
                setError('Failed to upload profile image. Please try again.');
                return;
            }
        }
        // Insert user details into the database
        const { error } = await supabase.from('users').update([
            {
                name: name,
                username: username,
                bio: bio,
                profileImage: signedUrl,
                is_verified: true,
                hasCreatedAccount: true
            },
        ]).eq('email', email);


        if (error) {
            console.error(error)
            setError('Failed to create account. Please try again.');
            return;
        }

        setSuccess('Account created successfully!');
        navigation.navigate('Home');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#FF9A8B', '#FF6A88', '#FFC1C1', '#FFD6A5']}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.introduction}>
                        <Text style={styles.heading}>Create Your Account</Text>
                    </View>

                    <TouchableOpacity onPress={handlePickImage}>
                        <View style={styles.imagePicker}>
                            {profileImage ? (
                                // Show the selected image as a preview
                                <Image
                                    source={{ uri: profileImage }}
                                    style={styles.profileImage}
                                />
                            ) : (
                                // Show the camera icon if no image is selected
                                <Ionicons name='camera' size={35} />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TextInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        style={styles.input}
                    />
                    <TextInput
                        placeholder="Bio"
                        value={bio}
                        onChangeText={setBio}
                        style={[styles.input, styles.bioInput]}
                        multiline
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}
                    {success && <Text style={styles.successText}>{success}</Text>}

                    <TouchableOpacity style={styles.button} onPress={handleCreateAccount}>
                        <Text style={styles.buttonText}>Create Account</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    introduction: { alignItems: 'center', marginBottom: 20 },
    heading: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    input: {
        width: '85%',
        height: 50,
        borderWidth: 1,
        borderColor: '#f8ad9d',
        borderRadius: 25,
        paddingHorizontal: 15,
        marginVertical: 10,
        fontSize: 16,
        backgroundColor: '#FFD6A5',
    },
    bioInput: { height: 100, textAlignVertical: 'top', paddingVertical: 10 },
    imagePicker: {
        width: 100,
        height: 100,
        backgroundColor: '#FFC1C1',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    profileImage: { width: 100, height: 100, borderRadius: 50 },
    imagePickerText: { textAlign: 'center', color: '#fff', alignSelf: 'center' },
    button: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F5EDE0',
        borderRadius: 50,
        alignItems: 'center',
        width: '85%',
    },
    buttonText: { fontSize: 20 },
    errorText: { color: 'red', marginTop: 10 },
    successText: { color: 'green', marginTop: 10 },
});