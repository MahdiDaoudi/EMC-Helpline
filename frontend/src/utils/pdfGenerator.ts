import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Signalement } from '../types';
import logoLightmode from '../assets/logo-lightmode.png';
import {
  applyArabicCellFont,
  registerArabicFont,
  setPdfFont,
  toPdfText,
} from './pdfArabic';

const PDF_COLORS = {
  dark: '#0f172a',
  slate: '#64748b',
  blue: '#2563eb',
  border: '#e2e8f0',
  bg: '#f8fafc',
} as const;

const STATUS_TEXT_COLORS: Record<string, [number, number, number]> = {
  PENDING: [234, 88, 12],
  IN_PROGRESS: [37, 99, 235],
  VALIDATED: [22, 163, 74],
  REJECTED: [239, 68, 68],
  CLOSED: [100, 116, 139],
};

const formatDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(date);
};

const formatDateOnly = (value?: string | null) => {
  const formatted = formatDate(value);
  if (formatted === '—') return '—';
  return formatted.split(' ')[0];
};

const getStatusLabel = (s: string) => {
  const labels: Record<string, string> = {
    PENDING: 'En attente', IN_PROGRESS: 'En cours',
    VALIDATED: 'Validé', REJECTED: 'Rejeté', CLOSED: 'Clôturé',
  };
  return labels[s] ?? s;
};

const getContentTypeLabel = (type?: string | null) => {
  const labels: Record<string, string> = {
    VIDEO: 'Vidéo', IMAGE: 'Image', PROFILE: 'Profil',
    POST: 'Publication', COMMENT: 'Commentaire', PAGE: 'Page',
  };
  return labels[type ?? ''] ?? type ?? '—';
};

const displayValue = (value?: string | null) => value?.trim() || '—';
const pdfDisplay = (value?: string | null) => toPdfText(displayValue(value));

const applyArabicTableFont = (data: { cell: { text?: string[]; raw?: unknown; styles: { font?: string } } }) => {
  const raw = Array.isArray(data.cell.text)
    ? data.cell.text.join(' ')
    : String(data.cell.raw ?? '');
  applyArabicCellFont(raw, data.cell.styles);
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const applyConfidentialFooter = (doc: jsPDF, margin: number) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const totalPagesExp = '{total_pages_count_string}';
  const totalPages = (doc.internal as any).getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    doc.setDrawColor(PDF_COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin - 4, pageWidth - margin, pageHeight - margin - 4);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(PDF_COLORS.slate);
    doc.text('EMC HELPLINE', margin, pageHeight - margin);

    doc.setFont('helvetica', 'normal');
    doc.text('Document confidentiel', pageWidth / 2, pageHeight - margin, { align: 'center' });

    doc.text(`Page ${i} / ${totalPagesExp}`, pageWidth - margin, pageHeight - margin, { align: 'right' });
  }

  if (typeof (doc as any).putTotalPages === 'function') {
    (doc as any).putTotalPages(totalPagesExp);
  }
};

const drawSummaryCards = (
  doc: jsPDF,
  cards: { label: string; value: string }[],
  margin: number,
  yPos: number,
  contentWidth: number,
) => {
  const gap = 2;
  const cardWidth = (contentWidth - (cards.length - 1) * gap) / cards.length;

  cards.forEach((card, i) => {
    const x = margin + i * (cardWidth + gap);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, yPos, cardWidth, 12, 1, 1, 'FD');

    doc.setFontSize(6);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text(card.label, x + 2, yPos + 4);

    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    setPdfFont(doc, card.value, 'bold');

    let val = toPdfText(card.value);
    const maxWidth = cardWidth - 4;
    if (doc.getTextWidth(val) > maxWidth) {
      while (val.length > 1 && doc.getTextWidth(`${val}...`) > maxWidth) {
        val = val.slice(0, -1);
      }
      val = `${val}...`;
    }

    doc.text(val, x + 2, yPos + 9);
  });

  return yPos + 12 + 10;
};

export const generateSignalementPDF = async (signalement: Signalement) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let yPos = margin;
  const contentWidth = pageWidth - 2 * margin;
  const reference = signalement.reference || (signalement.id ? `SIG-${signalement.id}` : 'SIG-INCONNU');

  const checkPageBreak = (neededHeight: number) => {
    if (yPos + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      yPos = margin + 5;
    }
  };

  // 1. HEADER
  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(logoLightmode);
  } catch (e) {
    console.error('Could not load logo for PDF', e);
  }

  if (logoImg) {
    const logoW = 35;
    const logoH = (logoW * logoImg.height) / logoImg.width;
    doc.addImage(logoImg, 'PNG', margin, yPos, logoW, logoH);
  }
  
  doc.setFontSize(16);
  doc.setTextColor('#0f172a'); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('DOSSIER DE SIGNALEMENT', margin + 45, yPos + 6);

  doc.setFontSize(9);
  doc.setTextColor('#64748b'); // slate-500
  doc.setFont('helvetica', 'normal');
  doc.text(`Référence : ${reference}`, margin + 45, yPos + 11);
  
  const rightAlign = pageWidth - margin;
  doc.setFontSize(8);
  doc.setTextColor('#2563eb'); // blue-600
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENT CONFIDENTIEL', rightAlign, yPos + 6, { align: 'right' });

  const genDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(new Date());
  doc.setFontSize(8);
  doc.setTextColor('#64748b'); // slate-500
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le : ${genDate}`, rightAlign, yPos + 11, { align: 'right' });
  
  yPos = Math.max(yPos + (logoImg ? (35 * logoImg.height) / logoImg.width : 15), yPos + 12) + 6;
  
  doc.setDrawColor('#e2e8f0'); // slate-200
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  // 2. CASE SUMMARY
  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DU DOSSIER', margin, yPos);
  yPos += 5;

  const cards = [
    { label: 'RÉFÉRENCE', value: reference },
    { label: 'STATUT', value: getStatusLabel(signalement.status) },
    { label: 'PRIORITÉ', value: getStatusLabel(signalement.priority) },
    { label: 'ÉMETTEUR', value: displayValue(signalement.issuer) },
    { label: 'RÉCEPTION', value: formatDateOnly(signalement.createdAt) }
  ];

  yPos = drawSummaryCards(doc, cards, margin, yPos, contentWidth);

  // 3. INFORMATIONS DU SIGNALEMENT
  checkPageBreak(30);
  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.text('INFORMATIONS DU SIGNALEMENT', margin, yPos);
  yPos += 2;

  const titulaireValue = signalement.titulaire === 'MOI_MEME' ? 'Oui' : signalement.titulaire === 'AUTRE_PERSONNE' ? 'Non' : 'Non';

  autoTable(doc, {
    startY: yPos,
    theme: 'plain',
    styles: { cellPadding: 2, fontSize: 8 },
    columnStyles: { 
      0: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 35 }, 
      1: { textColor: '#0f172a', cellWidth: (contentWidth / 2) - 35 },
      2: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 40 },
      3: { textColor: '#0f172a', cellWidth: (contentWidth / 2) - 40 }
    },
    body: [
      [
        'RÉFÉRENCE', reference, 
        'TYPE DE VIOLENCE', signalement.cyberViolence?.name || signalement.otherCyberViolence || '—'
      ],
      [
        'ÉMETTEUR', displayValue(signalement.issuer),
        'PRIORITÉ', getStatusLabel(signalement.priority)
      ],
      [
        'TITULAIRE', titulaireValue,
        'STATUT', getStatusLabel(signalement.status)
      ]
    ],
  });
  yPos = (doc as any).lastAutoTable.finalY + 4;

  const descLines = doc.splitTextToSize(signalement.description || 'Aucune description fournie.', contentWidth - 6);
  const descHeight = descLines.length * 3.5 + 4;
  checkPageBreak(descHeight + 15);

  doc.setFontSize(7);
  doc.setTextColor('#64748b');
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION DES FAITS', margin, yPos);
  yPos += 2;

  doc.setDrawColor('#e2e8f0');
  doc.setFillColor('#f8fafc');
  doc.roundedRect(margin, yPos, contentWidth, descHeight + 2, 1, 1, 'FD');
  
  doc.setFontSize(8);
  doc.setTextColor('#0f172a');
  doc.setFont('helvetica', 'normal');
  doc.text(descLines, margin + 3, yPos + 5);
  yPos += descHeight + 10;

  // 4. VICTIME
  if (signalement.victim) {
    checkPageBreak(30);
    const v = signalement.victim;
    doc.setFontSize(11);
    doc.setTextColor('#0f172a');
    doc.setFont('helvetica', 'bold');
    doc.text('VICTIME', margin, yPos);
    yPos += 2;
    
    autoTable(doc, {
      startY: yPos,
      theme: 'plain',
      styles: { cellPadding: 2, fontSize: 8 },
      columnStyles: { 
        0: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 35 }, 
        1: { textColor: '#0f172a', cellWidth: (contentWidth / 2) - 35 },
        2: { fontStyle: 'bold', textColor: '#64748b', cellWidth: 35 },
        3: { textColor: '#0f172a', cellWidth: (contentWidth / 2) - 35 }
      },
      body: [
        [
          'NOM', displayValue(v.lastName),
          'TÉLÉPHONE', displayValue(v.telephone)
        ],
        [
          'PRÉNOM', displayValue(v.firstName),
          'SEXE', v.sex === 'MALE' ? 'Homme' : v.sex === 'FEMALE' ? 'Femme' : '—'
        ],
        [
          'EMAIL', displayValue(v.email),
          'VILLE', displayValue(v.city)
        ]
      ]
    });
    yPos = (doc as any).lastAutoTable.finalY + 10;
  }

  // 5. TRAITEMENT DU SIGNALEMENT (LIFECYCLE)
  checkPageBreak(40);
  doc.setFontSize(11);
  doc.setTextColor('#0f172a');
  doc.setFont('helvetica', 'bold');
  doc.text('TRAITEMENT DU SIGNALEMENT', margin, yPos);
  yPos += 8;

  const lifecycle = [
    { label: 'RÉCEPTION', date: formatDate(signalement.createdAt), state: 'done' },
    { label: 'ANALYSE', date: formatDate(signalement.dateAnalyse), state: signalement.dateAnalyse ? 'done' : (signalement.status === 'PENDING' ? 'current' : 'pending') },
    { label: signalement.status === 'REJECTED' ? 'REJETÉ' : 'VALIDÉ', date: formatDate(signalement.dateApprobation), state: signalement.dateApprobation ? (signalement.status === 'REJECTED' ? 'rejected' : 'done') : (signalement.status === 'IN_PROGRESS' ? 'current' : 'pending') },
    { label: 'CLÔTURÉ', date: signalement.status === 'CLOSED' ? formatDate(signalement.updatedAt) : '—', state: signalement.status === 'CLOSED' ? 'done' : (signalement.status === 'VALIDATED' || signalement.status === 'REJECTED' ? 'current' : 'pending') },
  ];

  const nodeSpacing = (contentWidth - 20) / 3;
  let timelineX = margin + 10;
  const timelineY = yPos + 4;

  doc.setDrawColor('#e2e8f0');
  doc.setLineWidth(1);
  doc.line(timelineX, timelineY, timelineX + (nodeSpacing * 3), timelineY);

  lifecycle.forEach((step, i) => {
    const x = timelineX + (i * nodeSpacing);
    const isDone = step.state === 'done';
    const isCurrent = step.state === 'current';
    const isRejected = step.state === 'rejected';
    
    if (isDone) {
      doc.setFillColor('#22c55e'); // green-500
      doc.circle(x, timelineY, 3.5, 'F');
      doc.setDrawColor('#ffffff');
      doc.setLineWidth(0.8);
      doc.line(x - 1.5, timelineY, x - 0.5, timelineY + 1.5);
      doc.line(x - 0.5, timelineY + 1.5, x + 2, timelineY - 1.5);
    } else if (isRejected) {
      doc.setFillColor('#ef4444'); // red-500
      doc.circle(x, timelineY, 3.5, 'F');
      doc.setDrawColor('#ffffff');
      doc.setLineWidth(0.8);
      doc.line(x - 1.5, timelineY - 1.5, x + 1.5, timelineY + 1.5);
      doc.line(x + 1.5, timelineY - 1.5, x - 1.5, timelineY + 1.5);
    } else if (isCurrent) {
      doc.setFillColor('#2563eb'); // blue-600
      doc.circle(x, timelineY, 3.5, 'F');
      doc.setFillColor('#ffffff');
      doc.circle(x, timelineY, 1.5, 'F');
    } else {
      doc.setFillColor('#f8fafc'); // slate-50
      doc.setDrawColor('#cbd5e1'); // slate-300
      doc.setLineWidth(0.8);
      doc.circle(x, timelineY, 3.5, 'FD');
    }
    
    doc.setFontSize(8);
    doc.setFont('helvetica', isCurrent || isDone || isRejected ? 'bold' : 'normal');
    doc.setTextColor('#0f172a');
    doc.text(step.label, x, timelineY + 8, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor('#64748b');
    doc.text(step.date, x, timelineY + 12, { align: 'center' });
  });

  yPos += 22;

  // 6. ACCOMPAGNEMENTS
  const orgs = signalement.assignedTo?.filter(a => a.type !== 'SUP') || [];
  if (orgs.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(11);
    doc.setTextColor('#0f172a');
    doc.setFont('helvetica', 'bold');
    doc.text('ACCOMPAGNEMENTS', margin, yPos);
    yPos += 2;

    const orgRows = orgs.map(assignment => {
      const org = assignment.organization;
      if (!org) return null;
      return [
        org.category === 'JURIDIQUE' ? 'Juridique' : org.category === 'PSYCHIQUE' ? 'Psychique' : org.category,
        org.name,
        formatDate(assignment.createdAt).split(' ')[0],
        getStatusLabel(assignment.status),
        formatDate(assignment.processedAt).split(' ')[0],
        formatDate(assignment.closedAt).split(' ')[0],
        displayValue(assignment.reason)
      ];
    }).filter(Boolean) as string[][];

    if (orgRows.length > 0) {
      autoTable(doc, {
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 7, textColor: '#0f172a', lineColor: '#e2e8f0', lineWidth: 0.1 },
        headStyles: { fillColor: '#f8fafc', textColor: '#64748b', fontStyle: 'bold' },
        head: [['Type', 'Organisation', "Date d'envoi", 'État', 'Date traitement', 'Date clôture', 'Motif']],
        body: orgRows,
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;
    }
  }

  // 7. RAPPORTS PLATEFORMES
  if (signalement.platforms && signalement.platforms.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(11);
    doc.setTextColor('#0f172a');
    doc.setFont('helvetica', 'bold');
    doc.text('RAPPORTS PLATEFORMES', margin, yPos);
    yPos += 2;

    const platformRows = signalement.platforms.map(report => [
      report.platform?.name || '—',
      getStatusLabel(report.status),
      formatDate(report.createdAt).split(' ')[0],
      displayValue(report.emailTo),
      displayValue(report.emailSubject)
    ]);

    autoTable(doc, {
      startY: yPos,
      theme: 'grid',
      styles: { fontSize: 7, textColor: '#0f172a', lineColor: '#e2e8f0', lineWidth: 0.1 },
      headStyles: { fillColor: '#f8fafc', textColor: '#64748b', fontStyle: 'bold' },
      head: [['Plateforme', 'Statut', "Date d'envoi", 'Destinataire', 'Objet']],
      body: platformRows,
    });
    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  // 8. CONTENUS SIGNALÉS
  if (signalement.reportedItems && signalement.reportedItems.length > 0) {
    checkPageBreak(30);
    doc.setFontSize(11);
    doc.setTextColor('#0f172a');
    doc.setFont('helvetica', 'bold');
    doc.text('CONTENUS SIGNALÉS', margin, yPos);
    yPos += 4;

    for (const item of signalement.reportedItems) {
      let cardHeight = 12; // Base height for title
      
      let urlLines: string[] = [];
      if (item.contentUrl) {
        urlLines = doc.splitTextToSize(item.contentUrl, contentWidth - 8);
        cardHeight += 4 + (urlLines.length * 3.5);
      }
      
      let descLines: string[] = [];
      if (item.description) {
        descLines = doc.splitTextToSize(item.description, contentWidth - 8);
        cardHeight += 4 + (descLines.length * 3.5);
      }
      
      let hasImage = false;
      let imgW = 0, imgH = 0;
      let imgData: HTMLImageElement | null = null;
      
      if (item.screenshots && item.screenshots.length > 0 && item.screenshots[0].imageUrl) {
        try {
          imgData = await loadImage(item.screenshots[0].imageUrl);
          hasImage = true;
          imgW = imgData.width;
          imgH = imgData.height;
          // Max width/height for thumbnail inside card
          if (imgW > 80) { imgH = (80 * imgH) / imgW; imgW = 80; }
          if (imgH > 80) { imgW = (80 * imgW) / imgH; imgH = 80; }
          cardHeight += imgH + 4;
        } catch (e) {
           console.error("Screenshot load error");
        }
      }
      
      cardHeight += 4; // bottom padding
      checkPageBreak(cardHeight + 5);
      
      doc.setDrawColor('#e2e8f0');
      doc.setFillColor('#ffffff');
      doc.roundedRect(margin, yPos, contentWidth, cardHeight, 1, 1, 'FD');
      
      let currentY = yPos + 5;
      
      // Top row: Platform & Type
      doc.setFontSize(9);
      doc.setTextColor('#2563eb');
      doc.setFont('helvetica', 'bold');
      doc.text((item.platform?.name || 'Inconnu').toUpperCase(), margin + 4, currentY);
      
      doc.setFontSize(7);
      doc.setTextColor('#64748b');
      const typeLabel = getContentTypeLabel(item.type).toUpperCase();
      doc.text(typeLabel, margin + contentWidth - 4, currentY, { align: 'right' });
      
      currentY += 6;
      
      if (item.contentUrl) {
        doc.setFontSize(7);
        doc.setTextColor('#64748b');
        doc.setFont('helvetica', 'bold');
        doc.text('Lien du contenu :', margin + 4, currentY);
        currentY += 4;
        
        doc.setFontSize(8);
        doc.setTextColor('#0f172a');
        doc.setFont('helvetica', 'normal');
        doc.text(urlLines, margin + 4, currentY);
        currentY += (urlLines.length * 3.5) + 1;
      }
      
      if (item.description) {
        doc.setFontSize(7);
        doc.setTextColor('#64748b');
        doc.setFont('helvetica', 'bold');
        doc.text('Description :', margin + 4, currentY);
        currentY += 4;
        
        doc.setFontSize(8);
        doc.setTextColor('#0f172a');
        doc.setFont('helvetica', 'normal');
        doc.text(descLines, margin + 4, currentY);
        currentY += (descLines.length * 3.5) + 1;
      }
      
      if (hasImage && imgData) {
        currentY += 2;
        doc.addImage(imgData, 'JPEG', margin + 4, currentY, imgW, imgH);
      }
      
      yPos += cardHeight + 4;
    }
  }

  applyConfidentialFooter(doc, margin);

  doc.save(`EMC-HELPLINE_${reference}.pdf`);
};

const getTitulaireLabel = (titulaire?: string | null) => {
  if (titulaire === 'MOI_MEME') return 'Oui';
  if (titulaire === 'AUTRE_PERSONNE') return 'Non';
  return '—';
};

const getApprobationLabel = (signalement: Signalement) => {
  if (signalement.status === 'VALIDATED' || signalement.validate?.some((v) => v.status === 'APPROVED')) {
    return 'Validé';
  }
  if (signalement.status === 'REJECTED' || signalement.validate?.some((v) => v.status === 'REJECTED')) {
    return 'Rejeté';
  }
  return 'En attente';
};

export const generateSignalementsListPDF = async (signalements: Signalement[]) => {
  const doc = new jsPDF({ orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let yPos = margin;
  const contentWidth = pageWidth - 2 * margin;

  let logoImg: HTMLImageElement | null = null;
  try {
    logoImg = await loadImage(logoLightmode);
  } catch (e) {
    console.error('Could not load logo for PDF', e);
  }

  if (logoImg) {
    const logoW = 35;
    const logoH = (logoW * logoImg.height) / logoImg.width;
    doc.addImage(logoImg, 'PNG', margin, yPos, logoW, logoH);
  }

  doc.setFontSize(16);
  doc.setTextColor(PDF_COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('GESTION DES SIGNALEMENTS', margin + 45, yPos + 6);

  doc.setFontSize(9);
  doc.setTextColor(PDF_COLORS.slate);
  doc.setFont('helvetica', 'normal');
  doc.text('Liste des signalements', margin + 45, yPos + 11);

  const rightAlign = pageWidth - margin;
  doc.setFontSize(8);
  doc.setTextColor(PDF_COLORS.blue);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENT CONFIDENTIEL', rightAlign, yPos + 6, { align: 'right' });

  const genDate = new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date());
  doc.setFontSize(8);
  doc.setTextColor(PDF_COLORS.slate);
  doc.setFont('helvetica', 'normal');
  doc.text(`Généré le : ${genDate}`, rightAlign, yPos + 11, { align: 'right' });

  yPos = Math.max(yPos + (logoImg ? (35 * logoImg.height) / logoImg.width : 15), yPos + 12) + 6;

  doc.setDrawColor(PDF_COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 8;

  doc.setFontSize(11);
  doc.setTextColor(PDF_COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ', margin, yPos);
  yPos += 5;

  const statusCounts: Record<string, number> = {
    PENDING: 0,
    IN_PROGRESS: 0,
    VALIDATED: 0,
    REJECTED: 0,
    CLOSED: 0,
  };
  for (const sig of signalements) {
    if (sig.status in statusCounts) statusCounts[sig.status] += 1;
  }

  const cards = [
    { label: 'NOMBRE TOTAL', value: String(signalements.length) },
    { label: 'EN ATTENTE', value: String(statusCounts.PENDING), key: 'PENDING' },
    { label: 'EN COURS', value: String(statusCounts.IN_PROGRESS), key: 'IN_PROGRESS' },
    { label: 'VALIDÉS', value: String(statusCounts.VALIDATED), key: 'VALIDATED' },
    { label: 'REJETÉS', value: String(statusCounts.REJECTED), key: 'REJECTED' },
    { label: 'CLÔTURÉS', value: String(statusCounts.CLOSED), key: 'CLOSED' },
  ].filter((card) => !('key' in card) || statusCounts[card.key as string] > 0);

  yPos = drawSummaryCards(doc, cards, margin, yPos, contentWidth);

  doc.setFontSize(11);
  doc.setTextColor(PDF_COLORS.dark);
  doc.setFont('helvetica', 'bold');
  doc.text('LISTE DES SIGNALEMENTS', margin, yPos);
  yPos += 2;

  const body = signalements.map((sig) => [
    sig.reference || (sig.id ? `SIG-${sig.id}` : '—'),
    displayValue(sig.issuer),
    getTitulaireLabel(sig.titulaire),
    displayValue(sig.cyberViolence?.name || sig.otherCyberViolence),
    sig.accompaniments && sig.accompaniments.length > 0
      ? sig.accompaniments.map((a) => a.type).join(', ')
      : '—',
    formatDateOnly(sig.createdAt),
    getStatusLabel(sig.status),
    formatDateOnly(sig.dateAnalyse),
    getApprobationLabel(sig),
    (sig.status === 'VALIDATED' || sig.status === 'REJECTED') && sig.dateApprobation
      ? formatDateOnly(sig.dateApprobation)
      : '—',
  ]);

  autoTable(doc, {
    startY: yPos,
    theme: 'grid',
    styles: {
      fontSize: 7,
      textColor: PDF_COLORS.dark,
      lineColor: PDF_COLORS.border,
      lineWidth: 0.1,
      overflow: 'linebreak',
      cellPadding: 2,
      valign: 'middle',
    },
    headStyles: { fillColor: PDF_COLORS.bg, textColor: PDF_COLORS.slate, fontStyle: 'bold', fontSize: 6.5 },
    margin: { left: margin, right: margin, bottom: margin + 8 },
    head: [[
      'RÉFÉRENCE',
      'ÉMETTEUR',
      'TITULAIRE',
      'CYBERVIOLENCE',
      'ACCOMPAGNEMENT',
      'RÉCEPTION',
      'STATUT',
      'DATE D’ANALYSE',
      'APPROBATION',
      'DATE D’APPROBATION',
    ]],
    body,
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      if (data.column.index === 6) {
        const status = signalements[data.row.index]?.status;
        const rgb = status ? STATUS_TEXT_COLORS[status] : undefined;
        if (rgb) data.cell.styles.textColor = rgb;
        data.cell.styles.fontStyle = 'bold';
      }
      if (data.column.index === 8) {
        const label = String(data.cell.raw ?? '');
        if (label === 'Validé') data.cell.styles.textColor = STATUS_TEXT_COLORS.VALIDATED;
        if (label === 'Rejeté') data.cell.styles.textColor = STATUS_TEXT_COLORS.REJECTED;
        if (label === 'En attente') data.cell.styles.textColor = STATUS_TEXT_COLORS.PENDING;
        data.cell.styles.fontStyle = 'bold';
      }
    },
  });

  applyConfidentialFooter(doc, margin);

  const now = new Date();
  const fileDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  doc.save(`EMC-HELPLINE_Signalements_${fileDate}.pdf`);
};
