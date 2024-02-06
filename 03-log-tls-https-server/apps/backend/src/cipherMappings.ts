import csv from "csv-parser";
import { TlsCipherSuiteDTO } from "lib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

type CsvHeaders = keyof TlsCipherSuiteDTO;

type CipherMap = Map<number, TlsCipherSuiteDTO>;

export async function getCipherMappings() {
  return new Promise<CipherMap>((resolve) => {
    const cipherMap: CipherMap = new Map();
    fs.createReadStream(path.join(__dirname, "data", "iana_tls_cipher_suites.csv"))
      .pipe(
        csv({
          mapHeaders: ({ header }) => (header != "DTLS-OK" ? header.toLowerCase() : null),
          mapValues: ({ header, index, value }) => {
            switch (header as CsvHeaders) {
              case "value":
                return Buffer.from(value.split(","));
              case "description":
                return value;
              case "recommended":
                return value === "Y" ? true : value === "N" ? false : null;
              case "reference":
                return value;
              default:
                break;
            }
          },
        })
      )
      .on("data", (data: TlsCipherSuite) => {
        cipherMap.set(data.value.readUInt16BE(0), data);
      })
      .on("end", () => {
        resolve(cipherMap);
      });
  });
}
