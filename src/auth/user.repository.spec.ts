import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { User } from "./user.entity";
import { UserRepository } from "./user.repository";
import * as bcrypt from 'bcrypt';
import { mocked } from "ts-jest/utils";

const mockCredentialsDto = { username: 'TestUsername', password: 'TestPassword' };

describe('UserRepository', () => {
  let userRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UserRepository,
      ],
    }).compile();

    userRepository = await module.get<UserRepository>(UserRepository);
  })

  describe('signUp', () => {
    let save;

    beforeEach(() => {
      save = jest.fn();
      userRepository.create = jest.fn().mockReturnValue({ save })
    })

    it('successfully signs up the user', async () => {
      save.mockResolvedValue(undefined);
      await expect(userRepository.signUp(mockCredentialsDto)).resolves.not.toThrow();
    });

    it('throws a confilc exception as username already exists', async () => {
      save.mockRejectedValue({code: '23505'});
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(ConflictException);
    })

    it('throws a internal server error exception', async () => {
      save.mockRejectedValue({code: '0'}); 
      await expect(userRepository.signUp(mockCredentialsDto)).rejects.toThrow(InternalServerErrorException);
    })
  })

  describe('validateUserPassword', () => {
    let user;

    beforeEach(() => {
      userRepository.findOne = jest.fn();
      user = new User();
      user.username = 'TestUsername',
      user.validatePassword = jest.fn();
    })

    it('returns the username as validation is successful', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(true);

      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(result).toEqual(user.username);
    })

    it('returns null as user cannot be found', async () => {
      userRepository.findOne.mockResolvedValue(null);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    })

    it('returns null as password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(user);
      user.validatePassword.mockResolvedValue(false);
      const result = await userRepository.validateUserPassword(mockCredentialsDto);
      expect(user.validatePassword).toHaveBeenCalled();
      expect(result).toEqual(null);
    })
  })

  describe('hashPassword', () => {
    it('calls bcrypt.hash to generate a hash', async () => {
      const mockBcrypt = mocked(bcrypt, true);
      mockBcrypt.hash = jest.fn().mockResolvedValue('testHash');

      expect(bcrypt.hash).not.toHaveBeenCalled();
      const result = await userRepository.hashPassword('testPassword', 'testSalt');
      expect(bcrypt.hash).toHaveBeenCalledWith('testPassword', 'testSalt');
      expect(result).toEqual('testHash');
    })
  })
});