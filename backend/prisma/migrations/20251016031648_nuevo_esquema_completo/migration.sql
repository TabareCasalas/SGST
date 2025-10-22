/*
  Warnings:

  - The primary key for the `tramites` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `applicant` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `tramites` table. All the data in the column will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `id_consultante` to the `tramites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id_grupo` to the `tramites` table without a default value. This is not possible if the table is not empty.
  - Added the required column `num_carpeta` to the `tramites` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_tramiteId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tramites" DROP CONSTRAINT "tramites_userId_fkey";

-- AlterTable
ALTER TABLE "public"."tramites" DROP CONSTRAINT "tramites_pkey",
DROP COLUMN "applicant",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "id",
DROP COLUMN "priority",
DROP COLUMN "status",
DROP COLUMN "title",
DROP COLUMN "type",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "estado" TEXT NOT NULL DEFAULT 'pendiente',
ADD COLUMN     "fecha_cierre" TIMESTAMP(3),
ADD COLUMN     "fecha_inicio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "id_consultante" INTEGER NOT NULL,
ADD COLUMN     "id_grupo" INTEGER NOT NULL,
ADD COLUMN     "id_tramite" SERIAL NOT NULL,
ADD COLUMN     "motivo_cierre" TEXT,
ADD COLUMN     "num_carpeta" INTEGER NOT NULL,
ADD COLUMN     "observaciones" TEXT,
ADD CONSTRAINT "tramites_pkey" PRIMARY KEY ("id_tramite");

-- DropTable
DROP TABLE "public"."documents";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."DocumentStatus";

-- DropEnum
DROP TYPE "public"."Priority";

-- DropEnum
DROP TYPE "public"."TramiteStatus";

-- DropEnum
DROP TYPE "public"."UserRole";

-- CreateTable
CREATE TABLE "public"."usuarios" (
    "id_usuario" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT NOT NULL,
    "domicilio" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "fecha_alta" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estado" TEXT NOT NULL DEFAULT 'activo',
    "correo" TEXT NOT NULL,
    "hash_pass" TEXT NOT NULL,
    "fecha_ult_login" TIMESTAMP(3),

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id_usuario")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id_rol" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id_rol")
);

-- CreateTable
CREATE TABLE "public"."usuario_rol" (
    "id_usuario" INTEGER NOT NULL,
    "id_rol" INTEGER NOT NULL,

    CONSTRAINT "usuario_rol_pkey" PRIMARY KEY ("id_usuario","id_rol")
);

-- CreateTable
CREATE TABLE "public"."consultantes" (
    "id_consultante" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "est_civil" TEXT NOT NULL,
    "nro_padron" INTEGER NOT NULL,

    CONSTRAINT "consultantes_pkey" PRIMARY KEY ("id_consultante")
);

-- CreateTable
CREATE TABLE "public"."estudiantes" (
    "id_estudiante" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "semestre" INTEGER NOT NULL,
    "id_grupo" INTEGER NOT NULL,

    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id_estudiante")
);

-- CreateTable
CREATE TABLE "public"."docentes" (
    "id_docente" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo_docente" TEXT NOT NULL,

    CONSTRAINT "docentes_pkey" PRIMARY KEY ("id_docente")
);

-- CreateTable
CREATE TABLE "public"."administrativos" (
    "id_administrativo" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "tipo_funcionario" TEXT NOT NULL,
    "nivel" INTEGER NOT NULL,

    CONSTRAINT "administrativos_pkey" PRIMARY KEY ("id_administrativo")
);

-- CreateTable
CREATE TABLE "public"."grupos" (
    "id_grupo" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id_grupo")
);

-- CreateTable
CREATE TABLE "public"."grupo_estudiante" (
    "id_grupo" INTEGER NOT NULL,
    "id_estudiante" INTEGER NOT NULL,

    CONSTRAINT "grupo_estudiante_pkey" PRIMARY KEY ("id_grupo","id_estudiante")
);

-- CreateTable
CREATE TABLE "public"."grupo_docente" (
    "id_grupo" INTEGER NOT NULL,
    "id_docente" INTEGER NOT NULL,
    "rol_docente" TEXT NOT NULL,

    CONSTRAINT "grupo_docente_pkey" PRIMARY KEY ("id_grupo","id_docente")
);

-- CreateTable
CREATE TABLE "public"."adjuntos" (
    "id_adjunto" SERIAL NOT NULL,
    "id_tramite" INTEGER NOT NULL,
    "nombre_archivo" TEXT NOT NULL,
    "ruta" TEXT NOT NULL,

    CONSTRAINT "adjuntos_pkey" PRIMARY KEY ("id_adjunto")
);

-- CreateTable
CREATE TABLE "public"."turnos" (
    "id_turno" SERIAL NOT NULL,
    "fecha_hora" TIMESTAMP(3) NOT NULL,
    "id_admin" INTEGER NOT NULL,

    CONSTRAINT "turnos_pkey" PRIMARY KEY ("id_turno")
);

-- CreateTable
CREATE TABLE "public"."caso_turno" (
    "id_tramite" INTEGER NOT NULL,
    "id_turno" INTEGER NOT NULL,

    CONSTRAINT "caso_turno_pkey" PRIMARY KEY ("id_tramite","id_turno")
);

-- CreateTable
CREATE TABLE "public"."notificaciones" (
    "id_notificacion" SERIAL NOT NULL,
    "id_tramite" INTEGER NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha_envio" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificaciones_pkey" PRIMARY KEY ("id_notificacion")
);

-- CreateTable
CREATE TABLE "public"."usuario_notificacion" (
    "id_usuario" INTEGER NOT NULL,
    "id_notificacion" INTEGER NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'pendiente',

    CONSTRAINT "usuario_notificacion_pkey" PRIMARY KEY ("id_usuario","id_notificacion")
);

-- CreateTable
CREATE TABLE "public"."auditorias" (
    "id_auditoria" SERIAL NOT NULL,
    "id_usuario" INTEGER NOT NULL,
    "id_tramite" INTEGER,
    "accion" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id_auditoria")
);

-- CreateTable
CREATE TABLE "public"."estudiante_tramite" (
    "id_estudiante" INTEGER NOT NULL,
    "id_tramite" INTEGER NOT NULL,

    CONSTRAINT "estudiante_tramite_pkey" PRIMARY KEY ("id_estudiante","id_tramite")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_ci_key" ON "public"."usuarios"("ci");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "public"."usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "public"."roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "consultantes_id_usuario_key" ON "public"."consultantes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_id_usuario_key" ON "public"."estudiantes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "docentes_id_usuario_key" ON "public"."docentes"("id_usuario");

-- CreateIndex
CREATE UNIQUE INDEX "administrativos_id_usuario_key" ON "public"."administrativos"("id_usuario");

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_rol" ADD CONSTRAINT "usuario_rol_id_rol_fkey" FOREIGN KEY ("id_rol") REFERENCES "public"."roles"("id_rol") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."consultantes" ADD CONSTRAINT "consultantes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiantes" ADD CONSTRAINT "estudiantes_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "public"."grupos"("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."docentes" ADD CONSTRAINT "docentes_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."administrativos" ADD CONSTRAINT "administrativos_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grupo_estudiante" ADD CONSTRAINT "grupo_estudiante_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "public"."grupos"("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grupo_estudiante" ADD CONSTRAINT "grupo_estudiante_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grupo_docente" ADD CONSTRAINT "grupo_docente_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "public"."grupos"("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."grupo_docente" ADD CONSTRAINT "grupo_docente_id_docente_fkey" FOREIGN KEY ("id_docente") REFERENCES "public"."docentes"("id_docente") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tramites" ADD CONSTRAINT "tramites_id_consultante_fkey" FOREIGN KEY ("id_consultante") REFERENCES "public"."consultantes"("id_consultante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tramites" ADD CONSTRAINT "tramites_id_grupo_fkey" FOREIGN KEY ("id_grupo") REFERENCES "public"."grupos"("id_grupo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."adjuntos" ADD CONSTRAINT "adjuntos_id_tramite_fkey" FOREIGN KEY ("id_tramite") REFERENCES "public"."tramites"("id_tramite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."turnos" ADD CONSTRAINT "turnos_id_admin_fkey" FOREIGN KEY ("id_admin") REFERENCES "public"."administrativos"("id_administrativo") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caso_turno" ADD CONSTRAINT "caso_turno_id_tramite_fkey" FOREIGN KEY ("id_tramite") REFERENCES "public"."tramites"("id_tramite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."caso_turno" ADD CONSTRAINT "caso_turno_id_turno_fkey" FOREIGN KEY ("id_turno") REFERENCES "public"."turnos"("id_turno") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notificaciones" ADD CONSTRAINT "notificaciones_id_tramite_fkey" FOREIGN KEY ("id_tramite") REFERENCES "public"."tramites"("id_tramite") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_notificacion" ADD CONSTRAINT "usuario_notificacion_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."usuario_notificacion" ADD CONSTRAINT "usuario_notificacion_id_notificacion_fkey" FOREIGN KEY ("id_notificacion") REFERENCES "public"."notificaciones"("id_notificacion") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auditorias" ADD CONSTRAINT "auditorias_id_usuario_fkey" FOREIGN KEY ("id_usuario") REFERENCES "public"."usuarios"("id_usuario") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."auditorias" ADD CONSTRAINT "auditorias_id_tramite_fkey" FOREIGN KEY ("id_tramite") REFERENCES "public"."tramites"("id_tramite") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiante_tramite" ADD CONSTRAINT "estudiante_tramite_id_estudiante_fkey" FOREIGN KEY ("id_estudiante") REFERENCES "public"."estudiantes"("id_estudiante") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."estudiante_tramite" ADD CONSTRAINT "estudiante_tramite_id_tramite_fkey" FOREIGN KEY ("id_tramite") REFERENCES "public"."tramites"("id_tramite") ON DELETE CASCADE ON UPDATE CASCADE;
