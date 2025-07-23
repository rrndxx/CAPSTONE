import fs from 'fs/promises';
import { XMLParser } from 'fast-xml-parser';

export const parseXMLFile = async (filePath: string) => {
  try {
    const xmlData = await fs.readFile(filePath, 'utf-8');
    const parser = new XMLParser();
    const jsonData = parser.parse(xmlData);
    return jsonData;
  } catch (error) {
    console.error('❌ Failed to parse XML:', error);
    throw error;
  }
};
