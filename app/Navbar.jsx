import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons'; // Or any icon library you prefer
import { useNavigation } from '@react-navigation/native';
import Menu from './Menu';

const Navbar = ({ activeIndex, onTabPress }) => {
    const navigation = useNavigation()
    const tabItems = [
        { label: 'Home', icon: 'home' },
        { label: 'CreatePost', icon: 'add-circle' },
        { label: 'Search', icon: 'search' },
    ];

    const [menuVisible, setMenuVisible] = useState(false);

    const handleMenuPress = () => {
        setMenuVisible(true);
    };

    return (
        <View style={styles.navContainer}>
            {/* Left Nav Item - Liked Posts */}
            <TouchableOpacity
                style={styles.sideNavItemRight}
                onPress={() => navigation.navigate('Notifications')}
            >
                <View style={styles.sideNavCircle}>
                    <Icon name="heart-outline" size={20} color="#FFFFFF" />
                </View>
            </TouchableOpacity>

            {/* Center Nav Items */}
            <View style={styles.centerNavContainer}>
                {tabItems.map((tab, index) => (
                    <TouchableOpacity
                        key={index}
                        onPress={() => onTabPress(index, navigation)}
                        style={[
                            styles.navItem,
                            index === activeIndex ? styles.activeNavItem : null,
                        ]}
                    >
                        <Icon
                            name={index === activeIndex ? tab.icon : tab.icon + '-outline'}
                            size={20}
                            color={index === activeIndex ? '#FF6A88' : '#FFFFFF'}
                        />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Right Nav Item - Menu */}
            <TouchableOpacity
                style={styles.sideNavItemLeft}
                onPress={handleMenuPress}
            >
                <View style={styles.sideNavCircle}>
                    <Icon name="menu-outline" size={20} color="#FFFFFF" />
                </View>
            </TouchableOpacity>
            <Menu visible={menuVisible} onClose={() => setMenuVisible(false)} />
        </View>
    );
};

const styles = StyleSheet.create({
    navContainer: {
        position: 'absolute',
        bottom: 25,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 10, // Shadow for Android
    },
    sideNavItemRight: {
        position: 'absolute', // Position the side items higher than the center bar
        left: 0,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        zIndex: 2, // Ensure these items appear above the center bar
    },
    sideNavItemLeft: {
        position: 'absolute', // Position the side items higher than the center bar
        right: 0,
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000',
        zIndex: 2, // Ensure these items appear above the center bar
    },
    sideNavCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#000', // Background color for the side items
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerNavContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: '#000', // Black background for the center nav
        borderRadius: 50,
        width: '65%', // Smaller width for the center nav
        paddingVertical: 5
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
    },
});

export default Navbar;
