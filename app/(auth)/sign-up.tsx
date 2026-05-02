import "@/global.css";
import { colors } from "@/constants/theme";
import { useSignUp } from "@clerk/expo";
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

function validateConfirm(password: string, confirm: string): string | undefined {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords don't match";
}

function validateCode(v: string): string | undefined {
  if (!v.trim()) return "Verification code is required";
  if (!/^\d{6}$/.test(v.trim())) return "Enter the 6-digit code from your email";
}

// ─── Component ───────────────────────────────────────────────────────────────

type Step = "credentials" | "verify";

export default function SignUpScreen() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const router = useRouter();

  // Step tracking
  const [step, setStep] = useState<Step>("credentials");
  const [verifyEmail, setVerifyEmail] = useState(""); // shown in verify subtitle

  // Credentials step
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Verify step
  const [code, setCode] = useState("");

  // Local validation errors
  const [localErrors, setLocalErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    code?: string;
  }>({});

  const isLoading = fetchStatus === "fetching";

  // Server errors
  const emailError = localErrors.email ?? errors?.fields?.emailAddress?.message;
  const passwordError = localErrors.password ?? errors?.fields?.password?.message;
  const confirmError = localErrors.confirmPassword;
  const codeError = localErrors.code ?? errors?.fields?.code?.message;

  const clearField = (field: keyof typeof localErrors) =>
    setLocalErrors((prev) => ({ ...prev, [field]: undefined }));

  // ── Step 1: Submit credentials ─────────────────────────────────────────────

  const handleRegister = async () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    const cErr = validateConfirm(password, confirmPassword);

    if (eErr || pErr || cErr) {
      setLocalErrors({ email: eErr, password: pErr, confirmPassword: cErr });
      return;
    }
    setLocalErrors({});

    const { error } = await signUp.password({
      emailAddress: email.trim(),
      password,
    });

    if (error) return;

    // Send email verification code
    await signUp.verifications.sendEmailCode();
    setVerifyEmail(email.trim());
    setStep("verify");
  };

  // ── Step 2: Verify email ───────────────────────────────────────────────────

  const handleVerify = async () => {
    const cErr = validateCode(code);
    if (cErr) {
      setLocalErrors({ code: cErr });
      return;
    }
    setLocalErrors({});

    await signUp.verifications.verifyEmailCode({ code: code.trim() });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session }) => {
          if (session?.currentTask) return;
          router.replace("/(tabs)");
        },
      });
    }
  };

  const handleResend = async () => {
    await signUp.verifications.sendEmailCode();
  };

  // ─────────────────────────────────────────────────────────────────────────

  if (step === "verify") {
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
              {/* Brand */}
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

                <Text className="auth-title">Check your inbox</Text>
                <Text className="auth-subtitle">
                  We sent a 6-digit code to{"\n"}
                  <Text style={{ color: colors.accent }}>{verifyEmail}</Text>
                </Text>
              </View>

              {/* Card */}
              <View className="auth-card">
                <View className="auth-form">
                  {/* Code field */}
                  <View className="auth-field">
                    <Text className="auth-label">Verification code</Text>
                    <TextInput
                      className={clsx(
                        "auth-input",
                        codeError && "auth-input-error"
                      )}
                      value={code}
                      onChangeText={(v) => {
                        setCode(v);
                        clearField("code");
                      }}
                      placeholder="Enter 6-digit code"
                      placeholderTextColor={colors.mutedForeground}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerify}
                      textContentType="oneTimeCode"
                      autoComplete="one-time-code"
                    />
                    {codeError ? (
                      <Text className="auth-error">{codeError}</Text>
                    ) : null}
                  </View>

                  {/* Verify */}
                  <Pressable
                    className={clsx(
                      "auth-button",
                      (!code || isLoading) && "auth-button-disabled"
                    )}
                    onPress={handleVerify}
                    disabled={!code || isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator size="small" color={colors.background} />
                    ) : (
                      <Text className="auth-button-text">Verify email</Text>
                    )}
                  </Pressable>

                  {/* Resend */}
                  <Pressable
                    className="auth-secondary-button"
                    onPress={handleResend}
                    disabled={isLoading}
                  >
                    <Text className="auth-secondary-button-text">
                      Resend code
                    </Text>
                  </Pressable>
                </View>

                <View className="auth-link-row">
                  <Pressable onPress={() => setStep("credentials")}>
                    <Text className="auth-link">← Back to sign up</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </StyledSafeAreaView>
    );
  }

  // ── Step 1 UI ─────────────────────────────────────────────────────────────

  const canSubmit =
    !!email && !!password && !!confirmPassword && !isLoading;

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
            {/* Brand */}
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

              <Text className="auth-title">Create your account</Text>
              <Text className="auth-subtitle">
                Start tracking your subscriptions in minutes
              </Text>
            </View>

            {/* Card */}
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
                      clearField("email");
                    }}
                    placeholder="Enter your email"
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    textContentType="emailAddress"
                    returnKeyType="next"
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
                        clearField("password");
                      }}
                      placeholder="Create a password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="next"
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
                  {!passwordError ? (
                    <Text className="auth-helper">At least 8 characters</Text>
                  ) : null}
                </View>

                {/* Confirm password */}
                <View className="auth-field">
                  <Text className="auth-label">Confirm password</Text>
                  <View
                    className={clsx(
                      "auth-input flex-row items-center gap-2",
                      confirmError && "auth-input-error"
                    )}
                  >
                    <TextInput
                      style={{ flex: 1, fontSize: 16, color: colors.foreground }}
                      value={confirmPassword}
                      onChangeText={(v) => {
                        setConfirmPassword(v);
                        clearField("confirmPassword");
                      }}
                      placeholder="Re-enter your password"
                      placeholderTextColor={colors.mutedForeground}
                      secureTextEntry={!showConfirm}
                      autoComplete="new-password"
                      textContentType="newPassword"
                      returnKeyType="done"
                      onSubmitEditing={handleRegister}
                    />
                    <Pressable
                      onPress={() => setShowConfirm((v) => !v)}
                      hitSlop={8}
                    >
                      <Ionicons
                        name={showConfirm ? "eye-off-outline" : "eye-outline"}
                        size={20}
                        color={colors.mutedForeground}
                      />
                    </Pressable>
                  </View>
                  {confirmError ? (
                    <Text className="auth-error">{confirmError}</Text>
                  ) : null}
                </View>

                {/* Submit */}
                <Pressable
                  className={clsx(
                    "auth-button",
                    !canSubmit && "auth-button-disabled"
                  )}
                  onPress={handleRegister}
                  disabled={!canSubmit}
                >
                  {isLoading ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="auth-button-text">Create account</Text>
                  )}
                </Pressable>
              </View>

              {/* Footer */}
              <View className="auth-link-row">
                <Text className="auth-link-copy">Already have an account?</Text>
                <Link href="/(auth)/sign-in" asChild>
                  <Pressable>
                    <Text className="auth-link">Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            {/* Clerk captcha — required for bot protection */}
            <View nativeID="clerk-captcha" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </StyledSafeAreaView>
  );
}