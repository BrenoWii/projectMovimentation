import { Controller, Get, Param, Post, Body, UseGuards, Request, Query, Patch } from '@nestjs/common';
import { Movimentation } from './movimentation.entity';
import { JwtAuthGuard } from '../auth/jwt-guard';
import { MovimentationsService } from './movimentations.service';
import { CreateMovimentationDto, FindMovimentationsDto, UpdateMovimentationDto } from './dto'

@UseGuards(JwtAuthGuard)
@Controller('api/movimentations')
export class MovimentationsController {
    constructor (private readonly movimentationService:MovimentationsService) {}

   
    @Get()
    getAllMovimentations(@Request() request, @Query() query: FindMovimentationsDto): Promise<Movimentation[]> {
        return this.movimentationService.getAllMovimentations(query, request.user.id)
    }

    @Get(':id')
    getMovimentationById(@Request() request, @Param('id') id): Promise<Movimentation> {
        return this.movimentationService.getMovimentationById(id, request.user.id)
    }

    @Post()
    async create(@Request() request, @Body() createMovimentationDto: CreateMovimentationDto) {
        createMovimentationDto.user = request.user.id
        return this.movimentationService.create(createMovimentationDto);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateMovimentationDto) {
        return this.movimentationService.update(Number(id), dto);
    }
}
