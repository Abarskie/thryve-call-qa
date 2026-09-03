"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    revalidatePath("/", "layout");
  } catch {
    // Ignored outside Next.js request context
  }
  redirect("/");
}

export async function signUpAction(formData: FormData): Promise<{
  success: boolean;
  error?: string;
}> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters." };
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  // If auto-confirmed or session established
  if (data.session) {
    try {
      revalidatePath("/", "layout");
    } catch {
      // Ignored outside Next.js request context
    }
    redirect("/");
  }

  // Attempt login with credentials
  const { error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError) {
    return {
      success: true,
      error: "Account created! Please sign in with your credentials.",
    };
  }

  try {
    revalidatePath("/", "layout");
  } catch {
    // Ignored outside Next.js request context
  }
  redirect("/");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  try {
    revalidatePath("/", "layout");
  } catch {
    // Ignored outside Next.js request context
  }
  redirect("/login");
}

export async function getCurrentUser(): Promise<{
  id: string;
  email: string;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !user.email) return null;
    return {
      id: user.id,
      email: user.email,
    };
  } catch {
    return null;
  }
}

