import React, { useState, useContext } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react-native';
import { login } from '../api/auth.api';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        email,
        password
      });

      if (response.data.success) {
        // Get token from the JSON payload and sign in globally
        const token = response.data.data.accessToken;
        signIn(token);
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.log('Login Error:', err);
      console.log('Error Response:', err.response);
      console.log('Error Message:', err.message);
      setError(err.response?.data?.message || err.message || 'An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const KeyboardWrapper = Platform.OS === 'web' ? React.Fragment : TouchableWithoutFeedback;
  const keyboardWrapperProps = Platform.OS === 'web' ? {} : { onPress: Keyboard.dismiss };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <KeyboardWrapper {...keyboardWrapperProps}>
        <View style={styles.innerContainer}>
          
          <View style={styles.glassPanel}>
            <View style={styles.logoSection}>
              <View style={styles.logoIconContainer}>
                <Image 
                  source={require('../../assets/logo.png')} 
                  style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                />
              </View>
              <Text style={styles.loginTitle}>Admin Portal</Text>
              <Text style={styles.loginSubtitle}>Secure access to college resources</Text>
            </View>

            <View style={styles.formContainer}>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail style={styles.inputIcon} size={20} color="#64748b" />
                  <TextInput
                    style={styles.formInput}
                    placeholder="admin@example.com"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock style={styles.inputIcon} size={20} color="#64748b" />
                  <TextInput
                    style={styles.formInput}
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle} 
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#64748b" />
                    ) : (
                      <Eye size={20} color="#64748b" />
                    )}
                  </TouchableOpacity>
                </View>
                {error && (
                  <View style={styles.errorMessageContainer}>
                    <AlertCircle size={16} color="#ef4444" />
                    <Text style={styles.errorText}>{error}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, (isLoading || !email || !password) && styles.submitBtnDisabled]}
                onPress={handleLogin}
                disabled={isLoading || !email || !password}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.submitBtnText}> Authenticating...</Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>Sign In</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardWrapper>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  innerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  glassPanel: { width: '100%', maxWidth: 420, backgroundColor: '#ffffff', borderColor: 'rgba(0, 0, 0, 0.05)', borderWidth: 1, borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 5 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoIconContainer: { width: 56, height: 56, backgroundColor: '#6366f1', borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  loginTitle: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', marginBottom: 8 },
  loginSubtitle: { color: '#64748b', fontSize: 15 },
  formContainer: { width: '100%' },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, paddingHorizontal: 16 },
  inputIcon: { marginRight: 12 },
  formInput: { flex: 1, paddingVertical: 14, color: '#0f172a', fontSize: 16 },
  passwordToggle: { padding: 8 },
  errorMessageContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  errorText: { color: '#ef4444', fontSize: 14, marginLeft: 4 },
  submitBtn: { width: '100%', padding: 16, backgroundColor: '#6366f1', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 16, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitBtnDisabled: { opacity: 0.6, shadowOpacity: 0, elevation: 0 },
  loadingContainer: { flexDirection: 'row', alignItems: 'center' },
  submitBtnText: { color: 'white', fontSize: 16, fontWeight: '600' }
});
