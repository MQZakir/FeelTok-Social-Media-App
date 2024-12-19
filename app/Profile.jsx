import React, { useState, useEffect } from "react";
import {
	SafeAreaView,
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	Platform,
	FlatList,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { supabaseURL } from "../constants/keys";
import { useNavigation } from "@react-navigation/native";
import useUserData from "../hooks/useUserData";
import { supabase } from "../lib/supabase";
import { Video } from 'expo-av'

const Profile = ({ route }) => {
	const navigation = useNavigation();
	const { userData } = route.params; // User data passed from route
	const [followersData, setFollowersData] = useState([]);
	const [postsState, setPostsState] = useState({
		userPosts: [],
		savedPosts: []
	});
	const [viewMode, setViewMode] = useState("user");
	const [loading, setLoading] = useState(true);

	const getFileType = (file) => {
		if (!file) return null;
		if (file.includes('postImages')) {
			return 'image';
		}
		return 'video';
	};

	const fetchPosts = async () => {
		setLoading(true);
		try {

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
			// Fetch user's posts
			const { data: userPosts, error: userPostsError } = await supabase
				.from("posts")
				.select("*, users(name, username, profileImage)")
				.eq("user_id", userData.userid);

			if (userPostsError) throw userPostsError;

			// Fetch saved posts from the 'saves' table
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
			setPostsState({
				userPosts,
				savedPosts: formattedSavedPosts,
			});
		} catch (err) {
			console.error("Error fetching posts:", err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPosts();
	}, [userData.userid]);

	// Filter posts based on the viewMode
	const profilePosts =
		viewMode === "user" ? postsState.userPosts : postsState.savedPosts;

	// Handle deleting a post
	const handleDeletePost = async (postId) => {
		try {
			const { error } = await supabase
				.from("posts")
				.delete()
				.eq("post_id", postId); // Use the correct post ID field

			if (error) {
				console.error("Error deleting post:", error.message);
			} else {
				setPostsState({
					...postsState,
					userPosts: postsState.userPosts.filter((post) => post.post_id !== postId),
				});
			}
		} catch (err) {
			console.error("Unexpected error deleting post:", err.message);
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			{/* Profile Header */}
			<View style={styles.profileHeader}>
				<Image
					source={
						userData?.profileImage
							? { uri: userData.profileImage }
							: require("../assets/default-user.jpg")
					}
					resizeMode="cover"
					style={styles.profileImage}
				/>
				<View style={styles.profileDetailsContainer}>
					<Text style={styles.profileDetails}>
						{userData?.name ? userData.name + "\n" : "Loading...\n"}
						<Text style={styles.username}>{"@" + userData?.username || "@username"}</Text>
					</Text>
				</View>
				<TouchableOpacity
					style={styles.editProfileButton}
					onPress={() =>
						navigation.navigate("EditProfile", { userData: userData })
					}
				>
					<Text style={styles.editProfileButtonText}>Edit Profile</Text>
				</TouchableOpacity>
			</View>

			{/* Profile Stats */}
			<Text style={styles.bioText}>{userData?.bio || ""}</Text>
			<View style={styles.profileStats}>
				<View style={styles.statItem}>
					<Ionicons name="create" size={30} color="#333" />
					<Text style={styles.statText}>{postsState.userPosts.length}</Text>
				</View>
				<TouchableOpacity style={styles.statItem}>
					<Ionicons name="person" size={30} color="#333" />
					<Text style={styles.statText}>{followersData.length}</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.statItem}>
					<Ionicons name="bookmark" size={30} color="#333" />
					<Text style={styles.statText}>{postsState.savedPosts.length}</Text>
				</TouchableOpacity>
			</View>

			{/* Toggle Buttons */}
			<View style={styles.buttonContainer}>
				<TouchableOpacity
					style={[
						styles.toggleButton,
						viewMode === "user" && styles.activeButton,
					]}
					onPress={() => setViewMode("user")}
				>
					<Text style={styles.toggleButtonText}>My Posts</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.toggleButton,
						viewMode === "saved" && styles.activeButton,
					]}
					onPress={() => setViewMode("saved")}
				>
					<Text style={styles.toggleButtonText}>Saved Posts</Text>
				</TouchableOpacity>
			</View>
			<View style={styles.divider} />

			{/* Posts Section */}
			{loading ? (
				<Text style={styles.loadingText}>Loading posts...</Text>
			) : profilePosts.length === 0 ? (
				<Text style={styles.noPostsText}>
					{viewMode === "user"
						? "You have no posts"
						: "You have no saved posts"}
				</Text>
			) : (
				<FlatList
					data={profilePosts}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<View style={styles.postCard}>
							{/* Post Header for saved posts */}
							{viewMode === "saved" ? (
								<View style={styles.postHeader}>
									<Image
										source={
											item.user.profileImage
												? { uri: item.user.profileImage }
												: require("../assets/default-user.jpg") // Default image
										}
										style={styles.profileImage}
									/>
									<View style={styles.postHeaderDetails}>
										<Text style={styles.postName}>{item.user.name}</Text>
										<Text style={styles.username}>@{item.user.username}</Text>
									</View>
								</View>
							) : null}

							{/* Post Content */}
							<Text style={styles.postContent}>{item.content}</Text>

							{/* Post Image */}
							{item.file && (
								getFileType(item.file) === 'video' ? (
									<Video style={styles.postImage} source={{ uri: item.file }} useNativeControls resizeMode='cover' isLooping />
								) : (
									<Image source={{ uri: item.file }} resizeMode='cover' style={styles.postImage} />
								)
							)}

							{/* Actions */}
							<View style={styles.postActions}>
								{viewMode === "user" && (
									<TouchableOpacity onPress={() => handleDeletePost(item.post_id)}>
										<Ionicons name="trash" size={24} color="red" />
									</TouchableOpacity>
								)}
							</View>
						</View>
					)}
					keyExtractor={(item) => item.post_id.toString()}
					contentContainerStyle={{ paddingBottom: 100 }}
				/>
			)}

		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	noPostsText: {
		textAlign: "center",
		fontSize: 16,
		color: "#555",
		fontWeight: "500",
		marginTop: 20,
	},
	container: {
		flex: 1,
		paddingTop: Platform.OS === "android" ? 50 : 0,
	},
	profileHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15,
		marginVertical: 10,
		paddingHorizontal: 20
	},
	bioText: {
		color: "#000",
		fontSize: 14,
		fontWeight: "400",
		marginBottom: 5,
		flexWrap: "wrap",
		marginLeft: 40,
	},
	profileImage: {
		width: 75,
		height: 75,
		borderRadius: 36,
	},
	profileDetailsContainer: {
		flex: 1,
		marginLeft: 5,
	},
	profileDetails: {
		fontSize: 16,
		color: "#000",
		fontWeight: "500",
		fontFamily: "Poppins",
		padding: 5
	},
	username: {
		color: "#555",
		fontSize: 14,
		fontWeight: "400",
	},
	editProfileButton: {
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
	editProfileButtonText: {
		color: "#000",
		fontSize: 14,
		fontWeight: "500",
	},
	profileStats: {
		flexDirection: "row",
		justifyContent: "space-around",
		alignItems: "center",
		padding: 15,
		width: "100%",
	},
	statItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	statText: {
		marginLeft: 5,
		fontSize: 16,
		color: "#333",
		fontFamily: "Poppins",
	},
	divider: {
		height: 1,
		backgroundColor: "#E9E9EB",
		marginVertical: 10,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		marginTop: 15
	},
	toggleButton: {
		backgroundColor: "#000",
		borderRadius: 30,
		paddingVertical: 8,
		paddingHorizontal: 15,
		width: "45%",
		alignItems: "center",
	},
	activeButton: {
		backgroundColor: "#FF6A88",
	},
	toggleButtonText: {
		fontSize: 14,
		fontWeight: "500",
		color: "#fff",
	},
	postCard: {
		backgroundColor: "#F9F9F9",
		borderRadius: 10,
		marginBottom: 15,
		padding: 15,
		alignSelf: 'center',
		width: '95%',
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
	},
	postHeader: {
		flexDirection: "row",
		alignItems: "center",
	},
	postHeaderDetails: {
		marginLeft: 10,
	},
	postName: {
		fontSize: 16,
		fontWeight: "600",
	},
	postContent: {
		marginVertical: 10,
		fontSize: 16,
		color: "#333",
	},
	postImage: {
		width: "100%",
		height: 200,
		borderRadius: 10,
		marginVertical: 10,
	},
	postActions: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
	},
	loadingText: {
		alignSelf: 'center',
		marginLeft: 15,
		textAlign: 'center'
	}
});

export default Profile;
