import { DormitoryService } from '../../BLL/Services/DormitoryService';
import { ConsoleHelper } from '../ConsoleHelper';

export class DormitoryMenuHandler {
  constructor(private dormitoryService: DormitoryService) {}

  async showMenu(): Promise<void> {
    let exit = false;

    while (!exit) {
      try {
        ConsoleHelper.clear();
        ConsoleHelper.printHeader('УПРАВЛІННЯ ГУРТОЖИТКОМ');
        
        ConsoleHelper.printMenu([
          'Додати гуртожиток',
          'Переглянути гуртожитки',
          'Додати кімнату',
          'Переглянути кімнати',
          'Поселити студента',
          'Виписати студента',
          'Переглянути мешканців кімнати',
          'Переглянути всіх мешканців',
          'Інформація про вільні місця'
        ]);

        const choice = ConsoleHelper.readChoice(9);

        switch (choice) {
          case 0:
            exit = true;
            break;
          case 1:
            await this.addDormitory();
            break;
          case 2:
            await this.viewDormitories();
            break;
          case 3:
            await this.addRoom();
            break;
          case 4:
            await this.viewRooms();
            break;
          case 5:
            await this.checkInStudent();
            break;
          case 6:
            await this.checkOutStudent();
            break;
          case 7:
            await this.viewRoomResidents();
            break;
          case 8:
            await this.viewAllResidents();
            break;
          case 9:
            await this.viewAvailableSpaces();
            break;
        }
      } catch (error: any) {
        ConsoleHelper.printError(error.message);
        ConsoleHelper.waitForKey();
      }
    }
  }

  private async addDormitory(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ДОДАТИ ГУРТОЖИТОК');

    const name = ConsoleHelper.readString('Назва гуртожитку');
    const address = ConsoleHelper.readString('Адреса');

    const dormitory = await this.dormitoryService.createDormitory(name, address);

    ConsoleHelper.printSuccess(`Гуртожиток ${dormitory.name} успішно додано!`);
    ConsoleHelper.waitForKey();
  }

  private async viewDormitories(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('СПИСОК ГУРТОЖИТКІВ');

    const dormitories = await this.dormitoryService.getAllDormitories();

    if (dormitories.length === 0) {
      ConsoleHelper.printInfo('Немає гуртожитків');
    } else {
      const headers = ['ID', 'Назва', 'Адреса', 'Кількість кімнат'];
      const rows = dormitories.map(d => [
        d.id,
        d.name,
        d.address,
        d.getRoomCount().toString()
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього гуртожитків: ${dormitories.length}`);
    }

    ConsoleHelper.waitForKey();
  }

  private async addRoom(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ДОДАТИ КІМНАТУ');

    const dormitoryId = ConsoleHelper.readString('ID гуртожитку');
    const roomNumber = ConsoleHelper.readString('Номер кімнати');
    const floor = ConsoleHelper.readNumber('Поверх', 1);
    const maxCapacity = ConsoleHelper.readNumber('Максимальна кількість мешканців', 1);

    const room = await this.dormitoryService.createRoom(
      dormitoryId,
      roomNumber,
      floor,
      maxCapacity
    );

    ConsoleHelper.printSuccess(`Кімнату ${room.roomNumber} успішно додано!`);
    ConsoleHelper.waitForKey();
  }

  private async viewRooms(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('КІМНАТИ ГУРТОЖИТКУ');

    const dormitoryId = ConsoleHelper.readString('ID гуртожитку');
    const dormitory = await this.dormitoryService.getDormitoryById(dormitoryId);
    const rooms = await this.dormitoryService.getDormitoryRooms(dormitoryId);

    console.log(`\nГуртожиток: ${dormitory.name}\n`);

    if (rooms.length === 0) {
      ConsoleHelper.printInfo('Немає кімнат');
    } else {
      const headers = ['ID', 'Номер', 'Поверх', 'Місткість', 'Зайнято', 'Вільно'];
      const rows = rooms.map(r => [
        r.id,
        r.roomNumber,
        r.floor.toString(),
        r.maxCapacity.toString(),
        r.getResidentCount().toString(),
        r.getAvailableSpaces().toString()
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього кімнат: ${rooms.length}`);
    }

    ConsoleHelper.waitForKey();
  }

  private async checkInStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ПОСЕЛИТИ СТУДЕНТА');

    const studentId = ConsoleHelper.readString('ID студента');
    const roomId = ConsoleHelper.readString('ID кімнати');

    await this.dormitoryService.checkInStudent(studentId, roomId);

    ConsoleHelper.printSuccess('Студента успішно поселено!');
    ConsoleHelper.waitForKey();
  }

  private async checkOutStudent(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ВИПИСАТИ СТУДЕНТА');

    const studentId = ConsoleHelper.readString('ID студента');

    if (ConsoleHelper.confirm('\nВи впевнені, що хочете виписати студента?')) {
      await this.dormitoryService.checkOutStudent(studentId);
      ConsoleHelper.printSuccess('Студента успішно виписано!');
    } else {
      ConsoleHelper.printInfo('Виписку скасовано');
    }

    ConsoleHelper.waitForKey();
  }

  private async viewRoomResidents(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('МЕШКАНЦІ КІМНАТИ');

    const roomId = ConsoleHelper.readString('ID кімнати');
    const room = await this.dormitoryService.getRoomById(roomId);
    const residents = await this.dormitoryService.getRoomResidents(roomId);

    console.log(`\nКімната: ${room.roomNumber}`);
    console.log(`Поверх: ${room.floor}`);
    console.log(`Місткість: ${room.maxCapacity}`);
    console.log(`Зайнято: ${room.getResidentCount()}\n`);

    if (residents.length === 0) {
      ConsoleHelper.printInfo('У кімнаті немає мешканців');
    } else {
      const headers = ['ID', 'Прізвище', 'Ім\'я', 'По батькові', 'Телефон'];
      const rows = residents.map(s => [
        s.id,
        s.lastName,
        s.firstName,
        s.middleName,
        s.phone
      ]);

      ConsoleHelper.printTable(headers, rows);
    }

    ConsoleHelper.waitForKey();
  }

  private async viewAllResidents(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ВСІ МЕШКАНЦІ ГУРТОЖИТКУ');

    const dormitoryId = ConsoleHelper.readString('ID гуртожитку');
    const dormitory = await this.dormitoryService.getDormitoryById(dormitoryId);
    const residents = await this.dormitoryService.getAllResidents(dormitoryId);

    console.log(`\nГуртожиток: ${dormitory.name}\n`);

    if (residents.length === 0) {
      ConsoleHelper.printInfo('У гуртожитку немає мешканців');
    } else {
      const headers = ['ID', 'Прізвище', 'Ім\'я', 'По батькові'];
      const rows = residents.map(s => [
        s.id,
        s.lastName,
        s.firstName,
        s.middleName
      ]);

      ConsoleHelper.printTable(headers, rows);
      ConsoleHelper.printInfo(`Всього мешканців: ${residents.length}`);
    }

    ConsoleHelper.waitForKey();
  }

  private async viewAvailableSpaces(): Promise<void> {
    ConsoleHelper.clear();
    ConsoleHelper.printHeader('ІНФОРМАЦІЯ ПРО ВІЛЬНІ МІСЦЯ');

    const dormitoryId = ConsoleHelper.readString('ID гуртожитку');
    const dormitory = await this.dormitoryService.getDormitoryById(dormitoryId);
    const info = await this.dormitoryService.getAvailableSpaces(dormitoryId);

    console.log(`\nГуртожиток: ${dormitory.name}`);
    console.log(`Адреса: ${dormitory.address}\n`);
    console.log(`Всього місць: ${info.totalCapacity}`);
    console.log(`Зайнято: ${info.occupied}`);
    console.log(`Вільно: ${info.available}\n`);

    if (info.rooms.length > 0) {
      const headers = ['Номер кімнати', 'Місткість', 'Вільно'];
      const rows = info.rooms.map(r => [
        r.roomNumber,
        r.capacity.toString(),
        r.available.toString()
      ]);

      ConsoleHelper.printTable(headers, rows);
    }

    ConsoleHelper.waitForKey();
  }
}