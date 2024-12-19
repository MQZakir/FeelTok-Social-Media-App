import React, { useCallback, useState, useEffect } from "react";
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { supabase } from '../lib/supabase';



export default function Register() {

  const navigation = useNavigation();

  const [fontsLoaded] = Font.useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [phoneNumber, setPhoneNumber] = useState("");


  if (!fontsLoaded) {
    return null;
  }

  const validateForm = () => {
    let errors = {};

    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";
    if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Invalid email format";
    if (password.length < 8) errors.password = "Password must be at least 8 characters";

    console.log("Phone: ", phoneNumber);
    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // When 'Register'
  const handleSubmit = async () => {
    if (validateForm()) {


      try {
        // Accessing usernames from database for uniqueness
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (existingUser) {
          alert("Username already taken. Please choose another one.");
          setErrors({ username: 'Username already taken' });
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email: email,
          password: password
        });

        if (error) {
          console.log('Error enabling 2FA:', error.message);
          alert('Error sending email: ', error.message);
          return;
        }

        console.log('2FA enabled!', data);

        const { session } = supabase.auth;
        console.log(session)

        const { } = await supabase.from('users').insert([
          {
            email: email,
          },
        ]);

        // Continue to Verification screen
        navigation.navigate("SendOtp", { email: email, password: password });

        // setFullName("");
        // setUsername("");
        // setEmail("");
        // setPassword("");
        // setPhoneNumber("");
        // setErrors({});
      }
      catch (error) {
        console.error('Error creating user:', error);
        setErrors({ general: error.message });
      }
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={["#FF9A8B", "#FF6A88", "#FFC1C1", "#FFD6A5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.contentWrapper}>
            <View style={styles.introduction}>
              <Text style={styles.heading}>Hey There!</Text>
              <Text style={styles.subHeading}>Register now and become</Text>
              <Text style={styles.subHeading}>a member of the FeelTok family</Text>
            </View>

            {/** Input Fields */}
            {['Email', 'Password'].map((placeholder, index) => (
              <View style={[styles.boxShadow, styles.inputContainer]} key={index}>
                <TextInput
                  style={styles.textInput}
                  value={

                    placeholder === 'Email' ? email :
                      password
                  }
                  onChangeText={
                    placeholder === 'Email' ? setEmail :
                      setPassword
                  }
                  placeholder={placeholder}
                  secureTextEntry={placeholder === 'Password'}
                />
                {errors[placeholder.toLowerCase()] && <Text style={styles.errorText}>{errors[placeholder.toLowerCase()]}</Text>}
              </View>
            ))}

            <Text style={styles.conditionsText}>
              By registering, you agree to FeelTok's{' '}
              <Text style={styles.boldText}>Terms and Conditions</Text> and{' '}
              <Text style={styles.boldText}>Privacy Policy</Text>.
            </Text>

            <TouchableOpacity style={[styles.button, styles.boxShadow]} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <View style={styles.loginPrompt}>
              <Text>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.loginText}>Log in now</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  contentWrapper: {
    width: '85%',
    alignItems: 'center',
  },
  introduction: {
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: "Poppins_700Bold",
  },
  subHeading: {
    fontSize: 16,
    textAlign: 'center',
    fontFamily: "Poppins_400Regular",
  },
  inputContainer: {
    marginVertical: 8,
    width: '85%',
    alignItems: 'center',
  },
  textInput: {
    width: 350,
    borderRadius: 50,
    padding: 15,
    fontSize: 18,
    backgroundColor: '#ffdab9',
    paddingHorizontal: 20,
    fontFamily: 'Poppins_400Regular',
    shadowColor: "#333333",
    shadowOffset: { width: 6, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  button: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F5EDE0',
    borderRadius: 50,
    alignItems: 'center',
    width: 300,
  },
  buttonText: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
  },
  conditionsText: {
    textAlign: 'center',
    marginVertical: 15,
    paddingHorizontal: 25,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  boldText: {
    fontFamily: 'Poppins_500Medium',
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginText: {
    color: '#3360C1',
    fontFamily: 'Poppins_500Medium',
    marginTop: -2
  },
  errorText: {
    color: 'red',
    paddingTop: 5,
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  icon: {
    position: 'absolute',
    right: 20,
    top: 10,
  },
  dropdownIcon: {
    marginTop: 10,
  }
});
