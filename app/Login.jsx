import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from "react-native";
import { Keyboard, TouchableWithoutFeedback } from 'react-native';
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { googleLogin, twitterLogin, facebookLogin } from './Auth'


export default function Login() {

  const navigation = useNavigation();

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let errors = {};

    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    setErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      console.log("Submitted", email, password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Error signing in:', error);
        alert("Failed to sign in. Please check your email or password.");
      } else {
        console.log("Signed in:", data);

        // Properly await the session
        const currentSession = await supabase.auth.getSession();
        console.log("Session after login:", JSON.stringify(currentSession, null, 2));

        // Navigate to Home if the session is valid
        if (currentSession.data?.session) {
          navigation.navigate("Home");
        } else {
          alert("Failed to retrieve session.");
        }
      }


      setEmail("");
      setPassword("");
      setErrors({});
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
              <Text style={styles.subHeading1}>Welcome to Feeltok</Text>
              <Text style={styles.subHeading2}>We hope you have a fantastic day!</Text>
            </View>

            <View style={styles.boxShadow}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.boxShadow}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Password"
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity style={[styles.button, styles.boxShadow]} onPress={handleSubmit}>
              <Text style={styles.login}>Log in</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>Do not have an account?</Text>
            </TouchableOpacity>

            <Text style={styles.optionsText}>Other Log-in Options</Text>

            <View style={styles.iconContainer}>
              <TouchableOpacity onPress={facebookLogin}>
                <Image source={require('../assets/facebook.png')} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={googleLogin}>
                <Image source={require('../assets/google.png')} style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={twitterLogin}>
                <Image source={require('../assets/twitter.png')} style={styles.icon} />
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
    alignItems: 'center',
    justifyContent: 'center'
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
    fontWeight: "bold",
    fontFamily: "Poppins_700Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subHeading1: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
  },
  subHeading2: {
    fontSize: 16,
    fontFamily: "Poppins_400Regular",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: 350,
    borderRadius: 50,
    padding: 15,
    paddingHorizontal: 20,
    fontSize: 18,
    fontFamily: 'Poppins_400Regular',
    backgroundColor: '#ffdab9',
    marginBottom: 10,
    shadowColor: "#333333",
    shadowOffset: { width: 6, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  linkText: {
    color: "#3360C1",
    fontSize: 14,
    textAlign: "center",
    fontFamily: 'Poppins_400Regular',
    marginVertical: 5,
  },
  button: {
    width: 300,
    borderRadius: 50,
    padding: 13,
    backgroundColor: '#F5EDE0',
    alignItems: 'center',
    marginVertical: 10,
  },
  login: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
    color: '#333',
  },
  optionsText: {
    alignItems: 'center',
    textAlign: "center",
    fontSize: 14,
    marginVertical: 14,
    marginTop: 30,
    fontWeight: '600',
    width: '100%',
    height: 20,
    fontFamily: 'Poppins_400Regular',
  },
  iconContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  icon: {
    width: 60,
    height: 60,
    marginHorizontal: 10,
  },
  errorText: {
    color: 'red',
    textAlign: 'left',
    paddingLeft: 10,
    marginBottom: 5,
  },
});
