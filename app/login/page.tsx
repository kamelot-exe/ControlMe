"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConnectionError } from "@/components/errors/ConnectionError";
import { useLogin } from "@/hooks/use-auth";
import { isConnectionError } from "@/hooks/use-api-error";
import { useAppUi } from "@/components/ui";
import { translate } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const { language } = useAppUi();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login.mutateAsync({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : translate(language, {
        FR: "Connexion impossible",
        RU: "Не удалось войти",
        UK: "Не вдалося увійти",
        GE: "Anmeldung fehlgeschlagen",
        ES: "No se pudo iniciar sesión",
        PT: "Falha ao entrar",
        IT: "Accesso non riuscito",
        PL: "Nie udało się zalogować",
        TR: "Giriş başarısız",
        UZ: "Kirish amalga oshmadi",
      }, "Failed to login"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 md:p-16 lg:p-24">
      <div className="mx-auto max-w-md w-full animate-scale-in">
        <Card className="glass-hover">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-semibold tracking-tight">
              {translate(language, { FR: "Bon retour", RU: "С возвращением", UK: "З поверненням", GE: "Willkommen zurück", ES: "Bienvenido de nuevo", PT: "Bem-vindo de volta", IT: "Bentornato", PL: "Witamy ponownie", TR: "Tekrar hoş geldiniz", UZ: "Qaytganingiz bilan" }, "Welcome Back")}
            </CardTitle>
            <CardDescription className="text-base">
              {translate(language, { FR: "Connectez-vous à votre compte ControlMe", RU: "Войдите в аккаунт ControlMe", UK: "Увійдіть до акаунта ControlMe", GE: "Melden Sie sich bei Ihrem ControlMe-Konto an", ES: "Inicia sesión en tu cuenta ControlMe", PT: "Entre na sua conta ControlMe", IT: "Accedi al tuo account ControlMe", PL: "Zaloguj się do swojego konta ControlMe", TR: "ControlMe hesabınıza giriş yapın", UZ: "ControlMe hisobingizga kiring" }, "Sign in to your ControlMe account")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && isConnectionError(new Error(error)) ? (
                <ConnectionError onRetry={() => setError("")} />
              ) : error ? (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm animate-fade-in">
                  {error}
                </div>
              ) : null}
              
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="focus-ring transition-all duration-200 focus:scale-[1.01]"
              />
              
              <Input
                label={translate(language, { FR: "Mot de passe", RU: "Пароль", UK: "Пароль", GE: "Passwort", ES: "Contraseña", PT: "Senha", IT: "Password", PL: "Hasło", TR: "Şifre", UZ: "Parol" }, "Password")}
                type="password"
                placeholder={translate(language, { FR: "Entrez votre mot de passe", RU: "Введите пароль", UK: "Введіть пароль", GE: "Passwort eingeben", ES: "Introduce tu contraseña", PT: "Digite sua senha", IT: "Inserisci la password", PL: "Wpisz hasło", TR: "Şifrenizi girin", UZ: "Parolingizni kiriting" }, "Enter your password")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="focus-ring transition-all duration-200 focus:scale-[1.01]"
              />
              
              <Button 
                type="submit" 
                className="w-full bg-[#4ADE80]/20 hover:bg-[#4ADE80]/30 text-[#4ADE80] border border-[#4ADE80]/30" 
                size="lg" 
                disabled={login.isPending}
              >
                {login.isPending
                  ? translate(language, { FR: "Connexion...", RU: "Вход...", UK: "Вхід...", GE: "Anmeldung...", ES: "Entrando...", PT: "Entrando...", IT: "Accesso...", PL: "Logowanie...", TR: "Giriş yapılıyor...", UZ: "Kirilmoqda..." }, "Signing in...")
                  : translate(language, { FR: "Se connecter", RU: "Войти", UK: "Увійти", GE: "Anmelden", ES: "Entrar", PT: "Entrar", IT: "Accedi", PL: "Zaloguj się", TR: "Giriş yap", UZ: "Kirish" }, "Sign In")}
              </Button>
            </form>
            
            <div className="mt-6 space-y-3 text-center">
              <p className="text-sm text-[#9CA3AF]">
                <Link
                  href="/forgot-password"
                  className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors"
                >
                  {translate(language, { FR: "Mot de passe oublié ?", RU: "Забыли пароль?", UK: "Забули пароль?", GE: "Passwort vergessen?", ES: "¿Olvidaste tu contraseña?", PT: "Esqueceu sua senha?", IT: "Password dimenticata?", PL: "Nie pamiętasz hasła?", TR: "Şifrenizi mi unuttunuz?", UZ: "Parolni unutdingizmi?" }, "Forgot your password?")}
                </Link>
              </p>
              <p className="text-sm text-[#9CA3AF]">
                {translate(language, { FR: "Pas encore de compte ?", RU: "Нет аккаунта?", UK: "Ще немає акаунта?", GE: "Noch kein Konto?", ES: "¿No tienes cuenta?", PT: "Ainda não tem conta?", IT: "Non hai un account?", PL: "Nie masz konta?", TR: "Hesabınız yok mu?", UZ: "Hisobingiz yo‘qmi?" }, "Don't have an account?")}{" "}
                <Link
                  href="/register"
                  className="text-[#4ADE80] hover:text-[#4ADE80]/80 transition-colors underline underline-offset-4"
                >
                  {translate(language, { FR: "Créer un compte", RU: "Регистрация", UK: "Реєстрація", GE: "Registrieren", ES: "Registrarse", PT: "Registrar", IT: "Registrati", PL: "Zarejestruj się", TR: "Kayıt ol", UZ: "Ro‘yxatdan o‘tish" }, "Register")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
