import { JsonRepository } from '../DAL/JsonRepository';
import { Student } from '../BLL/Entities/Student';
import { Group } from '../BLL/Entities/Group';
import { Dormitory } from '../BLL/Entities/Dormitory';
import { DormitoryRoom } from '../BLL/Entities/DormitoryRoom';
import { StudentService } from '../BLL/Services/StudentService';
import { GroupService } from '../BLL/Services/GroupService';
import { DormitoryService } from '../BLL/Services/DormitoryService';
import { StudentMenuHandler } from './MenuHandlers/StudentMenuHandler';
import { GroupMenuHandler } from './MenuHandlers/GroupMenuHandler';
import { DormitoryMenuHandler } from './MenuHandlers/DormitoryMenuHandler';
import { ConsoleHelper } from './ConsoleHelper';

class Application {
  private studentService: StudentService;
  private groupService: GroupService;
  private dormitoryService: DormitoryService;

  private studentMenuHandler: StudentMenuHandler;
  private groupMenuHandler: GroupMenuHandler;
  private dormitoryMenuHandler: DormitoryMenuHandler;

  constructor() {
    const studentRepository = new JsonRepository<Student>('students.json', Student.fromJSON);
    const groupRepository = new JsonRepository<Group>('groups.json', Group.fromJSON);
    const dormitoryRepository = new JsonRepository<Dormitory>('dormitories.json', Dormitory.fromJSON);
    const roomRepository = new JsonRepository<DormitoryRoom>('rooms.json', DormitoryRoom.fromJSON);

    this.studentService = new StudentService(studentRepository);
    this.groupService = new GroupService(groupRepository, studentRepository);
    this.dormitoryService = new DormitoryService(
      dormitoryRepository,
      roomRepository,
      studentRepository
    );

    this.studentMenuHandler = new StudentMenuHandler(this.studentService);
    this.groupMenuHandler = new GroupMenuHandler(this.groupService, this.studentService);
    this.dormitoryMenuHandler = new DormitoryMenuHandler(this.dormitoryService);
  }

  async run(): Promise<void> {
    ConsoleHelper.clear();
    console.log('ЕЛЕКТРОННИЙ ДЕКАНАТ - ОБЛІК СТУДЕНТІВ');
    console.log('\nСистема завантажується...\n');

    await this.delay(1000);

    let exit = false;

    while (!exit) {
      try {
        ConsoleHelper.clear();
        ConsoleHelper.printHeader('ГОЛОВНЕ МЕНЮ');

        ConsoleHelper.printMenu([
          'Управління студентами',
          'Управління групами',
          'Управління гуртожитком'
        ]);

        const choice = ConsoleHelper.readChoice(3);

        switch (choice) {
          case 0:
            if (ConsoleHelper.confirm('\nВи впевнені, що хочете вийти?')) {
              exit = true;
              console.log('\nДо побачення!\n');
            }
            break;
          case 1:
            await this.studentMenuHandler.showMenu();
            break;
          case 2:
            await this.groupMenuHandler.showMenu();
            break;
          case 3:
            await this.dormitoryMenuHandler.showMenu();
            break;
        }
      } catch (error: any) {
        ConsoleHelper.printError(error.message);
        ConsoleHelper.waitForKey();
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const app = new Application();
app.run().catch(error => {
  console.error('Критична помилка:', error);
  process.exit(1);
});