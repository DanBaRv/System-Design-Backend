import { ApiProperty } from '@nestjs/swagger'

export class RegisterUserDto {
    @ApiProperty({ example: 'Роман', description: 'Имя пользователя' })
    name: string

    @ApiProperty({ example: 'test@mail.ru', description: 'Email (уникальный)' })
    email: string

    @ApiProperty({ example: '12345', description: 'Пароль (будет захеширован)' })
    password: string
}

export class LoginUserDto {
    @ApiProperty({ example: 'test@mail.ru', description: 'Email' })
    email: string

    @ApiProperty({ example: '12345', description: 'Пароль' })
    password: string
}