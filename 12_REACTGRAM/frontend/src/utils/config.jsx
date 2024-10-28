export const api = "http://localhost:5000/api";
export const uploads = "http://localhost:5000/uploads";

// Função de configuração de requisições
export const requestConfig = (method, data = null, token = null, image = null) => {
  let config;

  if (image) {
    config = {
      method: method,
      body: data, // FormData para uploads de imagem
      headers: {},
    };
  } else if (method === "DELETE" || data === null) {
    config = {
      method: method,
      headers: {},
    };
  } else {
    config = {
      method: method,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    };
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
};

// Função auxiliar de upload (opcional)
export const upload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const config = {
    method: "POST",
    body: formData,
  };

  try {
    const response = await fetch(`${uploads}/upload`, config);
    if (!response.ok) throw new Error("Erro no upload");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao fazer upload:", error);
    throw error;
  }
};