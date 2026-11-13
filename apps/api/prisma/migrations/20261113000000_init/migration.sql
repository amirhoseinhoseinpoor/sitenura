-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "InteractionMode" AS ENUM ('BASIC', 'ADVANCED');

-- CreateEnum
CREATE TYPE "PlannerProvider" AS ENUM ('OPENAI', 'GEMINI', 'ANTHROPIC');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'PLANNING', 'EXECUTING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PromptChunkStatus" AS ENUM ('PENDING', 'PLANNED', 'EXECUTING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "projects" (
    "id" UUID NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "mode" "InteractionMode" NOT NULL,
    "planner_provider" "PlannerProvider" NOT NULL DEFAULT 'OPENAI',
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "requirements" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_chunks" (
    "id" UUID NOT NULL,
    "project_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "status" "PromptChunkStatus" NOT NULL DEFAULT 'PENDING',
    "user_intent" TEXT NOT NULL,
    "planned_prompt" TEXT,
    "executor_output" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_chunks_project_id_order_key" ON "prompt_chunks"("project_id", "order");

-- AddForeignKey
ALTER TABLE "prompt_chunks" ADD CONSTRAINT "prompt_chunks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
