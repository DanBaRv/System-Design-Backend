import {Controller, Post, Body,} from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    //регистрация
    @Post('registration')
    async registrationUser(@Body() body: {name:string, email:string, password:string}){
        await this.usersService.registrationUser(body.name,body.email,body.password)
        return { message: 'Пользователь зарегистрирован' }
    }

    //аутентификация
    @Post('auth')
    async authUser(@Body() body: {email:string,password:string}){
        return await this.usersService.authUser(body.email,body.password)
    }

    //деаутентификация
    @Post('logout')
    async logout() {
        return { message: 'Деавторизация будет реализована в ЛР4' }
    }
}