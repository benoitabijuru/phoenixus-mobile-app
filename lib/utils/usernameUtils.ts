// utils/usernameUtils.ts

import { supabase } from "../supabase";

export interface UsernameValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Validates username format
 */
export function validateUsername(username: string): UsernameValidation {
  // Check length
  if (username.length < 3) {
    return {
      isValid: false,
      error: 'Username must be at least 3 characters long',
    };
  }

  if (username.length > 30) {
    return {
      isValid: false,
      error: 'Username must be no more than 30 characters long',
    };
  }

  // Check format (alphanumeric and underscore only)
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain letters, numbers, and underscores',
    };
  }

  // Check if starts with a number
  if (/^\d/.test(username)) {
    return {
      isValid: false,
      error: 'Username cannot start with a number',
    };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    'admin',
    'administrator',
    'root',
    'system',
    'support',
    'help',
    'api',
    'null',
    'undefined',
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return {
      isValid: false,
      error: 'This username is reserved',
    };
  }

  return { isValid: true };
}

/**
 * Checks if username is available in Supabase
 */
export async function isUsernameAvailable(
  username: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    // If no data found, username is available
    if (error && error.code === 'PGRST116') {
      return true;
    }

    // If data exists, username is taken
    return !data;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

/**
 * Suggests alternative usernames if the desired one is taken
 */
export function suggestAlternativeUsernames(
  baseUsername: string,
  count: number = 3
): string[] {
  const suggestions: string[] = [];
  const random = () => Math.floor(Math.random() * 999);

  for (let i = 0; i < count; i++) {
    suggestions.push(`${baseUsername}${random()}`);
  }

  return suggestions;
}

/**
 * Generates a random username
 */
export function generateRandomUsername(): string {
  const adjectives = [
    'happy',
    'cool',
    'smart',
    'quick',
    'bright',
    'swift',
    'bold',
    'wise',
  ];
  const nouns = [
    'panda',
    'eagle',
    'tiger',
    'wolf',
    'fox',
    'bear',
    'lion',
    'hawk',
  ];

  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 999);

  return `${randomAdjective}_${randomNoun}${randomNum}`;
}