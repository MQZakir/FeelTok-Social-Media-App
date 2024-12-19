import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export default function useUserData() {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUserData = useCallback(async () => {
        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw new Error('Error fetching session.');

            if (session?.user?.email) {
                const email = session.user.email;

                // Fetch user data from the database
                const { data, error } = await supabase
                    .from('users')
                    .select('name, username, profileImage, userid, bio, email')
                    .eq('email', email)
                    .single();

                if (error) throw new Error('Error fetching user data.');

                // Update user data and stop the loading state
                setUserData(data);
            }
        } catch (err) {
            console.error(err.message);
            setError(err.message);
        } finally {
            setLoading(false); // Always set loading to false after fetching
        }
    }, []);

    useEffect(() => {
        fetchUserData(); // Fetch data on initial render
    }, [fetchUserData]);

    return { userData, loading, error };
}
