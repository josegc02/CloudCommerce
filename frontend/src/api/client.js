//const PRODUCTOS_API_URL = import.meta.env.VITE_PRODUCTOS_API_URL || "https://uhxzs5j1jf.execute-api.us-east-1.amazonaws.com/";
//const USUARIOS_API_URL = import.meta.env.VITE_USUARIOS_API_URL || "https://zgg68hih37.execute-api.us-east-1.amazonaws.com/";
const PRODUCTOS_API_URL =
  import.meta.env.VITE_PRODUCTOS_API_URL ||
  "https://g30st0hfx5.execute-api.us-east-1.amazonaws.com/";

const USUARIOS_API_URL =
  import.meta.env.VITE_USUARIOS_API_URL ||
  "https://clyet1t216.execute-api.us-east-1.amazonaws.com/";


async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Error ${res.status} en ${url}`);
  }
  return res.json();
}

export const productosApi = {
  listar: (categoriaId) => {
    const query = categoriaId ? `?categoria_id=${categoriaId}` : "";
    return request(`${PRODUCTOS_API_URL}/productos${query}`);
  },
  listarCategorias: () => request(`${PRODUCTOS_API_URL}/categorias`),
  crear: (producto) =>
    request(`${PRODUCTOS_API_URL}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(producto),
    }),
};

export const usuariosApi = {
  listar: (page = 0, size = 20) =>
    request(`${USUARIOS_API_URL}/usuarios?page=${page}&size=${size}`),
  crear: (usuario) =>
    request(`${USUARIOS_API_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(usuario),
    }),
};
