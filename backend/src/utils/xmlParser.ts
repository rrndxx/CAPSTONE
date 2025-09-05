// utils/xmlParser.ts
import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
});

export function parseXml(xml: string) {
    return parser.parse(xml);
}
