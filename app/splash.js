import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, Image, Text, StyleSheet, Animated } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function Splash(props) {
	const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity value for fade-in
	const [scaleAnim] = useState(new Animated.Value(0.5)); // Initial scale for the app name

	useEffect(() => {
		// Start the fade-in and scaling animation when the component mounts
		Animated.sequence([
			Animated.timing(fadeAnim, {
				toValue: 1,
				duration: 2000,
				useNativeDriver: true, // Use native driver for performance
			}),
			Animated.timing(scaleAnim, {
				toValue: 1,
				duration: 1000,
				useNativeDriver: true, // Use native driver for performance
			}),
		]).start();

	}, [fadeAnim, scaleAnim]);

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollView}>
				<Animated.View style={{ ...styles.logoContainer, opacity: fadeAnim }}>
					<Image
						source={require('../assets/logo.png')}
						resizeMode="contain"
						style={styles.image}
					/>
				</Animated.View>
				<Animated.View
					style={{
						...styles.appNameContainer,
						opacity: fadeAnim,
						transform: [{ scale: scaleAnim }],
					}}
				>
					<Text style={styles.menuTitle}>
						<Text style={styles.feel}>Feel</Text>
						<Text style={styles.tok}>Tok</Text>
					</Text>
				</Animated.View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#000', // Black background
		justifyContent: 'center', // Center content vertically
		alignItems: 'center', // Center content horizontally
	},
	scrollView: {
		flexGrow: 1, // Allow content to expand if needed
		justifyContent: 'center', // Center everything in the scrollView
		alignItems: 'center',
		paddingHorizontal: 20, // Horizontal padding for spacing
	},
	logoContainer: {
		marginBottom: 5, // Spacing between logo and app name
	},
	image: {
		width: '52.5%',
		aspectRatio: 1,
		alignSelf: 'center' // Keep the aspect ratio of the image intact
	},
	appNameContainer: {
		marginTop: 20, // Space between the logo and app name
	},
	appName: {
		fontSize: 36,
		fontWeight: 'bold',
		color: '#fff',
		textAlign: 'center', // Center the app name
		letterSpacing: 2, // Spacing between letters for style
	},
	menuTitle: {
		fontSize: 36,
		fontFamily: 'Poppins-bold',
		flexDirection: 'row',
		alignItems: 'center',
	},
	feel: {
		color: '#FF6A88', // Feel color (change this to the color you want)
	},
	tok: {
		color: '#FF9A8B', // Tok color (change this to the color you want)
	},
});
