// sendOtp.jsx
import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { supabase } from "../lib/supabase"; // Your Supabase instance
import { useNavigation } from "@react-navigation/native";

export default function SendOtp({ route }) {
    const navigation = useNavigation();
    const { email, password } = route.params;
    const [otp, setOtp] = useState("");

    const handleSendOtp = async () => {
        try {
            const { error } = await supabase.auth.signInWithOtp({ email });

            if (error) {
                alert("Error sending OTP: " + error.message);
                return;
            }

            navigation.navigate("Verification", { email, otp, password });
        } catch (error) {
            alert("Error sending OTP: " + error.message);
        }
    };

    return (
        <LinearGradient colors={['#FF9A8B', '#FF6A88', '#FFC1C1', '#FFD6A5']} style={styles.container}>
            <SafeAreaView style={styles.safeArea}>
                <Text style={styles.heading}>Verify your email</Text>
                <Text style={styles.subHeading}>An OTP will be sent to: {email}</Text>

                <TouchableOpacity style={styles.button} onPress={handleSendOtp}>
                    <Text style={styles.buttonText}>Send OTP</Text>
                </TouchableOpacity>

            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
    },
    subHeading: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 20,
    },
    button: {
        marginTop: 20,
        padding: 15,
        backgroundColor: "#F5EDE0",
        borderRadius: 50,
        alignItems: "center",
        width: "80%",
    },
    buttonText: {
        color: "#000",
        fontSize: 18,
    },
    linkText: {
        color: '#3360C1',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 15,
    },
});
