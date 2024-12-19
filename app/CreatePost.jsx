import {
    View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
    Image, SafeAreaView, Switch, TouchableWithoutFeedback, Keyboard,
    ScrollView
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import DropDownPicker from 'react-native-dropdown-picker';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { getSupabaseFileUrl, uploadFile } from '../services/imageServices';
import { Video } from 'expo-av';
import { createPost } from '../services/postService';
import useUserData from '../hooks/useUserData';
import { useNavigation } from '@react-navigation/native';

const CreatePost = () => {
    const navigation = useNavigation()
    const { userData, loading, error } = useUserData()
    const [userSession, setUserSession] = useState(null)
    const [postContent, setPostContent] = useState('');
    const [selectedEmotion, setSelectedEmotion] = useState('love');
    const [visibility, setVisibility] = useState('everyone');
    const [commentsEnabled, setCommentsEnabled] = useState(true);
    const [taggedUsers, setTaggedUsers] = useState([]);

    const [file, setFile] = useState('')

    const [openEmotion, setOpenEmotion] = useState(false);
    const [emotionOptions] = useState([
        { label: 'Apology', value: 'apology' },
        { label: 'Appreciation', value: 'appreciation' },
        { label: 'Gratitude', value: 'gratitude' },
        { label: 'Love', value: 'love' },
        { label: 'Mindfulness', value: 'mindfulness' },
        { label: 'Thankful', value: 'thankful' },
    ]);

    const onPick = async (isImage) => {
        // Request media library permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need media library permissions to make this work!');
            return;
        }

        let mediaOp = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Ensure you're using the updated API
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        }

        if (!isImage) {
            mediaOp = {
                mediaTypes: ImagePicker.MediaTypeOptions.Videos, // Ensure you're using the updated API
                allowsEditing: true,
            }
        }

        const result = await ImagePicker.launchImageLibraryAsync(mediaOp);

        if (!result.canceled) {
            setFile(result.assets[0])
        }

    };

    const getFileUri = file => {
        if (!file) return null
        if (isLocalFile(file)) {
            return file.uri
        }
        return getSupabaseFileUrl(file)?.uri
    }


    const isLocalFile = file => {
        if (!file) return null;
        if (typeof file == 'object') return true
        return false
    }

    const getFileType = file => {
        if (!file) return null;
        if (isLocalFile(file)) {
            return file.type;
        }

        if (file.include('postImages')) {
            return 'image'
        }

        return 'video'
    }

    const handleTagUser = () => Alert.alert('Tag User', 'Tag user functionality coming soon!');

    // Submit the post
    const handlePostSubmit = async () => {
        if (!postContent) {
            Alert.alert("Post", 'Please add content to your post before publishing')
        }

        console.log("Post info: ", file, postContent, userData.userid, selectedEmotion, visibility, commentsEnabled)

        let data = {
            file: file,
            content: postContent,
            user_id: userData.userid,
            emotion: selectedEmotion,
            visibility: visibility,
        }

        let res = await createPost(data)
        console.log('Result', res)
        navigation.navigate('Home')
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView style={styles.container}>
                <View style={styles.contentContainer}>

                    {/* Emotion Dropdown */}
                    <View style={styles.dropdownRow}>
                        <Text style={styles.dropdownLabel}>Emotion</Text>
                        <DropDownPicker
                            open={openEmotion}
                            value={selectedEmotion}
                            items={emotionOptions}
                            setOpen={setOpenEmotion}
                            setValue={setSelectedEmotion}
                            style={styles.dropdown}
                            textStyle={styles.dropdownText}
                            dropDownContainerStyle={{ width: '61%' }}
                        />
                    </View>

                    {/* Post Content Input */}
                    <TextInput
                        style={styles.input}
                        placeholder="How are you feeling today?"
                        value={postContent}
                        onChangeText={setPostContent}
                        multiline
                    />

                    {/* Media Preview Section */}
                    {file && (
                        <View style={styles.previewContainer}>
                            {
                                getFileType(file) == 'video' ? (
                                    <Video style={styles.previewVideo} source={{ uri: getFileUri(file) }} useNativeControls resizeMode='cover' isLooping />
                                ) : (
                                    <Image source={{ uri: getFileUri(file) }} resizeMode='cover' style={styles.previewImage} />
                                )
                            }
                            <TouchableOpacity style={styles.previewDelete} onPress={() => setFile(null)}>
                                <AntDesign name='delete' size={20} color='white' />
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Media Buttons */}
                    <View style={styles.mediaButtonsContainer}>
                        <TouchableOpacity style={styles.mediaButton} onPress={() => onPick(true)}>
                            <Feather name="camera" size={20} color="black" />
                            <Text style={styles.mediaButtonText}>Image</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.mediaButton} onPress={() => onPick(false)}>
                            <Feather name="video" size={20} color="black" />
                            <Text style={styles.mediaButtonText}>Video</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Visibility Options */}
                    <View style={styles.visibilityContainer}>
                        <View style={styles.visibilityRow}>
                            <Text style={styles.visibilityLabel}>Visibility</Text>
                            {['everyone', 'friends only'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.visibilityButton,
                                        visibility === option && styles.visibilityButtonSelected,
                                    ]}
                                    onPress={() => setVisibility(option)}
                                >
                                    <Text
                                        style={[
                                            styles.visibilityButtonText,
                                            visibility === option && styles.visibilityButtonTextSelected,
                                        ]}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Publish Button */}
                </View>
                <TouchableOpacity style={styles.publishButton} onPress={() => handlePostSubmit()}>
                    <Text style={styles.publishButtonText}>Publish</Text>
                </TouchableOpacity>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 5,
        marginTop: 40,
    },
    contentContainer: {
        padding: 20,
        width: '95%',
        alignSelf: 'center',
        backgroundColor: '#fff',
        borderRadius: 25,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
        marginTop: 40
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 35,
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    userDetails: {
        flexDirection: 'column',
    },
    userName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 3
    },
    userUsername: {
        fontSize: 12,
        color: '#888',
    },
    dropdownRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
        zIndex: 10,
    },
    dropdownLabel: {
        fontFamily: 'Poppins-bold',
        fontSize: 13,
        color: '#333',
        marginRight: 10,
        width: 120,
    },
    dropdown: {
        flex: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        width: '61%'
    },
    dropdownText: {
        fontSize: 12,
    },
    input: {
        height: 150,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        padding: 15,
        textAlignVertical: 'top',
        backgroundColor: '#fff',
        marginBottom: 10,
    },
    mediaButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 15,
    },
    mediaButton: {
        backgroundColor: '#F5EDE0',
        padding: 10,
        borderRadius: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '30%',
        marginBottom: 20
    },
    mediaButtonText: {
        color: '#000',
        marginLeft: 5,
        fontSize: 12,
    },
    visibilityContainer: {
        marginBottom: 20,
        flexDirection: 'row', // To place label and buttons in a row
        alignItems: 'center', // Align items vertically
        justifyContent: 'flex-start', // Align content to the start
    },
    visibilityRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    visibilityLabel: {
        fontFamily: 'Poppins-bold',
        fontSize: 13,
        color: '#333',
        marginRight: 15, // Add spacing between label and buttons
    },
    visibilityButtonsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    sectionLabel: {
        fontFamily: 'Poppins-bold',
        fontSize: 13,
        color: '#333',
        marginBottom: 10,
    },
    visibilityButton: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: '#f5f5f5',
        borderRadius: 80,
        alignItems: 'center',
    },
    visibilityButtonSelected: {
        backgroundColor: '#000',
    },
    visibilityButtonText: {
        color: '#333',
        fontSize: 12
    },
    visibilityButtonTextSelected: {
        color: '#fff',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    publishButton: {
        backgroundColor: '#FF6A88',
        padding: 15,
        width: 150,
        marginTop: 10,
        borderRadius: 80,
        alignItems: 'center',
        alignSelf: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.4,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 3 },
        elevation: 5,
        marginBottom: 80
    },
    publishButtonText: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'Poppins-bold',
    },
    previewContainer: {
        flex: 1,
        marginTop: 10,
        marginBottom: 20,
        alignItems: 'center',
    },
    previewImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginBottom: 10,
    },
    previewVideo: {
        width: '100%',
        height: 200,
        borderRadius: 10,
    },
    previewDelete: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 7,
        borderRadius: 500,
        backgroundColor: 'rgba(255, 0, 0, 0.6)'
    },
});

export default CreatePost;