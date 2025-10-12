// app/(tabs)/profile.tsx
import { useAuth, useUser } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';

interface UserProfile {
  clerk_user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string | null;
  created_at: string;
}

export default function ProfileScreen() {
  const { getToken, signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await getToken({ template: 'supabase' });
      
      if (!token) {
        console.error('No token available');
        return;
      }

      // // Set authorization header with Clerk token
      supabase.rest.headers['Authorization'] = `Bearer ${token}`;

      // Fetch user profile - RLS ensures user can only see their own data
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('clerk_user_id', user?.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        Alert.alert('Error', 'Failed to load profile');
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (error) {
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        {profile?.image_url && (
          <Image
            source={{ uri: profile.image_url }}
            style={styles.avatar}
          />
        )}
        
        <Text style={styles.name}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        
        <Text style={styles.email}>{profile?.email}</Text>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Clerk User ID:</Text>
          <Text style={styles.value}>{profile?.clerk_user_id}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.label}>Member Since:</Text>
          <Text style={styles.value}>
            {profile?.created_at 
              ? new Date(profile.created_at).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={fetchProfile}>
          <Text style={styles.refreshButtonText}>Refresh Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoSection: {
    width: '100%',
    marginBottom: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 12,
    color: '#999',
    marginBottom: 5,
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});