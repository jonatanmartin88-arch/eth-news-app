import type { News } from "../../../drizzle/schema";

export async function exportNewsToPdf(news: News[], filename: string = "eth-news-favoritos.pdf") {
  try {
    // Usar jsPDF si está disponible, sino crear un documento HTML para imprimir
    const html = generateHtmlContent(news);
    
    // Crear un blob con el contenido HTML
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva ventana para imprimir/guardar como PDF
    const window_ref = window.open(url, "_blank");
    
    if (window_ref) {
      window_ref.addEventListener("load", () => {
        window_ref.print();
      });
    }
  } catch (error) {
    console.error("Error exporting to PDF:", error);
  }
}

function generateHtmlContent(news: News[]): string {
  const newsHtml = news
    .map(
      (item) => `
    <div style="page-break-inside: avoid; margin-bottom: 30px; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="margin-top: 0; color: #333;">${escapeHtml(item.title)}</h2>
      <p style="color: #666; margin: 10px 0;"><strong>Fuente:</strong> ${escapeHtml(item.source || "N/A")}</p>
      <p style="color: #666; margin: 10px 0;"><strong>Fecha:</strong> ${formatDate(item.publishedAt)}</p>
      ${item.description ? `<p style="color: #555; margin: 10px 0;">${escapeHtml(item.description)}</p>` : ""}
      ${item.content ? `<p style="color: #555; margin: 10px 0;">${escapeHtml(item.content)}</p>` : ""}
      <p style="color: #0066cc; margin-top: 10px;"><a href="${escapeHtml(item.sourceUrl)}" target="_blank">${escapeHtml(item.sourceUrl)}</a></p>
    </div>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ETH News - Noticias Favoritas</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f5f5f5;
        }
        h1 {
          text-align: center;
          color: #333;
          border-bottom: 3px solid #6366f1;
          padding-bottom: 10px;
        }
        .metadata {
          text-align: center;
          color: #666;
          margin-bottom: 30px;
          font-size: 14px;
        }
        @media print {
          body {
            background-color: white;
          }
        }
      </style>
    </head>
    <body>
      <h1>⚡ ETH News - Noticias Favoritas</h1>
      <div class="metadata">
        <p>Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}</p>
        <p>Total de noticias: ${news.length}</p>
      </div>
      ${newsHtml}
    </body>
    </html>
  `;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
