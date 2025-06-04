import { Event } from "../db/models/Event.js";

export const createPdfBuffer = async ({ userName, event }) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 750]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let y = 700;
  const draw = (text, x = 50, size = 12) => {
    page.drawText(text, { x, y, size, font, color: rgb(0.2, 0.2, 0.2) });
    y -= 25;
  };
  const firstName=userName

  draw(`Hi ${userName.name},`);
  draw(`You successfully bookmarked the following event:`);
  y -= 10;

  draw(`Event Name: ${event.name}`);
  draw(`Category: ${event.category}`);
  draw(`Start Date: ${event.start_date}`);
  draw(`End Date: ${event.end_date}`);
  draw(`Virtual: ${event.is_virtual ? 'Yes' : 'No'}`);
  draw(`Address: ${event.address}, ${event.city || ''}, ${event.state || ''} - ${event.postal_code || ''}`);
  draw(`Organization: ${event.organization_name || 'N/A'}`);
  draw(`Price: $${event.price}`);
  draw(`Contact: ${JSON.stringify(event.contact_details)}`);
  draw(`Description: ${event.short_description || 'No description provided.'}`);

  const pdfBytes = await pdfDoc.saveAsBase64();
  return Buffer.from(pdfBytes);
};
