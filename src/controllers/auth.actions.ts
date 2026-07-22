"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error: string | null;
};

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export type ResetState = {
  error: string | null;
  success: boolean;
};

export async function sendPasswordReset(
  _prevState: ResetState,
  formData: FormData
): Promise<ResetState> {
  const email = String(formData.get("email") ?? "");

  if (!email) {
    return { error: "Ingresa tu correo electrónico.", success: false };
  }

  console.log("=== ENVIANDO RESET DE CONTRASEÑA ===");
  console.log("Email:", email);
  console.log("SITE_URL:", process.env.NEXT_PUBLIC_SITE_URL);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/update-password`,
  });

  console.log("Resultado reset:", { data, error });

  if (error) {
    console.error("Error al enviar reset:", error);
    return { error: "No pudimos enviar el correo. Intenta de nuevo.", success: false };
  }

  return { error: null, success: true };
}

export type UpdatePasswordState = {
  error: string | null;
};

export async function updatePassword(
  _prevState: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres." };
  }

  if (password !== confirmPassword) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No pudimos actualizar la contraseña. Intenta de nuevo." };
  }

  redirect("/login");
}
