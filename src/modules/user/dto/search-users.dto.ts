import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { User } from '../schemas/user.schema';

export class SearchUserDTO extends PickType(User, [
  'firstName',
  'lastName',
  'username',
]) {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;


  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  constructor(args?: Partial<SearchUserDTO>) {
    super();
    Object.assign(this, args);
  }
}
