"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  crearSede,
  actualizarSede,
  alternarSede,
  eliminarSede,
} from "@/models/sedes.model";

function revalidar() {
  revalidatePath("/dashboard/configuracion");
  revalidatePath("/pedido");
}

export async function agregarSede(nombre: string, direccion: string) {
  const nombreLimpio = nombre.trim();
  const direccionLimpia = direccion.trim();
  if (!nombreLimpio || !direccionLimpia) return;

  const supabase = await createClient();
  await crearSede(supabase, nombreLimpio, direccionLimpia);
  revalidar();
}

export async function guardarSede(
  id: string,
  nombre: string,
  direccion: string
) {
  const supabase = await createClient();
  await actualizarSede(supabase, id, {
    nombre: nombre.trim(),
    direccion: direccion.trim(),
  });
  revalidar();
}

export async function alternarSedeActiva(id: string, activa: boolean) {
  const supabase = await createClient();
  await alternarSede(supabase, id, activa);
  revalidar();
}

export async function borrarSede(id: string) {
  const supabase = await createClient();
  await eliminarSede(supabase, id);
  revalidar();
}
