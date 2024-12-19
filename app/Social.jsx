import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    Image,
    SafeAreaView,
    Platform,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { supabase } from '../lib/supabase'; // Adjust the path to your Supabase client
import useUserData from '../hooks/useUserData';

const Social = () => {
    const [activeTab, setActiveTab] = useState('followers');
    const { userData, loadings, error } = useUserData();
    const [followersData, setFollowersData] = useState([]);
    const [followingData, setFollowingData] = useState([]);
    const [suggestedData, setSuggestedData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch followers, following, and suggested users from Supabase
    const fetchData = async () => {
        try {
            setLoading(true);

            if (!userData || !userData.userid) {
                throw new Error('User data not available');
            }

            // Fetch followers
            const { data: followers, error: followersError } = await supabase
                .from('follows')
                .select('follower_id')
                .eq('following_id', userData.userid);

            if (followersError) throw followersError;

            // Get user data for each follower
            const followerIds = followers.map(f => f.follower_id);
            const { data: followerUsers, error: followerUserError } = await supabase
                .from('users')
                .select('*')
                .in('userid', followerIds);

            if (followerUserError) throw followerUserError;

            setFollowersData(followerUsers);

            // Fetch following
            const { data: following, error: followingError } = await supabase
                .from('follows')
                .select('following_id')
                .eq('follower_id', userData.userid);

            if (followingError) throw followingError;

            // Get user data for each following
            const followingIds = following.map(f => f.following_id);
            const { data: followingUsers, error: followingUserError } = await supabase
                .from('users')
                .select('*')
                .in('userid', followingIds);

            if (followingUserError) throw followingUserError;

            setFollowingData(followingUsers);

            // Fetch suggested users (excluding current user)
            const { data: suggested, error: suggestedError } = await supabase
                .from('users')
                .select('*')
                .neq('userid', userData.userid); // Exclude the current user

            if (suggestedError) throw suggestedError;

            // Filter out the users that are already followed by the current user
            const filteredSuggestedData = suggested.filter(
                (user) => !followingIds.includes(user.userid)
            );

            setSuggestedData(filteredSuggestedData);
        } catch (error) {
            console.error('Error fetching data:', error.message);
            Alert.alert('Error', 'Could not fetch data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userData && userData.userid) {
            fetchData();
        }
    }, [userData]); // Only fetch data when userData is available

    const handleFollow = async (targetUserId) => {
        try {
            const { error } = await supabase
                .from('follows')
                .insert([{ follower_id: userData.userid, following_id: targetUserId }]);

            if (error) throw error;
            fetchData(); // Refresh the data
        } catch (error) {
            console.error('Error following user:', error.message);
            Alert.alert('Error', 'Could not follow this user.');
        }
    };

    const getCurrentList = () => {
        if (activeTab === 'followers') return followersData;
        if (activeTab === 'following') return followingData;
        if (activeTab === 'Social') return suggestedData;
        return [];
    };

    const renderItem = ({ item }) => (
        <View style={styles.item}>
            <View style={styles.userInfo}>
                <View style={styles.avatarPlaceholder}>
                    <Image
                        style={styles.avatar}
                        source={{ uri: item.profileImage || 'https://via.placeholder.com/40' }}
                    />
                </View>
                <Text style={styles.username}>{item.name}</Text>
            </View>
            {activeTab === 'Social' && (
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleFollow(item.userid)}
                >
                    <Text style={styles.actionButtonText}>Follow</Text>
                </TouchableOpacity>
            )}
        </View>
    );

    if (!userData || loadings) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Loading user data...</Text>
            </View>
        );
    }

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#000" />
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.tabHeader}>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        activeTab === 'followers' && styles.activeTabItem,
                    ]}
                    onPress={() => setActiveTab('followers')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'followers' && styles.activeTabText,
                        ]}
                    >
                        Followers
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        activeTab === 'following' && styles.activeTabItem,
                    ]}
                    onPress={() => setActiveTab('following')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'following' && styles.activeTabText,
                        ]}
                    >
                        Following
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.tabItem,
                        activeTab === 'Social' && styles.activeTabItem,
                    ]}
                    onPress={() => setActiveTab('Social')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            activeTab === 'Social' && styles.activeTabText,
                        ]}
                    >
                        Suggested
                    </Text>
                </TouchableOpacity>
            </View>

            {getCurrentList().length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        {activeTab === 'followers'
                            ? 'You have no followers yet.'
                            : activeTab === 'following'
                                ? 'You are not following anyone yet.'
                                : 'No suggested users found.'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={getCurrentList()}
                    keyExtractor={(item) => item.userid.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContainer}
                    refreshing={loading}
                    onRefresh={fetchData}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === 'android' ? 50 : 0,
    },
    tabHeader: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        elevation: 5,
        marginBottom: 10,
        paddingRight: 5,
        paddingLeft: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#000',
        marginHorizontal: 3,
    },
    activeTabItem: {
        backgroundColor: '#FF6A88',
    },
    tabText: {
        fontSize: 14,
        color: '#fff',
    },
    activeTabText: {
        color: '#fff',
    },
    listContainer: {
        paddingHorizontal: 20,
        flexGrow: 1,
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#ddd',
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatar: {
        width: '100%',
        height: '100%',
        borderRadius: 20,
    },
    username: {
        fontSize: 17,
        color: '#333',
    },
    actionButton: {
        backgroundColor: '#DE3163',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 20,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 12,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#999',
    },
});

export default Social;
