import Papa from "papaparse";
import csvDataset from "./dataset.csv";
import { TLog } from "./App";

type CompressedDataEntry = Record<string, number | string>;

export default class FluidDataSourceService {
  static getInstance(log: TLog) {
    return new FluidDataSourceService(log);
  }

  private parsedData: Record<string, number | string | boolean>[];
  private mappedData: Record<string, number | string | boolean>[];

  private log: TLog;

  constructor(log: TLog) {
    this.log = log;
    this.parsedData = [];
    this.mappedData = [];
  }

  async parseData() {
    this.log("Parsing data from csv...");
    try {
      const response = await fetch(csvDataset);
      const csvData = await response.text();

      const output = Papa.parse(csvData, {
        header: true,
        dynamicTyping: true,
      });

      if (output.errors.length !== 0) {
        alert("Invalid csv data found!");
        throw new Error("Invalid csv data found!");
      }
      this.parsedData = output.data as typeof this.parsedData;
      this.log("Parsed data", this.parsedData);
    } catch (error) {
      console.error("Error parsing CSV data:", error);
    }
  }

  mapData({
    categoryKeys,
    valueKeys,
  }: {
    categoryKeys: string[];
    valueKeys: string[];
  }): void {
    this.log(
      `Mapping data for assignedKeys -> categoryKeys - [${categoryKeys.join(
        ", "
      )}] and valueKeys [${valueKeys.join(", ")}]...`
    );

    // Validate that assignedKeys are present in parsedData
    const validAssignedKeys: { key: string; type: "category" | "value" }[] = [];
    categoryKeys.forEach((key) => {
      if (this.parsedData[0].hasOwnProperty(key)) {
        validAssignedKeys.push({ key, type: "category" });
      }
    });
    valueKeys.forEach((key) => {
      if (this.parsedData[0].hasOwnProperty(key)) {
        validAssignedKeys.push({ key, type: "value" });
      }
    });

    // Map the data according to assignedKeys
    const compressedData: Record<string, CompressedDataEntry> = {};

    this.parsedData.forEach((data) => {
      const compositeKey = categoryKeys.map((key) => data[key]).join("_");

      if (!compressedData[compositeKey]) compressedData[compositeKey] = {};

      validAssignedKeys.forEach(({ key, type }) => {
        if (type === "value" && typeof data[key] === "number") {
          // Sum numeric values
          compressedData[compositeKey][key] =
            ((compressedData[compositeKey][key] || 0) as number) +
            (data[key] as number);
        } else {
          compressedData[compositeKey][key] = data[key] as string;
        }
      });
    });

    // Convert the compressed data to the final array format
    const result: CompressedDataEntry[] = Object.values(compressedData);

    this.mappedData = result;

    this.log("Mapped data", this.mappedData);
  }

  public getMappedData() {
    return this.mappedData;
  }
}
