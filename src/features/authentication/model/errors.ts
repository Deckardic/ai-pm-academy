const messages: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Неверный email или пароль",
  USER_ALREADY_EXISTS: "Аккаунт с таким email уже есть — войдите",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "Аккаунт с таким email уже есть — войдите",
  PASSWORD_TOO_SHORT: "Пароль должен быть не короче 8 символов",
  INVALID_EMAIL: "Проверьте адрес почты",
  TOO_MANY_REQUESTS: "Слишком много попыток. Подождите минуту",
  INVALID_TOKEN: "Ссылка устарела. Запросите новую",
};

export function authErrorMessage(
  error: { code?: string; message?: string; status?: number } | null | undefined,
) {
  if (!error) return "Что-то пошло не так. Попробуйте ещё раз";
  if (error.status === 429) return messages.TOO_MANY_REQUESTS!;
  return (error.code && messages[error.code]) || "Что-то пошло не так. Попробуйте ещё раз";
}
