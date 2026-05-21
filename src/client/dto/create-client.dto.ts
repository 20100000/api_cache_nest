import { ApiProperty } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'João Silva', description: 'Nome completo' })
  name!: string; // Adicionado !

  @ApiProperty({ example: 'joao@email.com', description: 'E-mail único' })
  email!: string; // Adicionado !

  @ApiProperty({ example: '11999999999', description: 'Telefone', required: false })
  phone?: string; 
}
