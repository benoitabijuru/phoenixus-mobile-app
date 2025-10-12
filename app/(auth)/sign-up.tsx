import { useSignUp } from "@clerk/clerk-expo";
import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { supabase } from "@/lib/supabase";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const [usernameValidation, setUsernameValidation] = useState({
    checking: false,
    isValid: false,
    message: "",
  });

  // Real-time username validation
  useEffect(() => {
    const validateUsername = async () => {
      const username = form.username.trim();

      if (username.length === 0) {
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "",
        });
        return;
      }

      setUsernameValidation({
        checking: true,
        isValid: false,
        message: "",
      });

      // Format validation
      if (username.length < 3) {
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "Username must be at least 3 characters",
        });
        return;
      }

      if (username.length > 30) {
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "Username must be less than 30 characters",
        });
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(username)) {
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "Only letters, numbers, and underscores allowed",
        });
        return;
      }

      if (/^\d/.test(username)) {
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "Username cannot start with a number",
        });
        return;
      }

      // Check availability in Supabase
      try {
        const { data, error } = await supabase
          .from("users")
          .select("username")
          .eq("username", username)
          .single();

        if (error && error.code === "PGRST116") {
          // No user found - username is available
          setUsernameValidation({
            checking: false,
            isValid: true,
            message: "✓ Username is available",
          });
        } else if (data) {
          // User found - username is taken
          setUsernameValidation({
            checking: false,
            isValid: false,
            message: "Username is already taken",
          });
        }
      } catch (err) {
        console.error("Error checking username:", err);
        setUsernameValidation({
          checking: false,
          isValid: false,
          message: "Error checking username",
        });
      }
    };

    const timer = setTimeout(validateUsername, 500);
    return () => clearTimeout(timer);
  }, [form.username]);

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Validation
    if (!form.username.trim()) {
      Alert.alert("Error", "Username is required");
      return;
    }

    if (!usernameValidation.isValid) {
      Alert.alert("Error", "Please choose a valid username");
      return;
    }

    if (!form.firstName.trim()) {
      Alert.alert("Error", "First name is required");
      return;
    }

    if (!form.lastName.trim()) {
      Alert.alert("Error", "Last name is required");
      return;
    }

    if (!form.email.trim()) {
      Alert.alert("Error", "Email is required");
      return;
    }

    if (!form.password.trim()) {
      Alert.alert("Error", "Password is required");
      return;
    }

    try {
      await signUp.create({
        username: form.username,
        firstName: form.firstName,
        lastName: form.lastName,
        emailAddress: form.email,
        password: form.password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });

      if (completeSignUp.status === "complete") {
        // Create user in your backend/Supabase
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            username: form.username,
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });

        await setActive({ session: completeSignUp.createdSessionId });

        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">
            Create Your Account
          </Text>
        </View>

        <View className="p-5">
          {/* Username Field with Real-time Validation */}
          <View className="mb-2">
            <InputField
              label="Username"
              placeholder="Choose a unique username"
              icon={icons.person}
              value={form.username}
              onChangeText={(value) =>
                setForm({ ...form, username: value.toLowerCase().trim() })
              }
              autoCapitalize="none"
              autoCorrect={false}
            />
            {form.username.length > 0 && (
              <Text
                className={`text-sm mt-1 ml-1 ${
                  usernameValidation.checking
                    ? "text-gray-400"
                    : usernameValidation.isValid
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {usernameValidation.checking
                  ? "Checking availability..."
                  : usernameValidation.message}
              </Text>
            )}
          </View>

          {/* First Name */}
          <InputField
            label="First Name"
            placeholder="Enter your first name"
            icon={icons.person}
            value={form.firstName}
            onChangeText={(value) => setForm({ ...form, firstName: value })}
          />

          {/* Last Name */}
          <InputField
            label="Last Name"
            placeholder="Enter your last name"
            icon={icons.person}
            value={form.lastName}
            onChangeText={(value) => setForm({ ...form, lastName: value })}
          />

          {/* Email */}
          <InputField
            label="Email"
            placeholder="Enter your email"
            icon={icons.email}
            textContentType="emailAddress"
            value={form.email}
            onChangeText={(value) =>
              setForm({ ...form, email: value.toLowerCase().trim() })
            }
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password */}
          <InputField
            label="Password"
            placeholder="Enter your password"
            icon={icons.lock}
            secureTextEntry={true}
            textContentType="password"
            value={form.password}
            onChangeText={(value) => setForm({ ...form, password: value })}
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <OAuth />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-10"
          >
            Already have an account?{" "}
            <Text className="text-primary-500">Log In</Text>
          </Link>
        </View>

        {/* Verification Modal */}
        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onBackdropPress={() =>
            setVerification({ ...verification, state: "default" })
          }
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">
              Verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}.
            </Text>
            <InputField
              label={"Code"}
              icon={icons.lock}
              placeholder={"12345"}
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) =>
                setVerification({ ...verification, code })
              }
            />
            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}
            <CustomButton
              title="Verify Email"
              onPress={onPressVerify}
              className="mt-5 bg-success-500"
            />
          </View>
        </ReactNativeModal>

        {/* Success Modal */}
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Welcome, {form.firstName}!
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>
            <CustomButton
              title="Browse Home"
              onPress={() => router.push(`/(root)/(tabs)/home`)}
              className="mt-5"
            />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;