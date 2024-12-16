import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebaseConnection";
import { format } from 'date-fns';
import jsPDF from 'jspdf';

export async function generatePDF(ticketId, setLoadingPDF) {
    try {
      setLoadingPDF(true);
  
      // Obtém o documento da ordem de serviço pelo ID
      const ticketRef = doc(db, "tickets", ticketId);
      const ticketSnap = await getDoc(ticketRef);
  
      if (!ticketSnap.exists()) {
        console.error('Ordem de serviço não encontrada.');
        setLoadingPDF(false);
        return;
      }
  
      const ticketData = ticketSnap.data();
  
      // Cria o PDF
      const pdfDoc = new jsPDF();
  
      // Configurações iniciais
      let currentY = 10; // posição Y inicial (É a quebra de linha após um texto para que um texto não fique sobreposto a outro)
      const margin = 10; // margem de segurança para não ultrapassar a página
      const maxY = 280; // limite de Y para cada página (A4 padrão)
      const lineHeight = 10; // altura da linha de texto
      const sectionSpacing = 5; // espaçamento extra entre seções
  
      // Função auxiliar para verificar se é necessário criar uma nova página
      function checkAddPage(doc, yPos) {
        if (yPos > maxY) {
          doc.addPage();
          return margin; // Reinicia a posição Y no topo da nova página
        }
        return yPos;
      }
  
      // Título
      const ticketNumber = ticketData.ticketNumber || 'Número não disponível'; // Obtém o ticketNumber ou define como 'não disponível'
      pdfDoc.setFontSize(14);
      pdfDoc.text(`Ordens de Serviço  ${ticketNumber}`, 105, currentY, { align: 'center' });
      currentY += lineHeight * 2;
  
      // 1. Dados do Usuário (Empresa prestadora do serviço)
      const userRef = doc(db, "users", ticketData.userId);
      const userSnap = await getDoc(userRef);
      const userData = userSnap.exists() ? userSnap.data() : null;
  
      if (userData) {
        pdfDoc.setFontSize(12);
        pdfDoc.text('Dados da Empresa (Prestador de Serviço):', margin, currentY);
        currentY += lineHeight;
  
        pdfDoc.setFontSize(10);
        if (userData.razaoSocial) {
            currentY = checkAddPage(pdfDoc, currentY);
            pdfDoc.text(`Razão Social: ${userData.razaoSocial}`, margin, currentY);
            currentY += lineHeight;
        }
        if (userData.cnpj) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`CNPJ: ${userData.cnpj}`, margin, currentY);
          currentY += lineHeight;
        }
        if (userData.telefone) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`Telefone: ${userData.telefone}`, margin, currentY);
          currentY += lineHeight;
        }
        if (userData.endereco) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`Endereço: ${userData.endereco}`, margin, currentY);
          currentY += lineHeight;
        }
      }
  
      // 2. Dados do Cliente
      currentY += sectionSpacing;
      const customerRef = doc(db, "customers", ticketData.clienteId);
      const customerSnap = await getDoc(customerRef);
      const customerData = customerSnap.exists() ? customerSnap.data() : null;
  
      if (customerData) {
        currentY = checkAddPage(pdfDoc, currentY);
        pdfDoc.setFontSize(12);
        pdfDoc.text('Dados do Cliente (Solicitante do Serviço):', margin, currentY);
        currentY += lineHeight;
  
        pdfDoc.setFontSize(10);
        if (customerData.nomeCustomer) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`Nome: ${customerData.nomeCustomer}`, margin, currentY);
          currentY += lineHeight;
        }
        if (customerData.cpf) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`CPF: ${customerData.cpf}`, margin, currentY);
          currentY += lineHeight;
        }
        if (customerData.cnpj) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`CNPJ: ${customerData.cnpj}`, margin, currentY);
          currentY += lineHeight;
        }
        if (customerData.telefone) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`Telefone: ${customerData.telefone}`, margin, currentY);
          currentY += lineHeight;
        }
        if (customerData.endereco) {
          currentY = checkAddPage(pdfDoc, currentY);
          pdfDoc.text(`Endereço: ${customerData.endereco.rua}, ${customerData.endereco.numero}, ${customerData.endereco.bairro}, ${customerData.endereco.cidade} - CEP: ${customerData.endereco.cep}`, margin, currentY);
          currentY += lineHeight;
        }
      }
  
      // 3. Dados da Ordem de Serviço
      currentY += sectionSpacing;
      currentY = checkAddPage(pdfDoc, currentY);
      pdfDoc.setFontSize(12);
      pdfDoc.text('Dados da Ordem de Serviço (Detalhes do Serviço Prestado):', margin, currentY);
      currentY += lineHeight;
  
      pdfDoc.setFontSize(10);
      pdfDoc.text(`Assunto: ${ticketData.assunto || ''}`, margin, currentY);
      currentY += lineHeight;
      pdfDoc.text(`Data de criação: ${ticketData.created ? format(ticketData.created.toDate(), 'dd/MM/yyyy') : ''}`, margin, currentY);
      currentY += lineHeight;
      
      // Laudo Técnico (texto longo)
      pdfDoc.text('Laudo Técnico:', margin, currentY);
      currentY += lineHeight;
      const laudo = ticketData.laudo || '';
      const laudoLines = pdfDoc.splitTextToSize(laudo, 190); // Divide o texto em várias linhas, conforme necessário
      laudoLines.forEach(line => {
        currentY = checkAddPage(pdfDoc, currentY);
        pdfDoc.text(line, margin, currentY);
        currentY += lineHeight;
      });
  
      // Assinatura
      currentY += sectionSpacing;
      currentY += lineHeight * 2; // Espaçamento antes do texto da assinatura
      pdfDoc.text('Assinatura do Cliente (Solicitante):', margin, currentY);
      currentY += lineHeight;
      pdfDoc.text('Data: ________________________', margin, currentY); // Adiciona a linha para a data
      currentY += lineHeight; // Aumenta a posição Y após a linha da data
      currentY = checkAddPage(pdfDoc, currentY);
      pdfDoc.text('Assinatura:', margin, currentY);
      currentY += lineHeight * 0.5; // Espaçamento entre o texto e a linha
      pdfDoc.line(margin, currentY + lineHeight, 200, currentY + lineHeight);
      currentY += lineHeight * 2;
  
      // Salva o PDF
      pdfDoc.save(`ordem_servico_${ticketNumber}.pdf`);
  
    } catch (error) {
      console.error('Erro ao gerar o PDF:', error);
    } finally {
      setLoadingPDF(false);
    }
  }
  