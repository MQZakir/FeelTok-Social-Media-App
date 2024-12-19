import { supabase } from '../lib/supabase';
import { Linking } from 'react-native';


export const googleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: 'https://ocpaajtwinmomqtarhyk.supabase.co/auth/v1/callback'
        }
    });
    console.log("Function called")

    if (error) {
        console.log('Google Sign-In Error: ', error)
    } else {
        console.log('Google Sign-In Data: ', data)
    }

    if (data?.url) {
        Linking.openURL(data.url);
    }
};

export const twitterLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
            redirectTo: 'https://ocpaajtwinmomqtarhyk.supabase.co/auth/v1/callback',
        }
    });
    console.log("Function called")

    if (error) {
        console.log('Apple Sign-In Error: ', error)
    } else {
        console.log('Apple Sign-In Data: ', data)
    }

    if (data?.url) {
        Linking.openURL(data.url);
    }
};

export const facebookLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
            redirectTo: 'https://ocpaajtwinmomqtarhyk.supabase.co/auth/v1/callback',
            scopes: 'email',
        }
    });
    console.log("Function called")
    if (error) {
        console.log('Facebook Sign-In Error: ', error)
    } else {
        console.log('Facebook Sign-In Data: ', data)
    }

    if (data?.url) {
        Linking.openURL(data.url);
    }
};
