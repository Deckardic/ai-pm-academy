"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Mail } from "lucide-react";
import { authClient, signIn, signUp, type AuthProviders } from "@/shared/auth";
import { routes } from "@/shared/config";
import {
  Button,
  FieldError,
  Input,
  Label,
  LoadingButton,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
} from "@/shared/ui";
import { authErrorMessage } from "../model/errors";
import { ConsentCheckbox } from "./consent-checkbox";
import { VkIcon, YandexIcon } from "./social-icons";

type Mode = "sign-in" | "sign-up";

type SignInFormProps = {
  providers: AuthProviders;
  next?: string;
  defaultMode?: Mode;
};

export function SignInForm({ providers, next, defaultMode = "sign-in" }: SignInFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [consentError, setConsentError] = useState(false);

  const destination = (next && next.startsWith("/") ? next : routes.dashboard()) as Route;

  function requireConsent(): boolean {
    if (consent) return true;
    setConsentError(true);
    setError("Чтобы создать аккаунт, нужно согласие на обработку персональных данных");
    return false;
  }

  async function onEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (mode === "sign-up") {
      if (!requireConsent()) return;
      setPending("email");
      const { error: signUpError } = await signUp.email({
        email,
        password,
        name: String(form.get("name") ?? "").trim() || email.split("@")[0]!,
      });
      setPending(null);
      if (signUpError) return setError(authErrorMessage(signUpError));
      router.push(routes.onboarding());
      router.refresh();
      return;
    }

    setPending("email");
    const { error: signInError } = await signIn.email({ email, password });
    setPending(null);
    if (signInError) return setError(authErrorMessage(signInError));
    router.push(destination);
    router.refresh();
  }

  async function onMagicLink(form: HTMLFormElement | null) {
    setError(null);
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    if (!email) return setError("Введите email — пришлём ссылку для входа");
    if (mode === "sign-up" && !requireConsent()) return;
    setPending("magic");
    const { error: magicError } = await signIn.magicLink({ email, callbackURL: destination });
    setPending(null);
    if (magicError) return setError(authErrorMessage(magicError));
    setNotice(`Отправили ссылку для входа на ${email}. Она действует 10 минут.`);
  }

  async function onSocial(provider: "yandex" | "vk") {
    setError(null);
    if (!requireConsent()) return;
    setPending(provider);
    const { error: socialError } = await signIn.social({
      provider,
      callbackURL: destination,
      newUserCallbackURL: routes.onboarding(),
    });
    if (socialError) {
      setPending(null);
      setError(authErrorMessage(socialError));
    }
  }

  async function onForgotPassword(form: HTMLFormElement | null) {
    setError(null);
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim();
    if (!email) return setError("Введите email, и мы пришлём ссылку для сброса пароля");
    setPending("reset");
    const { error: resetError } = await authClient.requestPasswordReset({
      email,
      redirectTo: routes.resetPassword(),
    });
    setPending(null);
    if (resetError) return setError(authErrorMessage(resetError));
    setNotice(`Если аккаунт ${email} существует, мы отправили ссылку для сброса пароля.`);
  }

  const hasSocial = providers.yandex || providers.vk;

  return (
    <div className="flex flex-col gap-6">
      <Tabs
        value={mode}
        onValueChange={(value) => {
          setMode(value as Mode);
          setError(null);
          setNotice(null);
        }}
      >
        <TabsList className="grid w-full grid-cols-2">
          <Tab value="sign-in">Вход</Tab>
          <Tab value="sign-up">Регистрация</Tab>
        </TabsList>
        {(["sign-in", "sign-up"] as const).map((tab) => (
          <TabsPanel key={tab} value={tab} className="mt-6">
            <form
              id={`auth-${tab}`}
              onSubmit={onEmailSubmit}
              className="flex flex-col gap-4"
              noValidate
            >
              {tab === "sign-up" ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${tab}-name`}>Как вас зовут</Label>
                  <Input
                    id={`${tab}-name`}
                    name="name"
                    autoComplete="name"
                    placeholder="Анна Смирнова"
                    required
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`${tab}-email`}>Email</Label>
                <Input
                  id={`${tab}-email`}
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  placeholder="you@example.ru"
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${tab}-password`}>Пароль</Label>
                  {tab === "sign-in" ? (
                    <button
                      type="button"
                      className="cursor-pointer text-sm text-fg-muted transition-colors duration-150 ease-[ease] hover:text-fg"
                      onClick={(event) => onForgotPassword(event.currentTarget.form)}
                    >
                      Забыли пароль?
                    </button>
                  ) : null}
                </div>
                <Input
                  id={`${tab}-password`}
                  name="password"
                  type="password"
                  autoComplete={tab === "sign-up" ? "new-password" : "current-password"}
                  minLength={8}
                  placeholder={tab === "sign-up" ? "Не короче 8 символов" : undefined}
                  required
                />
              </div>
              {tab === "sign-up" ? (
                <ConsentCheckbox
                  checked={consent}
                  invalid={consentError && !consent}
                  onCheckedChange={(value) => {
                    setConsent(value);
                    if (value) {
                      setConsentError(false);
                      setError(null);
                    }
                  }}
                />
              ) : null}
              <LoadingButton
                type="submit"
                size="lg"
                pending={pending === "email"}
                className="w-full"
              >
                {tab === "sign-up" ? "Создать аккаунт" : "Войти"}
              </LoadingButton>
              <LoadingButton
                type="button"
                variant="secondary"
                size="lg"
                pending={pending === "magic"}
                className="w-full"
                onClick={(event) => onMagicLink(event.currentTarget.form)}
              >
                <Mail aria-hidden /> Получить ссылку на почту
              </LoadingButton>
            </form>
          </TabsPanel>
        ))}
      </Tabs>

      {hasSocial ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-xs text-fg-subtle">
            <span className="h-px flex-1 bg-line" /> или <span className="h-px flex-1 bg-line" />
          </div>
          {mode === "sign-in" ? (
            <ConsentCheckbox
              checked={consent}
              invalid={consentError && !consent}
              onCheckedChange={(value) => {
                setConsent(value);
                if (value) setConsentError(false);
              }}
            />
          ) : null}
          <div className="grid gap-2 sm:grid-cols-2">
            {providers.yandex ? (
              <LoadingButton
                variant="secondary"
                size="lg"
                pending={pending === "yandex"}
                onClick={() => onSocial("yandex")}
              >
                <YandexIcon /> Яндекс ID
              </LoadingButton>
            ) : null}
            {providers.vk ? (
              <LoadingButton
                variant="secondary"
                size="lg"
                pending={pending === "vk"}
                onClick={() => onSocial("vk")}
              >
                <VkIcon /> VK ID
              </LoadingButton>
            ) : null}
          </div>
        </div>
      ) : null}

      <FieldError message={error} />
      {notice ? (
        <p
          role="status"
          className="rounded-lg bg-success-soft px-4 py-3 text-sm text-success transition-opacity duration-200 ease-out starting:opacity-0"
        >
          {notice}
        </p>
      ) : null}
      {mode === "sign-in" ? (
        <p className="text-center text-sm text-fg-muted">
          Нет аккаунта?{" "}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto px-1 text-accent hover:bg-transparent"
            onClick={() => setMode("sign-up")}
          >
            Зарегистрируйтесь
          </Button>
        </p>
      ) : null}
    </div>
  );
}
