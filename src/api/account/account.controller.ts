import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('account')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createAccountDto: CreateAccountDto , @Req() req:any) {
    const user_id = req?.user?.sub;
    return this.accountService.create(createAccountDto , user_id);
  }

 

  @Get('my-accounts')
  @UseGuards(JwtAuthGuard)
  async getMyAccounts(@Req() req: any) {
    return this.accountService.getMyAccounts(req.user.sub);
  }

  @Get()
  findAll() {
    return this.accountService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @Req() req: any) {
    const user_id = req?.user.sub;
    return this.accountService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountDto: UpdateAccountDto) {
    return this.accountService.update(+id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountService.remove(+id);
  }
}
