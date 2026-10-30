import {Controller, Post, Body,Header,HttpCode} from '@nestjs/common'
import { UsersService } from './users.service'
import { Req,Res } from '@nestjs/common'
import type { Request } from 'express'
import { ApiOperation, ApiOkResponse,ApiTags,ApiBody,} from '@nestjs/swagger'
import { RegisterUserDto, LoginUserDto } from './users.dto'

@ApiTags('Домен пользователей')
@Controller('api/users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
    ) {}

    //регистрация
    @ApiOperation({ summary: 'Регистрация: пароль хешируется bcrypt' })
    @ApiOkResponse({ description: 'Пользователь создан' })
    @ApiBody({ type: RegisterUserDto })
    @Post('registration')
    async registrationUser(@Body() body: {name:string, email:string, password:string}){
        await this.usersService.registrationUser(body.name,body.email,body.password)
        return { message: 'Пользователь зарегистрирован' }
    }

    //login
    @ApiOperation({ summary: 'Точка входа пользователя: сверка введеных логина и пароля' })
    @ApiOkResponse({ description: 'Успешный вход' })
    @ApiBody({ type: LoginUserDto })
    @Post('login')
    @HttpCode(200)
    async login(@Body() body: {email:string,password:string}, @Req() req: Request) {
        const user = await this.usersService.login(body.email,body.password)
        req.session.userId = user.userId
        return { message: 'Вход выполнен', user: { id: user.userId, name: user.name } }
    }

    //logout
    @ApiOperation({ summary: 'Выход из системы' })
    @ApiOkResponse({ description: 'Выход выполнен' })
    @Post('logout')
    async logout(@Req() req: Request) {
        return new Promise((resolve) => {
            req.session.destroy(() => {
                resolve({ message: 'Выход выполнен' })
        })
    })
}
}