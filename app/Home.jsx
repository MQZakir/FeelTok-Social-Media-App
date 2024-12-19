import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Image, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Dimensions, TouchableWithoutFeedback, Keyboard, KeyboardAvoidingView, Platform } from 'react-native';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import {
    useFonts,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import Feather from '@expo/vector-icons/Feather';
import Entypo from '@expo/vector-icons/Entypo';
import { LinearGradient } from 'expo-linear-gradient';
import useUserData from '../hooks/useUserData';
import { supabase } from '../lib/supabase';
import { Video } from 'expo-av';

const { height, width } = Dimensions.get('window');
const FeedItem = ({ post, onLikeToggle, onBookmarkToggle, onAddComment }) => {
    const [commentText, setCommentText] = useState('');
    const { userData, loading, error } = useUserData()
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);
    const [reportReason, setReportReason] = useState('');

    const handleCommentSubmit = async () => {
        if (commentText.trim()) {
            await onAddComment(post.id, commentText);
            setCommentText(''); // Clear the comment input
        } else {
            alert('Please enter a comment');
        }
    };

    const handleReportPost = async () => {
        console.log('pressed')
        if (!reportReason.trim()) {
            alert('Please provide a reason for the report.');
            return;
        }

        console.log('pressed')
        // Insert the report into the reports table in Supabase
        const { error } = await supabase
            .from('reports')
            .insert([
                {
                    reporter_id: userData.userid,  // Reporter is the current user
                    post_id: post.id,              // Post being reported
                    report_content: reportReason,  // Content of the report
                }
            ]);

        if (error) {
            console.error('Error reporting post:', error.message);
            Alert.alert('Reporting Error', 'An error occurred while reporting the post.');
        } else {
            Alert.alert('Reported', 'Post reported successfully!, Please give us time to review the post.');
            setIsInfoModalVisible(false); // Close the modal after reporting
        }
    };

    return (
        <View style={styles.postContainer}>
            <View style={styles.header}>
                <Image source={{ uri: post.avatar }} style={styles.avatar} />
                <View>
                    <Text style={styles.name}>{post.name}</Text>
                    <Text style={styles.username}>{post.username}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => setIsInfoModalVisible(true)}
                    style={styles.infoButton}
                >
                    <Feather name="info" size={14} color="rgba(0, 0, 0, 0.3)" />
                </TouchableOpacity>
            </View>
            <Text style={styles.content}>{post.content}</Text>
            {post.file && (post.mediaType === 'video' ? (
                <Video style={styles.postImage} source={{ uri: post.file }} useNativeControls resizeMode='contain' isLooping />
            ) : (
                <Image source={{ uri: post.file }} resizeMode='cover' style={styles.postImage} />
            ))}
            <LinearGradient colors={["#FF9A8B", "#FF6A88", "#FFC1C1", "#FFD6A5"]} start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }} style={styles.buttonsContainer}>
                <TouchableOpacity
                    onPress={() => onLikeToggle(post.id, post.isLiked)}
                    style={styles.button}
                >
                    <Ionicons
                        name={post.isLiked ? 'heart' : 'heart-outline'}
                        size={22}
                        color={post.isLiked ? 'red' : 'black'}
                    />
                    <Text style={styles.buttonText}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => setIsModalVisible(true)}
                >
                    <Ionicons name="chatbubble-ellipses-outline" size={22} color="black" />
                    <Text style={styles.buttonText}>{post.comments.length}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => onBookmarkToggle(post.id, post.isBookmarked)}
                >
                    <Ionicons
                        name={post.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={22}
                        color={post.isBookmarked ? '#FF5A8B' : 'black'}
                    />
                </TouchableOpacity>
            </LinearGradient>

            {/* Comments Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setIsModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <KeyboardAvoidingView
                                style={styles.commentSection}
                                behavior="padding"
                            >
                                <ScrollView style={styles.commentsList}>
                                    {post.comments.map((comment, index) => (
                                        <Text key={index} style={styles.commentText}>
                                            <Text style={styles.commentUsername}>
                                                @{comment.users?.username || 'Unknown'}:
                                            </Text> {comment.content}
                                        </Text>
                                    ))}
                                </ScrollView>
                                <View style={styles.inputContainer}>
                                    <TextInput
                                        style={styles.commentInput}
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChangeText={setCommentText}
                                    />
                                    <TouchableOpacity
                                        onPress={handleCommentSubmit}
                                        style={styles.submitButton}
                                    >
                                        <Ionicons name="arrow-forward" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Post Info Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isInfoModalVisible}
                onRequestClose={() => setIsInfoModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setIsInfoModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <KeyboardAvoidingView style={styles.infoModalContent} behavior='padding'>
                                <Text style={styles.modalText}>Posted on: {post.date}</Text>
                                {/* Report Reason Input */}
                                <View style={styles.reportInputContainer}>
                                    <Text style={styles.reportInputLabel}>Why are you reporting this post?</Text>
                                    <TextInput
                                        style={styles.reportInput}
                                        placeholder="Enter reason..."
                                        multiline={true}
                                        numberOfLines={4}
                                        value={reportReason}
                                        onChangeText={setReportReason}
                                    />
                                </View>
                                <TouchableOpacity
                                    onPress={handleReportPost}
                                    style={styles.reportButton}
                                >
                                    <Text style={styles.reportButtonText}>Report Post</Text>
                                </TouchableOpacity>
                            </KeyboardAvoidingView>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};


export default function Home() {
    const [posts, setPosts] = useState([]);
    const { userData, loading, error } = useUserData()

    useEffect(() => {
        async function fetchPosts() {
            try {

                const { data: followings, error: followError } = await supabase
                    .from('follows')
                    .select('following_id')
                    .eq('follower_id', userData.userid)

                if (followError) {
                    console.error("Follow error:", followError.message);
                    return;
                }

                const followedUserIds = followings.map(f => f.following_id);

                // Also include the user's own posts
                followedUserIds.push(userData.userid);

                const { data, error } = await supabase
                    .from("posts")
                    .select(`
                        *,
                        users:user_id (
                            name,
                            username,
                            profileImage
                        ),
                        comments(*, users:user_id(username)), 
                        likes(*)
                    `)
                    .in('user_id', followedUserIds)
                    .order('created_at', { ascending: false });

                if (error) {
                    console.error("Posts error:", error);
                } else {
                    // Transform the data to match FeedItem component expectations
                    const transformedPosts = data.map(post => {
                        const mediaType = post.file.includes("postVideos") ? "video" : "image";

                        const isLiked = post.likes.some(like => like.user_id === userData.userid); // Check if user has liked the post
                        const isBookmarked = post.likes.some(bookmark => bookmark.user_id === userData.userid); // Check if user has liked the post

                        return {
                            ...post,
                            id: post.post_id,
                            name: post.users?.name || 'Unknown User',
                            username: post.users?.username || 'unknown',
                            avatar: post.users?.profileImage || '../assets/default-user.jpeg',
                            likes: post.likes.length || 0, // Default value for likes
                            file: post.file || null, // Handle missing file
                            comments: post.comments || [], // Ensure comments are an array
                            isLiked, // Set the correct liked state
                            isBookmarked,
                            date: new Date(post.created_at).toLocaleDateString(),
                            mediaType,
                        };
                    });
                    setPosts(transformedPosts);
                }
            } catch (err) {
                console.error("Error:", err);
            }
        }

        if (userData?.userid) {
            fetchPosts();
        }
    }, [userData]);

    const handleLikeToggle = async (postId, isLiked) => {
        try {
            let action = '';
            if (isLiked) {
                // If the post is liked, we remove the like
                action = 'delete';
                const { error } = await supabase
                    .from('likes')
                    .delete()
                    .match({ post_id: postId, user_id: userData.userid });

                const { error: Error } = await supabase
                    .from('notifications')
                    .delete()
                    .eq('post_id', postId);

                console.log('notification deleted')

                if (error || Error) {
                    console.error("Error unliking post:", Error.message);
                    return;
                }
            } else {
                // If the post is not liked, we add the like
                action = 'insert';
                const { error } = await supabase
                    .from('likes')
                    .upsert([{ post_id: postId, user_id: userData.userid }], { onConflict: ['post_id', 'user_id'] });

                if (error) {
                    console.error("Error liking post:", error.message);
                    return;
                }
                const postOwner = posts.find(post => post.id === postId);
                console.log(postOwner.user_id);
                // Insert a notification for "like"
                await supabase
                    .from('notifications')
                    .insert([
                        {
                            user_id: postOwner.user_id,  // Owner of the post
                            post_id: postId,
                            type: 'like',
                            actor_id: userData.userid,  // User who liked
                        }
                    ]);
                console.log('data inserted success')
            }


            // Update the likes state in the frontend
            const updatedPosts = posts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        isLiked: !isLiked, // Toggle the like status
                        likes: isLiked ? post.likes - 1 : post.likes + 1, // Increment or decrement the likes count
                    }
                    : post
            );

            setPosts(updatedPosts);
        } catch (error) {
            console.error("Error handling like toggle:", error);
        }
    };

    const handleAddComment = async (postId, commentText) => {
        const { error } = await supabase
            .from('comments')
            .insert([{ post_id: postId, user_id: userData.userid, content: commentText }]);

        if (error) {
            console.error("Error adding comment:", error.message);
        } else {
            // Now, we need to update the comments list locally immediately after the comment is added
            const updatedPosts = posts.map((post) =>
                post.id === postId
                    ? {
                        ...post,
                        comments: [
                            ...post.comments,
                            {
                                content: commentText,
                                users: { username: userData.username } // Make sure this matches the structure of your comments
                            }
                        ]
                    }
                    : post
            );
            setPosts(updatedPosts); // Update the posts state

            const postOwner = posts.find(post => post.id === postId);

            // Ensure postOwner is found before proceeding
            if (postOwner) {
                // Insert a notification for the comment
                await supabase
                    .from('notifications')
                    .insert([
                        {
                            user_id: postOwner.user_id,  // Owner of the post
                            post_id: postId,
                            type: 'comment',
                            actor_id: userData.userid,  // User who commented
                        }
                    ]);
            } else {
                console.error('Post owner not found');
            }
        }
    };

    const handleBookmarkToggle = async (postId, isBookmarked) => {
        try {
            // Find the post
            const post = posts.find((p) => p.id === postId);
            if (!post) return;

            if (isBookmarked) {
                // Remove from saved posts
                const { error } = await supabase
                    .from('saves')
                    .delete()
                    .eq('post_id', postId)
                    .eq('user_id', userData.userid);

                if (error) {
                    console.error("Error removing save:", error.message);
                    Alert.alert("Error", "Unable to unsave the post.");
                    return;
                }
            } else {
                // Add to saved posts
                const { error } = await supabase
                    .from('saves')
                    .insert([{ post_id: postId, user_id: userData.userid }]);

                if (error) {
                    console.error("Error saving post:", error.message);
                    Alert.alert("Error", "Unable to save the post.");
                    return;
                }
            }

            // Update the posts state
            const updatedPosts = posts.map((p) =>
                p.id === postId
                    ? {
                        ...p,
                        isBookmarked: !p.isBookmarked, // Toggle the bookmarked state
                    }
                    : p
            );
            setPosts(updatedPosts);
        } catch (error) {
            console.error("Error toggling bookmark:", error);
            Alert.alert("Error", "Something went wrong while saving the post.");
        }
    };


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                />
                <Text style={styles.appName}>
                    <Text style={styles.feel}>Feel</Text>
                    <Text style={styles.tok}>Tok</Text>
                </Text>
            </View>
            {posts.length === 0 ? (
                <View style={styles.noPostsContainer}>
                    <Text style={styles.noPostsMessage}>You don't follow anyone yet. Start following people to see their posts!</Text>
                </View>
            ) : (
                <FlatList
                    data={posts}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item }) => (
                        <FeedItem
                            post={item}
                            onLikeToggle={handleLikeToggle}
                            onAddComment={handleAddComment}
                            onBookmarkToggle={handleBookmarkToggle}
                        />
                    )}
                    keyExtractor={(item) => item.post_id}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: Platform.OS === 'android' ? 50 : 0,
    },
    noPostsContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    noPostsMessage: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: '100%',
        paddingHorizontal: 15,
    },
    logo: {
        width: 70,
        height: 70,
        marginRight: 3,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        fontFamily: "Poppins_600SemiBold",
    },
    feel: {
        color: '#FF6A88',
    },
    tok: {
        color: '#FF9A8B',
    },
    reportInputContainer: {
        marginTop: 15,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd',
        backgroundColor: '#f9f9f9',
    },
    reportInputLabel: {
        fontFamily: 'Poppins_600SemiBold',
        fontSize: 14,
        color: '#333',
        marginBottom: 5,
    },
    reportInput: {
        width: '100%',
        height: 120,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#ddd',
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontFamily: 'Poppins_400Regular',
        fontSize: 14,
        textAlignVertical: 'top', // Aligns text to top in multiline input
    },
    postContainer: {
        borderRadius: 15,
        padding: 20,
        backgroundColor: "#fff",
        marginBottom: 35,
        marginTop: 5,
        width: width * 0.95,
        alignSelf: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    name: {
        fontFamily: "Poppins_700Bold",
        fontWeight: 'bold',
    },
    username: {
        fontFamily: "Poppins_400Regular",
        fontSize: 12,
        color: '#888',
    },
    content: {
        marginVertical: 10,
        marginBottom: 15,
        marginTop: 20,
    },
    buttonsContainer: {
        position: 'absolute',
        bottom: -20,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: "65%",
        padding: 10,
        paddingVertical: 10,
        borderRadius: 30,
        shadowColor: '#000',
        shadowOffset: { width: 1, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 5,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    buttonText: {
        marginLeft: 3,
        color: '#000'
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    commentSection: {
        backgroundColor: 'rgba(50, 50, 50, 1)',
        borderRadius: 25,
        padding: 25,
        height: '70%',
        width: '95%',
        alignSelf: 'center',
        marginBottom: 50,
    },
    commentsList: {
        flex: 1,
    },
    commentText: {
        marginBottom: 15,
        color: 'white',
    },
    commentUsername: {
        fontFamily: "Poppins_700Bold",
        color: 'white'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
    },
    commentInput: {
        color: '#000',
        borderRadius: 100,
        backgroundColor: '#fff',
        padding: 13,
        marginBottom: 10,
        flex: 1,
        marginRight: 10,
    },
    submitButton: {
        marginBottom: 10,
        justifyContent: 'center',
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        backgroundColor: '#fff'
    },

    likesAndComments: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '45%',
    },

    icon: {
        marginRight: 5,
    },

    postImage: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
        resizeMode: 'cover',
    },

    infoButton: {
        position: 'absolute',
        padding: 5,
        borderRadius: 20,
        justifyContent: 'center',
        top: -5,
        right: -10
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    infoModalContent: {
        backgroundColor: 'rgba(50, 50, 50, 1)',
        borderRadius: 25,
        padding: 25,
        width: '95%',
        alignSelf: 'center',
        marginBottom: 50,
    },
    modalText: {
        color: 'white',
        fontSize: 16,
        marginBottom: 10,
    },
    reportButton: {
        backgroundColor: '#f00',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 50,
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 20,
    },
    reportButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
