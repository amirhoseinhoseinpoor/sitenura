-- CreateEnum
CREATE TYPE "LlmCallStatus" AS ENUM ('SUCCEEDED', 'FAILED');

-- CreateTable
CREATE TABLE "llm_calls" (
    "id" UUID NOT NULL,
    "provider" "PlannerProvider" NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "purpose" VARCHAR(40) NOT NULL,
    "status" "LlmCallStatus" NOT NULL,
    "attempts" INTEGER NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "input_tokens" INTEGER,
    "output_tokens" INTEGER,
    "error_kind" VARCHAR(40),
    "project_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "llm_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "llm_calls_project_id_idx" ON "llm_calls"("project_id");

-- CreateIndex
CREATE INDEX "llm_calls_created_at_idx" ON "llm_calls"("created_at");

-- AddForeignKey
ALTER TABLE "llm_calls" ADD CONSTRAINT "llm_calls_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
