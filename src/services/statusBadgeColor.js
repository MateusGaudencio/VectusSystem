export function getBadgeColor(status) {
  switch (status) {
      case "Aguardando Orçamento":
          return "#E68A19"; // Cor laranja escuro
      case "Orçamento Aprovado":
          return "#467F3A"; // Cor verde floresta
      case "O.S Concluída":
          return "#3D3D6B"; // Cor azul metálico
      case "O.S Cancelada":
          return "#991F1F"; // Cor vermelha terra
      default:
          return "#B0B0B0"; // Cor cinza para casos indefinidos
  }
}
