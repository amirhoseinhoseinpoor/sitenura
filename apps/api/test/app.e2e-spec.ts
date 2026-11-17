import { INestApplication, VersioningType } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types.js';
import { AppModule } from '../src/app.module.js';

// Requires a running database: `pnpm db:up && pnpm db:migrate`
describe('API (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    await app.init();
  });

  it('GET /api/v1/health reports the database as up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
  });

  it('GET /api/v1/llm/providers lists planners without exposing keys', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/llm/providers').expect(200);
    expect(res.body.map((p: { id: string }) => p.id)).toEqual(['OPENAI', 'GEMINI', 'ANTHROPIC']);
    expect(JSON.stringify(res.body)).not.toMatch(/key/i);
  });

  it('POST /api/v1/projects rejects invalid payloads', async () => {
    await request(app.getHttpServer()).post('/api/v1/projects').send({ name: 'x' }).expect(400);
  });

  describe('BASIC wizard', () => {
    let projectId: string;

    beforeAll(async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/projects')
        .send({ name: 'Untitled website', mode: 'BASIC' })
        .expect(201);
      projectId = res.body.id;
      expect(res.body.requirements).toEqual({});
      expect(res.body.wizardStep).toBeNull();
    });

    it('saves a step, merges answers and renames the project', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/requirements`)
        .send({
          requirements: { businessName: 'Blue Bean Cafe', description: 'A cozy coffee shop.' },
          wizardStep: 'siteType',
        })
        .expect(200);

      const res = await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/requirements`)
        .send({ requirements: { siteType: 'restaurant' }, wizardStep: 'pages' })
        .expect(200);

      expect(res.body).toMatchObject({
        name: 'Blue Bean Cafe',
        wizardStep: 'pages',
        requirements: {
          businessName: 'Blue Bean Cafe',
          description: 'A cozy coffee shop.',
          siteType: 'restaurant',
        },
      });
    });

    it('rejects answers that are not in the catalog', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${projectId}/requirements`)
        .send({ requirements: { palette: 'not-a-palette' }, wizardStep: 'typography' })
        .expect(400);
    });

    it('returns 404 for unknown projects', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/projects/${crypto.randomUUID()}/requirements`)
        .send({ requirements: {}, wizardStep: 'details' })
        .expect(404);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
