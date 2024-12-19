import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Image, TouchableOpacity } from "react-native";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { supabase } from "../lib/supabase";
import { fetchPosts } from "../services/postService";
import { Video } from 'expo-av'

export default function ContentCard({ userImage, name, userName, postText, postImage, mediaType }) {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.userInfo}>
        <Image source={userImage} style={styles.userImage} />
        <View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </TouchableOpacity>

      {postText && <Text style={styles.postText}>{postText}</Text>}

      {postImage && (
        <View style={styles.imageWrapper}>
          {
            mediaType == 'video' ? (
              <Video style={styles.postImage} source={postImage} useNativeControls resizeMode='cover' isLooping />
            ) : (
              <Image source={postImage} resizeMode='cover' style={styles.postImage} />
            )
          }
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    borderRadius: 15,
    padding: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  userImage: {
    borderRadius: 50,
    width: 50,
    height: 50,
    marginRight: 10,
  },
  name: {
    fontFamily: "Poppins_700Bold",
    fontSize: 14,
  },
  userName: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
    color: "#777",
  },
  postText: {
    fontSize: 14,
    marginVertical: 8,
  },
  imageWrapper: {
    width: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  postImage: {
    width: "100%",
    height: 200,
  },
});
