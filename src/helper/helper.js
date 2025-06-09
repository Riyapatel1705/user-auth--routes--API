import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export const createPdfBuffer = async ({ userName, event }) => {
  if (!userName || !event) {
    console.error("Missing userName or event data in createPdfBuffer:", { userName, event });
    return null;
  }

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 720;

  const draw = (text, x = 50, size = 12, isBold = false, spacing = 25) => {
    page.drawText(text, {
      x,
      y,
      size,
      font: isBold ? boldFont : font,
      color: rgb(0.15, 0.15, 0.15),
    });
    y -= spacing;
  };

  draw('Event Bookmark Confirmation', 50, 16, true, 30);
  draw(`Hi ${userName.split(' ')[0]},`, 50, 13);
  draw(`Thank you for bookmarking the event.`, 50, 12);
  y -= 15;
  draw(`Event Details:`, 50, 13, true, 20);

  draw(`Name: ${event.name || 'N/A'}`);
  draw(`Category: ${event.category || 'N/A'}`);
  draw(`Start Date: ${event.start_date || 'N/A'}`);
  draw(`End Date: ${event.end_date || 'N/A'}`);
  draw(`Virtual: ${event.is_virtual ? 'Yes' : 'No'}`);

  const address = [event.address, event.city, event.state, event.postal_code].filter(Boolean).join(', ');
  draw(`Address: ${address || 'N/A'}`);
  draw(`Organization: ${event.organization_name || 'N/A'}`);
  draw(`Price: $${event.price ?? 'Free'}`);

  draw(`Contact:`, 50, 12, true, 20);
  draw(event.formatted_contact || 'N/A', 60, 10, false, 15);

  draw(`Description:`, 50, 12, true, 20);
  draw(event.short_description || 'No description provided.', 60, 11, false, 40);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
};
