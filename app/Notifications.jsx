import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { supabase } from '../lib/supabase'; // Assuming supabaseClient is set up

export default function Notifications({ navigation }) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Fetch notifications from the database
        const fetchNotifications = async () => {
            try {
                const { data: notificationsData, error } = await supabase
                    .from('notifications')
                    .select('id, type, user_id, actor_id, post_id, created_at')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                // Fetch the username for actor_id and comment content for 'comment' notifications
                const notificationsWithContent = await Promise.all(
                    notificationsData.map(async (notification) => {
                        // Fetch the actor's username
                        const { data: actorData, error: actorError } = await supabase
                            .from('users')
                            .select('username')
                            .eq('userid', notification.actor_id)
                            .single();

                        if (actorError) {
                            console.error('Actor not found:', actorError);
                            // Handle gracefully, e.g., return or continue with default data
                        }

                        let notificationContent = '';
                        if (notification.type === 'comment') {
                            // Fetch the comment content using both post_id and actor_id (user_id)
                            const { data: commentData, error: commentError } = await supabase
                                .from('comments')
                                .select('content')
                                .eq('post_id', notification.post_id)
                                .eq('user_id', notification.actor_id) // Corrected query
                                .order('created_at', { ascending: false }) // Order by latest comment first
                                .limit(1) // Limit to the most recent comment
                                .single();  // Use `.single()` to return only one row

                            if (commentError) throw commentError;

                            notificationContent = (
                                <>
                                    Your post got a new comment from <Text style={styles.boldUsername}>@{actorData.username}</Text>: "{commentData.content}"
                                </>
                            );
                        } else if (notification.type === 'like') {
                            notificationContent = (
                                <>
                                    Your post was liked by <Text style={styles.boldUsername}>@{actorData.username}</Text>
                                </>
                            );
                        }

                        return {
                            ...notification,
                            content: notificationContent,
                            date: new Date(notification.created_at).toLocaleDateString(),
                        };
                    })
                );

                setNotifications(notificationsWithContent);
            } catch (error) {
                console.error('Error fetching notifications:', error.message);
            }
        };

        fetchNotifications();
    }, []);

    const handleNotificationPress = (postId) => {
        // Navigate to the specific post when the notification is clicked
        navigation.navigate('PostDetails', { postId });
    };

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={notifications}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.notificationContainer}
                        onPress={() => handleNotificationPress(item.post_id)}
                    >
                        <Text style={styles.notificationContent}>{item.content}</Text>
                        <Text style={styles.date}>{item.date}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id.toString()}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingTop: 20,
    },
    notificationContainer: {
        borderRadius: 15,
        backgroundColor: "#fff",
        marginBottom: 15,
        padding: 15,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        marginHorizontal: 20,
    },
    notificationContent: {
        color: '#333',
        marginVertical: 8,
        fontSize: 14,
    },
    boldUsername: {
        fontWeight: 'bold', // Makes the username bold
        color: '#333', // You can customize this color if needed
    },
    date: {
        color: '#aaa',
        marginTop: 5,
        fontSize: 12,
    },
});
