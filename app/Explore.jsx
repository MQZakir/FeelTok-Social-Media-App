import { SafeAreaView, View, StyleSheet, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import ContentCard from "./ContentCard";
import { supabase } from "../lib/supabase";

export default function Explore({ navigation }) {
  const [posts, setPosts] = useState([]);

  // Fetch posts with 'Visibility: everyone' from the database
  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from("posts") // Replace with your table name
          .select("*, users(name, username, profileImage)")
          .eq("visibility", "everyone")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching posts:", error);
        } else {
          setPosts(data);
        }
      } catch (err) {
        console.error("Error:", err);
      }
    }

    fetchPosts();
  }, []);

  const filterPostsByEmotion = async (emotion) => {
    const { data, error } = await supabase
      .from("posts")
      .select("*, users(name, username, profileImage)")
      .eq("emotion", emotion)
      .eq("visibility", "everyone")
      .order("created_at", { ascending: false });
    if (error) console.error("Error fetching posts:", error);
    else setPosts(data);
  };

  // Split posts into two columns for the masonry layout
  const columns = useMemo(() => {
    const tempColumns = [[], []];
    let columnHeights = [0, 0]; // Track the cumulative height of each column.

    posts.forEach((item) => {
      const cardHeight = calculateCardHeight(item);
      const shorterColumn = columnHeights[0] <= columnHeights[1] ? 0 : 1;

      tempColumns[shorterColumn].push(item);
      columnHeights[shorterColumn] += cardHeight;
    });

    return tempColumns;
  }, [posts]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.heading}>
        <Text style={styles.exploreText}>Explore Emotions, </Text>
        <Text style={styles.connectText}>Connect Deeper</Text>
      </View>
      <View style={styles.emotionsColumn1}>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('apology')}><Text style={styles.emojiStyle}>😞</Text></TouchableOpacity>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('appreciation')}><Text style={styles.emojiStyle}>🤗</Text></TouchableOpacity>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('gratitude')}><Text style={styles.emojiStyle}>💝</Text></TouchableOpacity>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('love')}><Text style={styles.emojiStyle}>🥰</Text></TouchableOpacity>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('mindfulness')}><Text style={styles.emojiStyle}>🧘</Text></TouchableOpacity>
        <TouchableOpacity style={styles.emoji} onPress={() => filterPostsByEmotion('thankful')}><Text style={styles.emojiStyle}>🤝</Text></TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.masonryContainer}>
          {columns.map((column, index) => (
            <View key={index} style={styles.column}>
              {column.map((item) => {
                // Determine if the file is an image or a video
                const mediaType = item.file.includes("postVideos") ? "video" : "image";

                return (
                  <ContentCard
                    key={item.post_id}
                    userImage={{ uri: item.users?.profileImage }} // Assuming userImage is a URL
                    name={item.users?.name?.split(" ").pop()}
                    userName={item.users?.username}
                    postText={item.content}
                    postImage={item.file ? { uri: item.file } : null} // If postImage is a URL
                    mediaType={mediaType} // Pass the mediaType
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function calculateCardHeight(item) {
  let baseHeight = 150; // Base height for the card
  if (item.postText) baseHeight += 30;
  if (item.postImage) baseHeight += 200;
  return baseHeight;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  masonryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  column: {
    flex: 1, // Equal column widths
    marginHorizontal: 5,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingHorizontal: 17,
  },

  exploreText: {
    paddingTop: 12,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
    paddingLeft: 6,
    color: '#FF6A88'
  },

  connectText: {
    paddingTop: 12,
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
    color: '#FF9A8B'
  },
  emotionsColumn1: {
    marginTop: 10,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: 'center',
    paddingHorizontal: 20

  },

  emoji: {
    flex: 1,
    alignItems: 'center',
    minWidth: 50,
    padding: 5,
    justifyContent: 'center',
    borderRadius: '50%',
    marginHorizontal: 4,

  },
  emojiStyle: {
    alignSelf: 'center',
    fontSize: 35,
  }

});
