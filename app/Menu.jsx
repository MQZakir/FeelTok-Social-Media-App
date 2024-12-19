import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    Animated,
    Dimensions,
    Image,
    Switch
} from 'react-native';
import { useNavigation } from "@react-navigation/native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import useUserData from '../hooks/useUserData';
import { supabase } from '../lib/supabase';

const { width } = Dimensions.get('window');

export default function Menu({ visible, onClose }) {
    const navigation = useNavigation();
    const [isAnimating, setIsAnimating] = useState(false);
    const [postsData, setPostsData] = useState([]);
    const [savedPosts, setSavedPosts] = useState([])
    const [followersData, setFollowersData] = useState([]);
    const { userData, loading, error } = useUserData();
    const [isFetching, setIsFetching] = useState(null);
    const [notificationsEnabled, setNotificationsEnabled] = useState();
    const slideAnim = new Animated.Value(width);

    // Fetch followers and posts data
    const fetchUserData = async () => {
        try {
            const { data: followers, error: followersError } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', userData.userid);

            if (followersError) throw followersError;

            const followerIds = followers.map(f => f.follower_id);
            const { data: followersUsers, error: followerError } = await supabase
                .from('users')
                .select('*')
                .in('userid', followerIds);

            if (followerError) throw followerError;
            setFollowersData(followersUsers);

            // Fetch user's posts
            const { data: posts, error: postsError } = await supabase
                .from('posts')
                .select('*')
                .eq('user_id', userData.userid);

            if (postsError) throw postsError;
            const { data: savedPosts, error: savedPostsError } = await supabase
                .from("saves")
                .select("posts(*, users(name, username, profileImage))") // Include user data here
                .eq("user_id", userData.userid);

            if (savedPostsError) throw savedPostsError;

            // Format saved posts with user data
            const formattedSavedPosts = savedPosts.map((save) => ({
                ...save.posts,
                user: save.posts.users,  // Attach the user data to the post
            }));

            // Set state with both user's posts and saved posts
            setPostsData(posts);
            setSavedPosts(formattedSavedPosts)
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userData]);


    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error.message);
            return;
        }
        console.log('User logged out successfully');
        navigation.navigate('Login');
    };


    // Slide-in animation when the modal is opened
    React.useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: visible ? width * 0.35 : width, // Toggle position based on visibility
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [visible]);

    const handleClose = () => {
        Animated.timing(slideAnim, {
            toValue: width,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            setIsAnimating(false);
            onClose();
        });
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="none"
            onRequestClose={handleClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                onPress={handleClose}
            />
            <Animated.View
                style={[styles.menuContainer, { transform: [{ translateX: slideAnim }] }]}
            >
                <View style={styles.menuHeader}>
                    {/* Logo */}
                    <Image
                        source={require('../assets/logo.png')}
                        style={styles.logo}
                    />
                    {/* FeelTok */}
                    <Text style={styles.menuTitle}>
                        <Text style={styles.feel}>Feel</Text>
                        <Text style={styles.tok}>Tok</Text>
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.profileContainer}
                    onPress={() => navigation.navigate('Profile', { userData: userData })}
                >
                    <Image
                        source={
                            userData?.profileImage
                                ? { uri: userData.profileImage }
                                : require('../assets/default-user.jpg')
                        }
                        style={styles.profilePic}
                    />
                    <View style={styles.profileText}>
                        <Text style={styles.profileName}>
                            {!loading ? userData.name : 'Loading...'}
                        </Text>
                        <Text style={styles.profileUsername}>
                            {!loading ? '@' + userData.username : '@username'}
                        </Text>
                    </View>
                </TouchableOpacity>
                <View style={styles.profileStats}>
                    <View style={styles.statItem}>
                        <Ionicons name="create" size={20} color="#333" />
                        <Text style={styles.statText}>{postsData.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="person" size={20} color="#333" />
                        <Text style={styles.statText}>{followersData.length}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Ionicons name="bookmark" size={20} color="#333" />
                        <Text style={styles.statText}>{savedPosts.length}</Text>
                    </View>
                </View>
                <View style={styles.divider} />
                <View style={styles.menuItemsContainer}>
                    <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Social')}>
                        <Ionicons name="people-outline" size={24} color="#333" />
                        <Text style={styles.menuItemText}>Social</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                        <Ionicons name="log-out-outline" size={24} color="#333" />
                        <Text style={styles.menuItemText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.1)', // Semi-transparent background
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    divider: {
        height: 1,
        backgroundColor: '#ccc',
        marginHorizontal: 20,
        marginBottom: 20,
    },
    menuContainer: {
        position: 'absolute',
        top: 50,
        bottom: 0,
        right: 0,
        width: '100%', // Occupy 65% of the screen
        backgroundColor: '#fff',
        padding: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10,
        height: "85%",
        borderTopLeftRadius: 25,
        borderBottomLeftRadius: 25
    },
    menuHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        backgroundColor: '#000',
        borderTopLeftRadius: 25,
        padding: 15
    },
    logo: {
        width: 70,
        height: 75,
        marginRight: 10,
    },
    menuTitle: {
        fontSize: 30,
        fontWeight: 'bold',
        flexDirection: 'row',
        alignItems: 'center',
    },
    feel: {
        color: '#FF6A88', // Feel color (change this to the color you want)
    },
    tok: {
        color: '#FF9A8B', // Tok color (change this to the color you want)
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '65%',
        paddingVertical: 15,
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    profilePic: {
        width: 70,
        height: 70,
        borderRadius: 500,
    },
    profileText: {
        marginLeft: 10,
    },
    profileName: {
        fontSize: 14,
        fontFamily: "Poppins_700Bold",
        color: '#333',
        marginBottom: 3,
    },
    profileUsername: {
        fontSize: 12,
        fontFamily: "Poppins_400Regular",
        color: '#777',
    },
    profileStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
        width: '50%',
        left: '7.5%',
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#333',
        fontFamily: 'Poppins_400Regular',
    },
    menuItemsContainer: {
        flex: 1,
        justifyContent: 'flex-end', // Move items to the bottom
        marginBottom: 20
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    menuItemText: {
        fontSize: 16,
        color: '#111',
        fontFamily: "Poppins",
        marginLeft: 10, // Space between icon and text
    },
});
