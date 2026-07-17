"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { agregarOpcionMenu, eliminarOpcionMenu } from "@/models/menu.model";
import type { CategoriaMenu } from "@/models/types";

export async function crearOpcionMenu(categoria: CategoriaMenu, nombre: string) {
  const limpio = nombre.trim();
  if (!limpio) return;

  const supabase = await createClient();
  await agregarOpcionMenu(supabase, categoria, limpio);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}

export async function borrarOpcionMenu(id: string) {
  const supabase = await createClient();
  await eliminarOpcionMenu(supabase, id);
  revalidatePath("/dashboard/menu");
  revalidatePath("/pedido");
}
