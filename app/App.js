import React, { useEffect, useState } from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { supabase } from '../lib/supabase';

import Splash from './splash';
import Login from './Login';
import Register from './Register';
import Verification from './Verification';
import Home from './Home';
import SendOtp from './SendOtp';
import Explore from './Explore';
import Profile from './Profile';
import CreateAccount from './CreateAccount';
import Social from './Social';
import CreatePost from './CreatePost';
import Notifications from './Notifications';
import EditProfile from './EditProfile';
import Navbar from './Navbar';

const Stack = createNativeStackNavigator();

export default function App() {
   LogBox.ignoreAllLogs()
   const [isAuthenticated, setIsAuthenticated] = useState(false); // Tracks login status
   const [isReady, setIsReady] = useState(false); // Tracks splash screen readiness
   const [activeIndex, setActiveIndex] = useState(0); // Tracks active tab

   const tabItems = [
      { label: 'Home', icon: 'home-outline' },
      { label: 'CreatePost', icon: 'add-circle-outline' },
      { label: 'Explore', icon: 'search-outline' },
   ];

   useEffect(() => {
      const timer = setTimeout(async () => {
         try {
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
               const { data: userProfile, error } = await supabase
                  .from('users')
                  .select('is_verified, hasCreatedAccount')
                  .eq('email', session.user.email)
                  .single();

               if (error || !userProfile) {
                  alert('Error fetching profile or user profile missing:', error);
                  setIsAuthenticated(false);
               } else if (!userProfile.is_verified || !userProfile.hasCreatedAccount) {
                  setIsAuthenticated(false);
               } else {
                  setIsAuthenticated(true);
               }
            } else {
               setIsAuthenticated(false);
            }
         } catch (err) {
            console.error('Error checking authentication state:', err);
            setIsAuthenticated(false);
         } finally {
            setIsReady(true);  // Mark app as ready to show content
         }

      }, 5000); // Show splash screen for 5 seconds

      // Clean up timer on unmount
      return () => clearTimeout(timer);
   }, []);

   if (!isReady) {
      return <Splash />;  // Show Splash screen while the app is loading
   }

   // Handles tab navigation
   const handleTabPress = (indexOrAction, navigation) => {
      if (typeof indexOrAction === 'string') {
         if (indexOrAction === 'liked') {
            navigation.navigate('Likes'); // Example for liked posts
         } else if (indexOrAction === 'menu') {
            console.log('Menu pressed');
            return;
         }
      } else if (typeof indexOrAction === 'number') {
         const targetScreen = tabItems[indexOrAction]?.label;
         if (targetScreen) {
            setActiveIndex(indexOrAction);
            navigation.reset({
               index: 0, // Reset to the first screen in the stack
               routes: [{ name: targetScreen }],
            });
         }
      }
   };

   // Auth Flow (Login, Register, etc.)
   const AuthNavigator = () => (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
         <Stack.Screen name="Login" component={Login} />
         <Stack.Screen name="Register" component={Register} />
         <Stack.Screen name="SendOtp" component={SendOtp} />
         <Stack.Screen name="Verification" component={Verification} />
         <Stack.Screen name="CreateAccount" component={CreateAccount} />
      </Stack.Navigator>
   );

   // App Flow (with Navbar)
   const AppNavigator = () => (
      <>
         <Stack.Navigator screenOptions={{ headerShown: false, gestureEnabled: false }}>
            <Stack.Screen name="Home" component={Home} />
            <Stack.Screen name="Explore" component={Explore} />
            <Stack.Screen name="CreatePost" component={CreatePost} />
            <Stack.Screen name="Notifications" component={Notifications} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Social" component={Social} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
         </Stack.Navigator>
         <Navbar activeIndex={activeIndex} onTabPress={handleTabPress} />
      </>
   );

   return (
      <NavigationContainer>
         {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
   );
}
