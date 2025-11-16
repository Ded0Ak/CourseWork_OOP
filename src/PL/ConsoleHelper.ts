import * as readlineSync from "readline-sync";

export class ConsoleHelper {
  static clear(): void {
    console.clear();
  }

  static printHeader(title: string): void {
    console.log("\n");
    console.log(`  ${title}`);
  }

  static printMenu(options: string[]): void {
    options.forEach((option, index) => {
      console.log(`${index + 1}. ${option}`);
    });
    console.log("0. Вихід / Назад\n");
  }

  static readChoice(max: number): number {
    const input = readlineSync.question("Ваш вибір: ");
    const choice = parseInt(input, 10);

    if (isNaN(choice) || choice < 0 || choice > max) {
      throw new Error("Невірний вибір");
    }

    return choice;
  }

  static readString(prompt: string, allowEmpty: boolean = false): string {
    const input = readlineSync.question(`${prompt}: `);

    if (!allowEmpty && (!input || input.trim().length === 0)) {
      throw new Error("Значення не може бути порожнім");
    }

    return input.trim();
  }

  static readNumber(prompt: string, min?: number, max?: number): number {
    const input = readlineSync.question(`${prompt}: `);
    const number = parseInt(input, 10);

    if (isNaN(number)) {
      throw new Error("Невірне число");
    }

    if (min !== undefined && number < min) {
      throw new Error(`Число повинно бути не менше ${min}`);
    }

    if (max !== undefined && number > max) {
      throw new Error(`Число повинно бути не більше ${max}`);
    }

    return number;
  }

  static readDate(prompt: string): Date {
    const input = readlineSync.question(`${prompt} (YYYY-MM-DD): `);
    const date = new Date(input);

    if (isNaN(date.getTime())) {
      throw new Error("Невірний формат дати");
    }

    return date;
  }

  static printSuccess(message: string): void {
    console.log(`\n ${message}\n`);
  }

  static printError(message: string): void {
    console.log(`\n Помилка: ${message}\n`);
  }

  static printInfo(message: string): void {
    console.log(`\n ${message}\n`);
  }

  static printTable(headers: string[], rows: string[][]): void {
    const columnWidths = headers.map((header, i) => {
      const maxRowWidth = Math.max(...rows.map((row) => (row[i] || "").length));
      return Math.max(header.length, maxRowWidth);
    });

    const separator =
      "+" + columnWidths.map((w) => "-".repeat(w + 2)).join("+") + "+";

    console.log(separator);
    console.log(
      "| " + headers.map((h, i) => h.padEnd(columnWidths[i])).join(" | ") + " |"
    );
    console.log(separator);

    rows.forEach((row) => {
      console.log(
        "| " +
          row
            .map((cell, i) => (cell || "").padEnd(columnWidths[i]))
            .join(" | ") +
          " |"
      );
    });

    console.log(separator);
  }

  static waitForKey(): void {
    readlineSync.question("\nНатисніть Enter для продовження...");
  }

  static confirm(message: string): boolean {
    const answer = readlineSync.question(`${message} (y/n): `).toLowerCase();
    return (
      answer === "y" || answer === "yes" || answer === "так" || answer === "т"
    );
  }
}
