import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/graphql', () => {
    describe('Login', () => {
      it('should login successfully with valid credentials', async () => {
        const loginMutation = `
          mutation {
            login(loginInput: {
              email: "admin@example.com"
              password: "admin123"
            }) {
              accessToken
              user {
                id
                email
                name
                role
                isActive
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: loginMutation })
          .expect(200);

        expect(response.body.data.login).toBeDefined();
        expect(response.body.data.login.accessToken).toBeDefined();
        expect(response.body.data.login.user.email).toBe('admin@example.com');
        expect(response.body.data.login.user.role).toBe('ADMIN');
        expect(response.body.data.login.user.isActive).toBe(true);
      });

      it('should fail login with invalid credentials', async () => {
        const loginMutation = `
          mutation {
            login(loginInput: {
              email: "admin@example.com"
              password: "wrongpassword"
            }) {
              accessToken
              user {
                id
                email
                name
                role
                isActive
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: loginMutation })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Invalid credentials');
      });
    });

    describe('Register', () => {
      it('should register successfully with valid data', async () => {
        const registerMutation = `
          mutation {
            register(registerInput: {
              email: "newuser@example.com"
              password: "password123"
              name: "New User"
              universityId: "10001"
            }) {
              accessToken
              user {
                id
                email
                name
                role
                universityId
                isActive
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: registerMutation })
          .expect(200);

        expect(response.body.data.register).toBeDefined();
        expect(response.body.data.register.accessToken).toBeDefined();
        expect(response.body.data.register.user.email).toBe('newuser@example.com');
        expect(response.body.data.register.user.role).toBe('STUDENT');
        expect(response.body.data.register.user.universityId).toBe('10001');
        expect(response.body.data.register.user.isActive).toBe(true);
      });

      it('should fail register with existing email', async () => {
        const registerMutation = `
          mutation {
            register(registerInput: {
              email: "admin@example.com"
              password: "password123"
              name: "Duplicate User"
              universityId: "10002"
            }) {
              accessToken
              user {
                id
                email
                name
                role
                universityId
                isActive
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: registerMutation })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('User with this email already exists');
      });

      it('should fail register with invalid university ID', async () => {
        const registerMutation = `
          mutation {
            register(registerInput: {
              email: "invalid@example.com"
              password: "password123"
              name: "Invalid User"
              universityId: "99999"
            }) {
              accessToken
              user {
                id
                email
                name
                role
                universityId
                isActive
              }
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: registerMutation })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('University ID not found');
      });
    });

    describe('Me Query', () => {
      let accessToken: string;

      beforeAll(async () => {
        // Get access token for authenticated requests
        const loginMutation = `
          mutation {
            login(loginInput: {
              email: "admin@example.com"
              password: "admin123"
            }) {
              accessToken
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: loginMutation });

        accessToken = response.body.data.login.accessToken;
      });

      it('should return current user when authenticated', async () => {
        const meQuery = `
          query {
            me {
              id
              email
              name
              role
              isActive
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .set('Authorization', `Bearer ${accessToken}`)
          .send({ query: meQuery })
          .expect(200);

        expect(response.body.data.me).toBeDefined();
        expect(response.body.data.me.email).toBe('admin@example.com');
        expect(response.body.data.me.role).toBe('ADMIN');
        expect(response.body.data.me.isActive).toBe(true);
      });

      it('should fail when not authenticated', async () => {
        const meQuery = `
          query {
            me {
              id
              email
              name
              role
              isActive
            }
          }
        `;

        const response = await request(app.getHttpServer())
          .post('/graphql')
          .send({ query: meQuery })
          .expect(200);

        expect(response.body.errors).toBeDefined();
        expect(response.body.errors[0].message).toContain('Unauthorized');
      });
    });
  });
}); 