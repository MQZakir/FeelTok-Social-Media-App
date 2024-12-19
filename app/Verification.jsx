import React, { useState, useRef } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';

export default function Verification({ route }) {
    const navigation = useNavigation();
    const { email, password } = route.params; // Email passed from previous screen
    const [otpCode, setOtp] = useState('');
    const [error, setError] = useState('');


    const handleVerify = async () => {

        if (otpCode.length !== 6) {
            setError('Please enter a valid 6-digit OTP.');
            return;
        }

        try {
            // Verify OTP using Supabase method
            const { data, error: verificationError } = await supabase.auth.verifyOtp({
                email: email,
                token: otpCode,
                type: 'email' // or 'reset' depending on the flow
            });

            if (verificationError) {
                console.error('Error during OTP verification:', verificationError);
                setError('Invalid OTP. Please try again.');
                return;
            }

            // On successful verification, navigate to home screen
            alert('Verification successful!');

            navigation.navigate('CreateAccount', { email, password });
        } catch (err) {
            console.error('Error during verification:', err);
            setError('Something went wrong. Please try again.');
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setResendStatus(''); // Clear any previous resend status

        try {
            // Resend OTP using Supabase
            const { data, error } = await supabase.auth.signInWithOtp({ email });

            if (error) {
                console.error('Error resending OTP:', error);
                setResendStatus('Failed to resend OTP. Please try again.');
                return;
            }

            setResendStatus('OTP resent successfully! Check your email.');
            setOtp(''); // Clear the OTP input
        } catch (err) {
            console.error('Error during OTP resend:', err);
            setResendStatus('Failed to resend OTP. Please try again.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <LinearGradient
                colors={['#FF9A8B', '#FF6A88', '#FFC1C1', '#FFD6A5']}
                locations={[0.4, 0.3, 0.6, 1]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={styles.container}
            >
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.introduction}>
                        <Text style={styles.heading}>Verify Your Account</Text>
                        <Text style={styles.subHeading}>
                            Enter the OTP sent to: {email}
                        </Text>
                    </View>

                    <TextInput
                        value={otpCode}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={10000}
                        style={styles.otpInput}
                    />

                    {error && <Text style={styles.errorText}>{error}</Text>}

                    <TouchableOpacity style={styles.button} onPress={handleVerify}>
                        <Text style={styles.buttonText}>Verify</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleResendOtp}>
                        <Text style={styles.linkText}>Resend OTP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={async () => {
                        try {
                            // Fetch the list of users
                            const { data, error: fetchError } = await supabase.auth.admin.listUsers();

                            if (fetchError) {
                                console.error('Error fetching user details:', fetchError);
                                alert('Failed to fetch users. Please try again.');
                                return;
                            }

                            // Find the user by email
                            const user = data.users.find((u) => u.email === email);

                            if (!user) {
                                alert('No user found with the provided email.');
                                return;
                            }

                            // Delete the user by ID
                            const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
                            const { error: profileDeleteError } = await supabase
                                .from("users")
                                .delete()
                                .eq("email", email);

                            if (deleteError) {
                                console.error('Error deleting user:', deleteError);
                                alert('Failed. Please try again.');
                                return;
                            }
                            else if (profileDeleteError) {
                                console.error("Error deleting profile:", profileDeleteError);
                                alert("Failed to delete associated data. Please contact support.");
                                return;
                            }
                            navigation.navigate('Register');
                        } catch (err) {
                            console.error('Error during email change:', err);
                            alert('Something went wrong. Please try again.');
                        }
                    }}>
                        <Text style={styles.linkText}>Change email</Text>
                    </TouchableOpacity>
                </SafeAreaView>
            </LinearGradient>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    introduction: {
        alignItems: 'center',
        marginBottom: 30,
    },
    heading: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subHeading: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
    },
    otpInput: {
        width: 200,
        height: 50,
        borderWidth: 1,
        borderColor: '#f8ad9d',
        borderRadius: 10,
        textAlign: 'center',
        fontSize: 20,
        backgroundColor: '#FFD6A5',
    },
    button: {
        marginTop: 20,
        padding: 15,
        backgroundColor: '#F5EDE0',
        borderRadius: 50,
        alignItems: 'center',
        width: '85%',
    },
    buttonText: {
        fontSize: 20,
    },
    errorText: {
        color: 'red',
        marginTop: 10,
    },
    linkText: {
        color: '#3360C1',
        fontSize: 14,
        textAlign: 'center',
        fontFamily: 'Poppins_400Regular',
        marginTop: 15,
    },
});
