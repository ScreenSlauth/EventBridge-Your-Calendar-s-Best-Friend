import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Mail, Lock, User, ArrowLeft, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone' | 'google'>('email');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const countryCodes = [
    { code: '+1', country: 'US/CA', flag: '🇺🇸' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+86', country: 'China', flag: '🇨🇳' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+55', country: 'Brazil', flag: '🇧🇷' },
    { code: '+7', country: 'Russia', flag: '🇷🇺' },
    { code: '+82', country: 'S. Korea', flag: '🇰🇷' },
    { code: '+52', country: 'Mexico', flag: '🇲🇽' },
    { code: '+27', country: 'S. Africa', flag: '🇿🇦' }
  ];

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/calendar');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've been successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/calendar`,
            data: {
              full_name: fullName,
            }
          }
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({
          phone: fullPhoneNumber,
          options: {
            data: !isLogin ? { full_name: fullName } : undefined
          }
        });
        if (error) throw error;
        setOtpSent(true);
        toast({
          title: "OTP Sent!",
          description: "Please check your phone for the verification code.",
        });
      } else {
        const { error } = await supabase.auth.verifyOtp({
          phone: fullPhoneNumber,
          token: otp,
          type: 'sms'
        });
        if (error) throw error;
        toast({
          title: "Welcome!",
          description: "You've been successfully authenticated.",
        });
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/calendar`,
        }
      });
      if (error) throw error;
    } catch (error: any) {
      setError(error.message);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: error.message,
      });
      setLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setOtpSent(false);
    setOtp('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md space-y-6">
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white text-sm sm:text-base min-h-[44px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-black dark:bg-white rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white dark:text-black" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
              EventBridge
            </h1>
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-2">
            {isLogin ? 'Sign in to your account' : 'Get started with EventBridge'}
          </p>
        </div>

        <Card className="p-6 sm:p-8 shadow-2xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
          {/* Auth Method Selector - Mobile Optimized */}
          <div className="mb-6 sm:mb-8">
            <h3 className="text-base sm:text-lg font-semibold text-black dark:text-white mb-4 text-center px-2">
              Choose your sign-in method
            </h3>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('email');
                  resetPhoneAuth();
                }}
                className={`w-full py-4 px-6 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-3 min-h-[52px] ${
                  authMethod === 'email'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Mail className="h-5 w-5 flex-shrink-0" />
                <span>Continue with Email</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('phone');
                  setError(null);
                }}
                className={`w-full py-4 px-6 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-3 min-h-[52px] ${
                  authMethod === 'phone'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <Phone className="h-5 w-5 flex-shrink-0" />
                <span>Continue with Phone</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setAuthMethod('google');
                  setError(null);
                  resetPhoneAuth();
                }}
                className={`w-full py-4 px-6 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-3 min-h-[52px] ${
                  authMethod === 'google'
                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          </div>

          {/* Auth Forms - Mobile Optimized */}
          {authMethod === 'google' ? (
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 px-2 leading-relaxed">
                You'll be redirected to Google to complete your {isLogin ? 'sign in' : 'account creation'}
              </p>
              <Button
                onClick={handleGoogleAuth}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-4 text-base min-h-[52px] font-medium"
                disabled={loading}
              >
                {loading ? 'Redirecting...' : `${isLogin ? 'Sign in' : 'Sign up'} with Google`}
              </Button>
            </div>
          ) : authMethod === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="fullName" className="text-sm font-medium text-black dark:text-white">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="mt-2 h-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-black dark:text-white">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 h-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-sm font-medium text-black dark:text-white">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 h-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 py-4 text-base min-h-[52px] font-medium"
                disabled={loading}
              >
                {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePhoneAuth} className="space-y-5">
              {!isLogin && !otpSent && (
                <div>
                  <Label htmlFor="phoneFullName" className="text-sm font-medium text-black dark:text-white">Full Name</Label>
                  <Input
                    id="phoneFullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLogin}
                    className="mt-2 h-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-black dark:text-white">Phone Number</Label>
                <div className="mt-2 flex space-x-2">
                  <Select value={countryCode} onValueChange={setCountryCode} disabled={otpSent}>
                    <SelectTrigger className="w-24 h-12 border-gray-200 dark:border-gray-700 bg-white dark:bg-black">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code} className="text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900">
                          <div className="flex items-center space-x-2">
                            <span>{country.flag}</span>
                            <span>{country.code}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="1234567890"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    disabled={otpSent}
                    className="flex-1 h-12 text-base border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Complete phone number: {countryCode}{phoneNumber}
                </p>
              </div>

              {otpSent && (
                <div>
                  <Label htmlFor="otp" className="text-sm font-medium text-black dark:text-white">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    className="mt-2 h-12 text-base text-center tracking-widest border-gray-200 dark:border-gray-700 bg-white dark:bg-black text-black dark:text-white"
                  />
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 py-4 text-base min-h-[52px] font-medium"
                disabled={loading}
              >
                {loading ? (otpSent ? 'Verifying...' : 'Sending code...') : (otpSent ? 'Verify Code' : 'Send Verification Code')}
              </Button>

              {otpSent && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetPhoneAuth}
                  className="w-full text-sm py-3 min-h-[44px] text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
                >
                  Use different phone number
                </Button>
              )}
            </form>
          )}

          {error && (
            <Alert className="mt-5 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
              <AlertDescription className="text-sm leading-relaxed text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetPhoneAuth();
                setError(null);
              }}
              className="text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white font-medium text-sm py-3 px-4 min-h-[44px] rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
