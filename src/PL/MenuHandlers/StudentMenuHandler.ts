import { StudentService } from '../../BLL/Services/StudentService';
import { ConsoleHelper } from '../ConsoleHelper';

export class StudentMenuHandler {
  constructor(private studentService: StudentService) {}

  async showMenu(): Promise<void> {
    let exit = false;

    while (!exit) {
      try {
        ConsoleHelper.clear();
        ConsoleHelper.printHeader('УПРАВЛІННЯ СТУДЕНТАМИ');
        
        ConsoleHelper.printMenu([
          'Додати студента',
          'Переглянути всіх студентів',
          'Переглянути студента',
          'Редагувати студента',
          'Видалити студента',
          'Пошук студента'
        ]);

        const choice = ConsoleHelper.readChoice(6);

        switch (choice) {
          case 0:
            exit = true;
            break;
          case 1:
            await this.addStudent();
            break;
          case 2:
            await this.viewAllStudents();
            break;
          case 3:
            await this.viewStudent();
            break;
          case 4:
            await this.editStudent();
            break;
          case 5:
            await this.deleteStudent();
            break;
          case 6:
            await this.searchStudents();
            break;
        }
      } catch (error: any) {
        ConsoleHelper.printError(error.message);
        ConsoleHelper.waitForKey();
      }
    }
  }

  private async addStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ДОДАТИ СТУДЕНТА');

    const firstName = ConsoleHelper.readString('Ім\'я');
    const lastName = ConsoleHelper.readString('Прізвище');
    const middleName = ConsoleHelper.readString('По батькові');
    const dateOfBirth = ConsoleHelper.readDate('Дата народження');
    const email = ConsoleHelper.readString('Email');
    const phone = ConsoleHelper.readString('Телефон');

    const student = await this.studentService.createStudent(
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      email,
      phone
    );

    ConsoleHelper.printSuccess(`Студента ${student.getFullName()} успішно додано!`);
    ConsoleHelper.waitForKey();
  }

  private async viewAllStudents(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('СПИСОК СТУДЕНТІВ');

    const students = await this.studentService.getAllStudents();

    if (students.length === 0) {
      ConsoleHelper.printInfo('Немає студентів');
    } else {
      const headers = ['ID', 'Прізвище', 'Ім\'я', 'По батькові', 'Email', 'Телефон'];
      const rows = students.map(s => [
        s.id,
        s.lastName,
        s.firstName,
        s.middleName,
        s.email,
        s.phone
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього студентів: ${students.length}`);
    }

    ConsoleHelper.waitForKey();
  }

  private async viewStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ПЕРЕГЛЯНУТИ СТУДЕНТА');

    const id = ConsoleHelper.readString('ID студента');
    const student = await this.studentService.getStudentById(id);

    console.log(`\nID: ${student.id}`);
    console.log(`ПІБ: ${student.getFullName()}`);
    console.log(`Дата народження: ${student.dateOfBirth.toISOString().split('T')[0]}`);
    console.log(`Email: ${student.email}`);
    console.log(`Телефон: ${student.phone}`);
    console.log(`Група: ${student.groupId || 'Не призначено'}`);
    console.log(`Гуртожиток: ${student.dormitoryRoomId || 'Не проживає'}`);

    ConsoleHelper.waitForKey();
  }

  private async editStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('РЕДАГУВАТИ СТУДЕНТА');

    const id = ConsoleHelper.readString('ID студента');
    const student = await this.studentService.getStudentById(id);

    console.log(`\nПоточні дані: ${student.getFullName()}\n`);

    const firstName = ConsoleHelper.readString('Нове ім\'я', true) || student.firstName;
    const lastName = ConsoleHelper.readString('Нове прізвище', true) || student.lastName;
    const middleName = ConsoleHelper.readString('Нове по батькові', true) || student.middleName;
    const email = ConsoleHelper.readString('Новий email', true) || student.email;
    const phone = ConsoleHelper.readString('Новий телефон', true) || student.phone;

    await this.studentService.updateStudent(
      id,
      firstName,
      lastName,
      middleName,
      student.dateOfBirth,
      email,
      phone
    );

    ConsoleHelper.printSuccess('Студента успішно оновлено!');
    ConsoleHelper.waitForKey();
  }

  private async deleteStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ВИДАЛИТИ СТУДЕНТА');

    const id = ConsoleHelper.readString('ID студента');
    const student = await this.studentService.getStudentById(id);

    console.log(`\n${student.getFullName()}`);

    if (ConsoleHelper.confirm('\nВи впевнені, що хочете видалити цього студента?')) {
      await this.studentService.deleteStudent(id);
      ConsoleHelper.printSuccess('Студента успішно видалено!');
    } else {
      ConsoleHelper.printInfo('Видалення скасовано');
    }

    ConsoleHelper.waitForKey();
  }

  private async searchStudents(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ПОШУК СТУДЕНТІВ');

    const query = ConsoleHelper.readString('Введіть ім\'я або прізвище');
    const students = await this.studentService.searchStudents(query);

    if (students.length === 0) {
      ConsoleHelper.printInfo('Студентів не знайдено');
    } else {
      const headers = ['ID', 'Прізвище', 'Ім\'я', 'По батькові', 'Email'];
      const rows = students.map(s => [
        s.id,
        s.lastName,
        s.firstName,
        s.middleName,
        s.email
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Знайдено студентів: ${students.length}`);
    }

    ConsoleHelper.waitForKey();
  }
}