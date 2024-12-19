import React, { useState } from "react";
import {
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    Platform,
    Keyboard,
    TouchableWithoutFeedback,
    Alert
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import * as ImagePicker from 'expo-image-picker';
import { uploadFile } from "../services/imageServices";
import { supabase } from "../lib/supabase";

const EditProfile = ({ navigation, route }) => {
    const { userData } = route.params; // Get user data from route params

    // State for editing profile fields
    const [name, setName] = useState(userData?.name || "");
    const [username, setUsername] = useState(userData?.username || "");
    const [bio, setBio] = useState(userData?.bio || "");
    const [profileImage, setProfileImage] = useState(userData?.profileImage || "");

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

    const handleSave = async () => {
        console.log('Checking username availability...');
        if (username !== userData?.username) {
            const isUsernameAvailable = await checkUsernameAvailability(username);
            if (!isUsernameAvailable) {
                Alert.alert('Username', 'Username already exists. Please choose a unique one.');
                return;
            }

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
            },
        ]).eq('username', username);


        if (error) {
            console.error(error)
            setError('Failed to create account. Please try again.');
            return;
        }
        navigation.navigate('Home');
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                {/* Profile Header */}
                <View style={styles.profileHeader}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.editProfileTitle}>Edit Profile</Text>
                </View>

                {/* Profile Image */}
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

                {/* Edit Profile Form */}
                <View style={styles.formContainer}>
                    <TextInput
                        style={styles.inputField}
                        placeholder="Name"
                        value={name}
                        onChangeText={setName}
                    />
                    <TextInput
                        style={styles.inputField}
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={[styles.inputField, styles.textArea]}
                        placeholder="Bio"
                        multiline
                        numberOfLines={4}
                        value={bio}
                        onChangeText={setBio}
                    />
                </View>

                {/* Save Button */}
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? 50 : 0,
        paddingHorizontal: 25,
    },
    profileHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 20,
        marginLeft: 20
    },
    editProfileTitle: {
        fontSize: 22,
        fontWeight: "500",
        color: "#333",
        marginLeft: 10,
    },
    profileImageContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        alignSelf: 'center'
    },
    changeImageButton: {
        backgroundColor: "#F5EDE0",
        borderRadius: 30,
        paddingVertical: 8,
        paddingHorizontal: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
    },
    changeImageButtonText: {
        fontSize: 14,
        fontWeight: "500",
        color: "#000",
    },
    imagePicker: {
        width: 100,
        height: 100,
        backgroundColor: '#333',
        borderRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginVertical: 20,
    },
    formContainer: {
        padding: 20
    },
    inputField: {
        backgroundColor: "#F9F9F9",
        borderRadius: 100,
        paddingVertical: 12,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 14,
        color: "#333",
    },
    textArea: {
        textAlignVertical: "top", // Ensures the text starts from the top of the input field
    },
    saveButton: {
        backgroundColor: "#FF6A88",
        borderRadius: 30,
        width: 150,
        paddingVertical: 12,
        alignItems: "center",
        justifyContent: "center",
        alignSelf: 'center'
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: "500",
        color: "#fff",
    },
});

export default EditProfile;
