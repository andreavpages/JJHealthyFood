export type Clienta = {
  id: string;
  nombre: string;
  telefono: string;
  direccion: string | null;
  zona_entrega: string | null;
  created_at: string;
};

export type DiaEntrega = "miercoles" | "jueves";
export type EstadoPedido = "pendiente" | "en_preparacion" | "entregado";

export type Pedido = {
  id: string;
  clienta_id: string;
  fecha_pedido: string;
  dia_entrega: DiaEntrega;
  estado: EstadoPedido;
  precio_total: number;
  notas: string | null;
};

export type ComidaPedido = {
  id: string;
  pedido_id: string;
  numero_comida: number;
  proteina: string;
  carbohidrato: string;
  extra: string | null;
  es_desayuno: boolean;
};

export type PedidoConDetalle = Pedido & {
  clientas: Pick<
    Clienta,
    "nombre" | "telefono" | "zona_entrega" | "direccion"
  > | null;
  comidas_pedido: Pick<ComidaPedido, "proteina">[];
};

export type ClientaConPedidos = Clienta & {
  pedidos: Pick<Pedido, "id" | "fecha_pedido">[];
};

export type PedidoParaComanda = Pedido & {
  clientas: Pick<
    Clienta,
    "nombre" | "telefono" | "direccion" | "zona_entrega"
  > | null;
  comidas_pedido: ComidaPedido[];
};

export type EstadoClienta = "vip" | "recurrente" | "nuevo" | "inactivo";

export type CategoriaMenu = "proteina" | "carbohidrato" | "desayuno";

export type OpcionMenu = {
  id: string;
  categoria: CategoriaMenu;
  nombre: string;
  orden: number;
};
