// app/reset-password.tsx
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { ApiErrorResponse } from '../services/api';

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 45;

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ email?: string }>();
  const displayEmail = Array.isArray(params.email) ? params.email[0] : params.email || '';
  const { requestOtp, verifyPasswordReset } = useAuth();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const formatTime = (seconds: number) => {
    const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
    const ss = String(seconds % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    setErrorMsg(null);
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    if (digit && index === OTP_LENGTH - 1 && newOtp.every((d) => d !== '')) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || !displayEmail) return;
    setErrorMsg(null);
    try {
      await requestOtp(displayEmail);
      setOtp(Array(OTP_LENGTH).fill(''));
      setCountdown(COUNTDOWN_SECONDS);
      setCanResend(false);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      const apiErr = err as ApiErrorResponse;
      setErrorMsg(apiErr.formattedMessage || 'Gagal mengirim ulang kode OTP.');
    }
  };

  const validate = (): boolean => {
    if (otp.join('').length < OTP_LENGTH) {
      setErrorMsg('Masukkan kode OTP 6 digit.');
      return false;
    }
    if (password.length < 8) {
      setErrorMsg('Password baru minimal 8 karakter.');
      return false;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!displayEmail) {
      setErrorMsg('Email tidak ditemukan. Kembali ke halaman login dan coba lagi.');
      return;
    }
    if (!validate()) return;

    setLoading(true);
    setErrorMsg(null);
    try {
      await verifyPasswordReset({
        email: displayEmail,
        code: otp.join(''),
        newPassword: password,
      });
      setLoading(false);
      Alert.alert(
        'Password Berhasil Diubah',
        'Silakan login kembali dengan password baru Anda.',
        [{ text: 'OK', onPress: () => router.replace('/login') }]
      );
    } catch (err: any) {
      setLoading(false);
      const apiErr = err as ApiErrorResponse;
      setErrorMsg(apiErr.formattedMessage || 'Kode OTP tidak valid atau telah kedaluwarsa.');
    }
  };

  const isComplete = otp.every((d) => d !== '') && password.length >= 8 && password === confirmPassword;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backButton}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="arrow-back" size={22} color={Colors.textMain} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Moklet Event Center</Text>
              <View style={styles.headerSpacer} />
            </View>

            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Masukkan kode OTP yang dikirim ke email{'\n'}
                <Text style={styles.emailHighlight}>{displayEmail || 'email Anda'}</Text>
              </Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              {/* OTP Card */}
              <View style={styles.card}>
                <View style={styles.otpRow}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => { inputRefs.current[index] = ref; }}
                      style={[
                        styles.otpBox,
                        digit ? styles.otpBoxFilled : null,
                        errorMsg ? styles.otpBoxError : null,
                      ]}
                      value={digit}
                      onChangeText={(v) => handleOtpChange(v, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      textAlign="center"
                      selectTextOnFocus
                      autoFocus={index === 0}
                    />
                  ))}
                </View>

                <View style={styles.resendContainer}>
                  {!canResend ? (
                    <Text style={styles.countdownText}>
                      Kirim ulang dalam <Text style={styles.countdownBold}>{formatTime(countdown)}</Text>
                    </Text>
                  ) : (
                    <Text style={styles.countdownText}>Kode sudah kedaluwarsa</Text>
                  )}
                  <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                    <Text style={[styles.resendLink, canResend ? styles.resendLinkActive : styles.resendLinkDisabled]}>
                      Kirim Ulang OTP
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Password Baru */}
              <View style={styles.card}>
                <Text style={styles.fieldLabel}>Password Baru</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Minimal 8 karakter"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setErrorMsg(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((s) => !s)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={Colors.textSubtitle}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.fieldLabel, { marginTop: Spacing.md }]}>Konfirmasi Password</Text>
                <View style={styles.passwordInputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Ulangi password baru"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={confirmPassword}
                    onChangeText={(v) => {
                      setConfirmPassword(v);
                      setErrorMsg(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Sticky Bottom Button */}
            <View style={styles.bottomBar}>
              <TouchableOpacity
                style={[styles.submitButton, (!isComplete || loading) && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={!isComplete || loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Simpan Password Baru</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
    backgroundColor: Colors.white,
  },
  backButton: {
    padding: 4,
    width: 32,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  headerSpacer: {
    width: 32,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textMain,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: 14,
    color: Colors.textSubtitle,
    lineHeight: 22,
  },
  emailHighlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.md,
    backgroundColor: '#FFEBEE',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    flex: 1,
    color: Colors.error,
    fontSize: 13,
  },
  card: {
    marginTop: Spacing.lg,
    backgroundColor: Colors.background,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.divider,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  otpBox: {
    flex: 1,
    aspectRatio: 0.85,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.divider,
    backgroundColor: Colors.white,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textMain,
  },
  otpBoxFilled: {
    borderColor: Colors.primary,
  },
  otpBoxError: {
    borderColor: Colors.error,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  countdownText: {
    fontSize: 12,
    color: Colors.textSubtitle,
  },
  countdownBold: {
    fontWeight: '700',
    color: Colors.textMain,
  },
  resendLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  resendLinkActive: {
    color: Colors.primary,
  },
  resendLinkDisabled: {
    color: Colors.textPlaceholder,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textMain,
    marginBottom: Spacing.xs,
  },
  passwordInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.divider,
    borderRadius: Radius.md,
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    fontSize: 15,
    color: Colors.textMain,
  },
  bottomBar: {
    padding: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
