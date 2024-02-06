import csv from "csv-parser";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface TlsCipherSuite {
  value: Buffer;
  description: string;
  recommended: boolean | null;
  reference: string;
}

// TODO:  Report issue, mapped header to null should not move further through the pipe, as seen in
//        mapValues case statement for value null.
type ParsedCsvHeaders = "value" | "description" | "recommended" | "reference" | null;

type TlsCipherSuiteMap = Map<number, TlsCipherSuite>;

export async function getCipherMappings() {
  return new Promise<TlsCipherSuiteMap>((resolve) => {
    const cipherMap: TlsCipherSuiteMap = new Map();

    // Parse csv, normalize headers and data, strip not-needed columns
    fs.createReadStream(path.join(__dirname, "data", "iana_tls_cipher_suites.csv"))
      .pipe(
        csv({
          mapHeaders: ({ header }) => (header != "DTLS-OK" ? header.toLowerCase() : null),
          mapValues: ({ header, value }) => {
            switch (header as ParsedCsvHeaders) {
              case "value":
                // Convert the cipher-hex-value format (provied by iana in the csv) into Buffer
                // Buffer.from("0x13,0x01".split(","));
                // <Buffer 13 01>
                return Buffer.from(value.split(","));
              case "description":
                return value;
              case "recommended":
                return value === "Y" ? true : value === "N" ? false : null;
              case "reference":
                return value;
              case null:
                return null;
              default:
                throw new Error(`Unkonwn csv header value received! (Header: ${header})`);
            }
          },
        })
      )
      .on("data", (data: TlsCipherSuite) => {
        // VALIDATE DATA HERE TO MATCH TYPE
        // THIS IS A CRITICAL RUNTIME ERROR, WHICH TYPESCRIPT IS NOT CATCHING
        // Convert the Buffer (two-byte-array, [UInt8, UInt8]) into number of type `UInt16BE`
        cipherMap.set(data.value.readUInt16BE(0), data);
      })
      .on("end", () => {
        resolve(cipherMap);
      });
  });
}
