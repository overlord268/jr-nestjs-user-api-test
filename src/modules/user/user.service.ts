import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import { Model } from 'mongoose';
import { MONGO_DB_NAME } from './constants';
import { User, UserDoc } from './schemas/user.schema';

@Injectable()
export class UserService {
  private logger = new Logger(UserService.name);

  constructor(@InjectModel(User.name, MONGO_DB_NAME) private userModel: Model<UserDoc>) {}

  async createUser(user: Partial<User>): Promise<User> {
    const newUser = new this.userModel(user);
    return await newUser.save();
  }

  async searchByFields(fields: Partial<User>): Promise<User> {
     
      const user = await this.userModel.findOne({
        $or: [
          { firstName: fields.firstName },
          { lastName: fields.lastName },
          { username: fields.username },
        ],
      });
      if (!user) {
        throw new NotFoundException ('User Not Found')
      }
      return user;
    
  }

  async deleteUser(_id: string): Promise<User> {
    return await this.userModel.findOneAndDelete({ _id });
  }

  async findByObjectId(_id: string): Promise<User> {
    try {
      const user = await this.userModel.findById(_id);
      return user;
    } catch (e) {
      this.logger.error(e.message);
      return null;
    }
  }

  async findByUserName(username: string): Promise<User> {
    try {
      const foundUser = await this.userModel.findOne({
        username: username
      });
      if (!foundUser) {
        throw new NotFoundException ('User Not Found')
      }
      return foundUser;
    } catch (err) {
      throw new NotFoundException ('Not Found')
    }
  }
  
  async patchUser(_id: string, user: Partial<User>): Promise<User> {
    try {
      const existingUser = await this.userModel.findById(_id);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      if (user.username) {
        existingUser.username = user.username;
      }
      if (user.firstName) {
        existingUser.firstName = user.firstName;
      }
      if (user.lastName) {
        existingUser.lastName = user.lastName;
      }
      if (user.email) {
        existingUser.email = user.email;
      }
      if (user.password) {
        existingUser.password= user.password;
      }
      
      const updatedUser = await existingUser.save();
      return updatedUser;
    } catch (err) {
      throw new Error(`Error patching user: ${err.message}`);
    }
  }
  
  async seedData() {
    const stream = fs.createReadStream('./seed-data/users.csv').pipe(csvParser());
  
    stream.on('data', async (row) => {
      // Insert each row into the MongoDB collection
      await this.userModel.insertMany({
        firstName: row.firstname,
        lastName: row.lastname,
        username: row.username,
        password: row.password,
        email: row.email,
      });
    });
  
    stream.on('end', () => {
      console.log('Data seeded successfully');
    });
  }
}