import type { PrismaClient } from "@prisma/client";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import type { Response } from "express";

export class ReportsExport {
    constructor(private db: PrismaClient) { }

    async exportToCSV(model: string, res: Response) {
        const modelAccessor = (this.db as any)[model];
        if (!modelAccessor) throw new Error(`Model ${model} not found in Prisma schema`);

        const data = await modelAccessor.findMany();

        if (!data || data.length === 0) {
            res.status(404).json({ error: `No data found for model ${model}` });
            return;
        }

        const parser = new Parser();
        const csv = parser.parse(data);

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", `attachment; filename=${model}.csv`);
        res.send(csv); // send here
    }


    async exportToPDF(model: string, res: Response) {
        const modelAccessor = (this.db as any)[model];
        if (!modelAccessor) throw new Error(`Model ${model} not found in Prisma schema`);

        const data = await modelAccessor.findMany();
        if (!data || data.length === 0) {
            res.status(404).json({ error: `No data found for model ${model}` });
            return;
        }

        const keys = Object.keys(data[0]);

        // 🔥 Auto-layout: portrait for small tables, landscape for wide ones
        const layout = keys.length > 10 ? "landscape" : "portrait";

        const doc = new PDFDocument({ margin: 40, size: "A4", layout });
        res.setHeader("Content-Disposition", `attachment; filename=${model}.pdf`);
        res.setHeader("Content-Type", "application/pdf");
        doc.pipe(res);

        // === TITLE ===
        doc.fontSize(18).text(`${model} Report`, { align: "center" });
        doc.moveDown(2);

        const tableTop = doc.y;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const colWidth = pageWidth / keys.length;
        const rowHeight = 22;

        // 🔥 Dynamic font sizing
        let headerFontSize = 8;
        let bodyFontSize = 7;

        if (keys.length > 8) {
            headerFontSize = 7;
            bodyFontSize = 6;
        }
        if (keys.length > 12) {
            headerFontSize = 6;
            bodyFontSize = 5;
        }

        // === HEADER ===
        const drawHeader = (y: number) => {
            doc.fillColor("#7D6EE8").rect(doc.page.margins.left, y, pageWidth, rowHeight).fill();

            doc.fillColor("white").font("Helvetica-Bold").fontSize(headerFontSize);
            keys.forEach((key, i) => {
                const x = doc.page.margins.left + i * colWidth + 2;
                doc.text(key, x, y + 6, { width: colWidth - 4, align: "left" });
            });

            doc.fillColor("black");
        };

        drawHeader(tableTop);
        let y = tableTop + rowHeight;

        doc.font("Helvetica").fontSize(bodyFontSize);

        // === ROWS ===
        data.forEach((record: any, rowIndex: number) => {
            // Alternating row background
            if (rowIndex % 2 === 0) {
                doc.fillColor("#F2F2F7")
                    .rect(doc.page.margins.left, y, pageWidth, rowHeight)
                    .fill();
                doc.fillColor("black");
            }

            keys.forEach((key, i) => {
                const x = doc.page.margins.left + i * colWidth + 2;
                const value = String(record[key] ?? "");

                doc.text(value, x, y + 6, { width: colWidth - 4, height: rowHeight - 4, ellipsis: true });
            });

            y += rowHeight;

            // Handle page break
            if (y > doc.page.height - doc.page.margins.bottom - rowHeight) {
                doc.addPage({ layout });
                y = doc.page.margins.top;
                drawHeader(y);
                y += rowHeight;
            }
        });

        doc.end();
    }

}
