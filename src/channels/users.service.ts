import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './userChannel.entity'
import { ConflictException } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}


//Регистрация
//1) Приходят name, email, password
//2) Проверяем: если email уже существует => ошибка
//3) Если email не сущ. => userRepo.save

    async registrationUser(name:string, email:string, password:string) : Promise <void> {
        //существует ли email
        const existing = await this.userRepository.findOneBy({
            email : email
        })
        if (!existing) {
            await this.userRepository.save({
                name,
                email : email,
                password : password
            })
        } else {
            throw new ConflictException('Email уже занят')
        }
    }
//авторизация
//получаем email password
//найти эти данные в бд
//если данные найдены вывести добро пожаловать
//не найдены выкинут ошибку данных
    async authUser(email:string,password:string) : Promise <{ message: string }> {
        const existing = await this.userRepository.findOneBy({
            email : email,
            password: password
        })

        if (!existing) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        return ({message : "Корректный вход"})
    }   
}