import { GroupService } from '../../BLL/Services/GroupService';
import { StudentService } from '../../BLL/Services/StudentService';
import { ConsoleHelper } from '../ConsoleHelper';

export class GroupMenuHandler {
  constructor(
    private groupService: GroupService,
    private studentService: StudentService
  ) {}

  async showMenu(): Promise<void> {
    let exit = false;

    while (!exit) {
      try {
        ConsoleHelper.clear();
        ConsoleHelper.printHeader('УПРАВЛІННЯ ГРУПАМИ');
        
        ConsoleHelper.printMenu([
          'Додати групу',
          'Переглянути всі групи',
          'Переглянути групу',
          'Редагувати групу',
          'Видалити групу',
          'Додати студента до групи',
          'Видалити студента з групи',
          'Переглянути студентів групи'
        ]);

        const choice = ConsoleHelper.readChoice(8);

        switch (choice) {
          case 0:
            exit = true;
            break;
          case 1:
            await this.addGroup();
            break;
          case 2:
            await this.viewAllGroups();
            break;
          case 3:
            await this.viewGroup();
            break;
          case 4:
            await this.editGroup();
            break;
          case 5:
            await this.deleteGroup();
            break;
          case 6:
            await this.addStudentToGroup();
            break;
          case 7:
            await this.removeStudentFromGroup();
            break;
          case 8:
            await this.viewGroupStudents();
            break;
        }
      } catch (error: any) {
        ConsoleHelper.printError(error.message);
        ConsoleHelper.waitForKey();
      }
    }
  }

  private async addGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ДОДАТИ ГРУПУ');

    const name = ConsoleHelper.readString('Назва групи');
    const specialization = ConsoleHelper.readString('Спеціалізація');
    const year = ConsoleHelper.readNumber('Курс', 1, 6);

    const group = await this.groupService.createGroup(name, specialization, year);

    ConsoleHelper.printSuccess(`Групу ${group.name} успішно додано!`);
    ConsoleHelper.waitForKey();
  }

  private async viewAllGroups(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('СПИСОК ГРУП');

    const groups = await this.groupService.getAllGroups();

    if (groups.length === 0) {
      ConsoleHelper.printInfo('Немає груп');
    } else {
      const headers = ['ID', 'Назва', 'Спеціалізація', 'Курс', 'Кількість студентів'];
      const rows = groups.map(g => [
        g.id.substring(0, 8),
        g.name,
        g.specialization,
        g.year.toString(),
        g.getStudentCount().toString()
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього груп: ${groups.length}`);
    }

    ConsoleHelper.waitForKey();
  }

  private async viewGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ПЕРЕГЛЯНУТИ ГРУПУ');

    const id = ConsoleHelper.readString('ID групи');
    const group = await this.groupService.getGroupById(id);

    console.log(`\nID: ${group.id}`);
    console.log(`Назва: ${group.name}`);
    console.log(`Спеціалізація: ${group.specialization}`);
    console.log(`Курс: ${group.year}`);
    console.log(`Кількість студентів: ${group.getStudentCount()}`);

    ConsoleHelper.waitForKey();
  }

  private async editGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('РЕДАГУВАТИ ГРУПУ');

    const id = ConsoleHelper.readString('ID групи');
    const group = await this.groupService.getGroupById(id);

    console.log(`\nПоточні дані: ${group.name}\n`);

    const name = ConsoleHelper.readString('Нова назва', true) || group.name;
    const specialization = ConsoleHelper.readString('Нова спеціалізація', true) || group.specialization;
    const yearInput = ConsoleHelper.readString('Новий курс (1-6)', true);
    const year = yearInput ? parseInt(yearInput, 10) : group.year;

    await this.groupService.updateGroup(id, name, specialization, year);

    ConsoleHelper.printSuccess('Групу успішно оновлено!');
    ConsoleHelper.waitForKey();
  }

  private async deleteGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ВИДАЛИТИ ГРУПУ');

    const id = ConsoleHelper.readString('ID групи');
    const group = await this.groupService.getGroupById(id);

    console.log(`\n${group.name} (${group.getStudentCount()} студентів)`);

    if (ConsoleHelper.confirm('\nВи впевнені, що хочете видалити цю групу?')) {
      await this.groupService.deleteGroup(id);
      ConsoleHelper.printSuccess('Групу успішно видалено!');
    } else {
      ConsoleHelper.printInfo('Видалення скасовано');
    }

    ConsoleHelper.waitForKey();
  }

  private async addStudentToGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ДОДАТИ СТУДЕНТА ДО ГРУПИ');

    const groupId = ConsoleHelper.readString('ID групи');
    const studentId = ConsoleHelper.readString('ID студента');

    await this.groupService.addStudentToGroup(groupId, studentId);

    ConsoleHelper.printSuccess('Студента успішно додано до групи!');
    ConsoleHelper.waitForKey();
  }

  private async removeStudentFromGroup(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ВИДАЛИТИ СТУДЕНТА З ГРУПИ');

    const groupId = ConsoleHelper.readString('ID групи');
    const studentId = ConsoleHelper.readString('ID студента');

    await this.groupService.removeStudentFromGroup(groupId, studentId);

    ConsoleHelper.printSuccess('Студента успішно видалено з групи!');
    ConsoleHelper.waitForKey();
  }

  private async viewGroupStudents(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('СТУДЕНТИ ГРУПИ');

    const id = ConsoleHelper.readString('ID групи');
    const group = await this.groupService.getGroupById(id);
    const students = await this.groupService.getGroupStudents(id);

    console.log(`\nГрупа: ${group.name}`);
    console.log(`Спеціалізація: ${group.specialization}`);
    console.log(`Курс: ${group.year}\n`);

    if (students.length === 0) {
      ConsoleHelper.printInfo('У групі немає студентів');
    } else {
      const headers = ['ID', 'Прізвище', 'Ім\'я', 'По батькові'];
      const rows = students.map(s => [
        s.id.substring(0, 8),
        s.lastName,
        s.firstName,
        s.middleName
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього студентів: ${students.length}`);
    }

    ConsoleHelper.waitForKey();
  }
}