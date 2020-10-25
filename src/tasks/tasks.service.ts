import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './task.model';
import { v1 as uuid } from 'uuid';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';

@Injectable()
export class TasksService {
  private tasks: Task[] = [];

  getAllTasks(): Task[] {
    return this.tasks;
  }

  getTaskWithFilter(filterDto: GetTasksFilterDto): Task[] {
    const { status, search } = filterDto;
    
    let tasks = this.getAllTasks();
    if(status) {
      tasks = tasks.filter(task => task.status === status);
    }
    if(search) {
      tasks = tasks.filter(task => 
        task.title.includes(search) || 
        task.description.includes(search)
      );
    }
    return tasks;
  }

  getTaskById(id: string): Task {
    return this.tasks.find(task => task.id === id);
  }

  createTask(createTaskDto: CreateTaskDto): Task {
    const { title, description } = createTaskDto;
    const task: Task = {
      id: uuid(),
      title,
      description,
      status: TaskStatus.OPEN,
    };

    this.tasks.push(task);

    return task;
  }

  deleteTaskById(id: string): boolean {
    let deleted = false;
    this.tasks.forEach((task, index, arr) => {
      if(task.id === id) {
        arr.splice(index, 1);
        deleted = true;
      }
    })

    return deleted;
  }

  updateTaskStatus(id: string, status: TaskStatus): Task {
    const task = this.getTaskById(id);
    task.status = status;

    return task;
  }
}
