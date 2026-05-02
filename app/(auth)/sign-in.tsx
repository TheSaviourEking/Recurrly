import "@/global.css";
import { colors } from "@/constants/theme";
import { useSignIn } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import clsx from "clsx";
import { Link, useRouter } from "expo-router";
import { styled } from "nativewind";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const StyledSafeAreaView = styled(SafeAreaView);

// ─── Validation ──────────────────────────────────────────────────────────────

function validateEmail(v: string): string | undefined {
  if (!v.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))
    return "Enter a valid email address";
}

function validatePassword(v: string): string | undefined {
  if (!v) return "Password is required";
  if (v.length < 8) return "Must be at least 8 characters";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const isLoading = fetchStatus === "fetching";

  // Merge client-side + server-side errors (client-side shown first)
  const emailError =
    localErrors.email ?? errors?.fields?.identifier?.message;
  const passwordError =
    localErrors.password ?? errors?.fields?.password?.message;

  const canSubmit = !!email && !!password && !isLoading;

  const clearFieldError = (field: "email" | "password") =>
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);

    if (eErr || pErr) {
      setLocalErrors({ email: eErr, password: pErr });
      return;
    }
    setLocalErrors({});

    const { error } = await signIn.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) return;

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)");
        },
      });
    }
  };

  return (
    <StyledSafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="auth-scroll"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-content">
            {/* ── Brand ─────────────────────────────────────────── */}
            <View className="auth-brand-block">
              <View className="auth-logo-wrap">
                <View className="auth-logo-mark">
                  <Text className="auth-logo-mark-text">R</Text>
                </View>
                <View>
                  <Text className="auth-wordmark">Recurly</Text>
                  <Text className="auth-wordmark-sub">Smart Billing</Text>
                </View>
              </View>

              <Text className="auth-title">Welcome back</Text>
              <Text className="auth-subtitle">
                Sign in to continue managing your subscriptions
              </Text>
            </View>

            {/* ── Form card ─────────────────────────────────────── */}
            <View className="auth-card">
              <View className="auth-form">
                {/* Email */}
                <View className="auth-field">
                  <Text className="auth-label">Email</Text>
                  <TextInput
                    className={clsx(
                      "auth-input",
                      emailError && "auth-input-error"
                    )}
                    value={email}
                    onChangeText={(v) => {
                      setEmail(v);
                      clearFieldError("email");
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    textContentType="emailAddress"
                  />
                  {emailError ? (
                    <Text className="auth-error">{emailError}</Text>
                  ) : null}
                </View>

                {/* Password */}
                <View className="auth-field">
                  <Text className="auth-label">Password</Text>
                  <View
                    className={clsx(
                      "auth-input flex-row items-center gap-2",
                      passwordError && "auth-input-error"
                    )}
                  >
                    <TextInput
                      style={{ flex: 1, fontSize: 16, color: colors.foreground }}
                      value={password}
                      onChangeText={(v) => {
                        setPassword(v);
                        clearFieldError("password");
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      autoComplete="current-password"
                      textContentType="password"
                      returnKeyType="done"
                      onSubmitEditing={handleSubmit}
                    />
                    <Pressable
                      onPress={() => setShowPassword((v) => !v)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showPassword ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                  {passwordError ? (
                    <Text className="auth-error">{passwordError}</Text>
                  ) : null}
                </View>

                {/* Submit */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled"
                  )}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.background}
                    />
                  ) : (
                    <Text className="auth-button-text">Sign in</Text>
                  )}
                </Pressable>
              </View>

              {/* Footer link */}
              <View className="auth-link-row">
                <Text className="auth-link-copy">New to Recurly?</Text>
                <Link href="/(auth)/sign-up" asChild>
                  <Pressable>
                    <Text className="auth-link">Create an account</Text>
                  </Pressable>
                </Link>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}