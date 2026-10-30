import { Injectable, NotFoundException  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './userChannel.entity'
import { ConflictException } from '@nestjs/common'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'

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
        const existing = await this.userRepository.findOneBy({email})
        if (!existing) {
            const hashedPassword = await bcrypt.hash(String(password), 10) 
            await this.userRepository.save({
                name,
                email : email,
                password : hashedPassword
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
//-> стало -> берем логин ищем по нему, если нет то бан, если есть то с помощью
//compare сравниваем пароль полученный при логине и пароль из бд
    async login(email:string,password:string) : Promise <User> {
        const existing = await this.userRepository.findOneBy({email})

        if (!existing) {
            throw new UnauthorizedException('Неверный email');
        }
//то что ввели сравниваем с тем что в бд
        const isMatch = await bcrypt.compare(password, existing.password)
        if (!isMatch) {
             throw new UnauthorizedException('Неверный пароль');
        }

        return existing
    }   
}