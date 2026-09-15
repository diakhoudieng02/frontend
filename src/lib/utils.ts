import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { User } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Représente un utilisateur avec ses métadonnées personnalisées.
 */
export interface AppUser extends User {
  user_metadata: {
    first_name?: string;
    last_name?: string;
    full_name?: string;
    school?: string;
    grade?: string;
  };
}

/**
 * Vérifie si un utilisateur est considéré comme "nouveau" 
 * en se basant sur la présence de ses métadonnées de profil.
 * 
 * @param user L'objet utilisateur de Supabase.
 * @returns `true` si l'utilisateur doit compléter son profil, sinon `false`.
 */
export function isNewUser(user: AppUser | null | undefined): boolean {
  if (!user) return false;

  // L'utilisateur est considéré comme nouveau si les métadonnées de base du profil sont manquantes.
  const { user_metadata } = user;
  return !user_metadata || !user_metadata.full_name;
}

// lib/utils.ts
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}