import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { CreateUserDto } from './users/dto/create-user.dto';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);

  const users = [
    {
      name: 'Admin Principal',
      email: 'admin@ucb.edu.bo',
      password: 'Admin123',
      role: 'admin',
    },
    {
      name: 'Jose Jesus Cabrera',
      email: 'coord.software@ucb.edu.bo',
      password: 'Coord123',
      role: 'coordinator',
      career: 'Ingeniería de Sistemas',
    },
    {
      name: 'Coordinador Marketing',
      email: 'coord.marketing@ucb.edu.bo',
      password: 'Coord123',
      role: 'coordinator',
      career: 'Marketing',
    },
    {
      name: 'TechCorp Bolivia',
      email: 'empleador@techcorp.bo',
      password: 'Emp123',
      role: 'employer',
    },
    {
      name: 'Matias Palacios',
      email: 'matias.palacios@estudiante.ucb.bo',
      password: 'Est123',
      role: 'student',
    },
    {
      name: 'Jonathan Lopez',
      email: 'jonathan.lopez@estudiante.ucb.bo',
      password: 'Est123',
      role: 'student',
    },
  ];

  console.log('🌱 Iniciando seed de usuarios...\n');

  for (const userData of users) {
    try {
      const existing = await usersService
        .findByEmail(userData.email)
        .catch(() => null);
      if (existing) {
        console.log(`  Ya existe: ${userData.email}`);
        continue;
      }
      await usersService.create(userData as CreateUserDto);
      console.log(`Creado [${userData.role}]: ${userData.email}`);
    } catch (err) {
      console.error(`Error creando ${userData.email}:`, (err as Error).message);
    }
  }

  console.log('\n Seed completado.');
  console.log('\n Credenciales de acceso:');
  console.log('──────────────────────────────────────────────');
  for (const u of users) {
    console.log(
      `  [${u.role.toUpperCase().padEnd(11)}] ${u.email.padEnd(35)} | ${u.password}`,
    );
  }
  console.log('──────────────────────────────────────────────');

  await app.close();
}

seed().catch((err) => {
  console.error('Error en seed:', err);
  process.exit(1);
});
