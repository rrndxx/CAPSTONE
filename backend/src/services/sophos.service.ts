import path from 'path';
import { parseXMLFile } from '../utils/xmlParser';

export const getAllDevices = async () => {
  const filePath = path.join(__dirname, '..', 'sample_api', 'devices.xml');
  const data = await parseXMLFile(filePath);
  return data.Devices.Device || [];
};
