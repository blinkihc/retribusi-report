CREATE TYPE "public"."audit_action" AS ENUM('create', 'update', 'delete', 'login', 'logout', 'export');--> statement-breakpoint
CREATE TYPE "public"."laporan_status" AS ENUM('draft', 'submitted', 'verified', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'operator');--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" "audit_action" NOT NULL,
	"table_name" varchar(50),
	"record_id" integer,
	"old_values" text,
	"new_values" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jenis_retribusi" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" varchar(20) NOT NULL,
	"nama" varchar(200) NOT NULL,
	"kategori" varchar(100),
	"deskripsi" text,
	"dasar_hukum" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "jenis_retribusi_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "laporan_retribusi" (
	"id" serial PRIMARY KEY NOT NULL,
	"nomor_laporan" varchar(50) NOT NULL,
	"opd_id" integer NOT NULL,
	"jenis_retribusi_id" integer NOT NULL,
	"tanggal_setor" timestamp NOT NULL,
	"nominal" numeric(15, 2) NOT NULL,
	"keterangan" text,
	"file_bukti" varchar(255),
	"status" "laporan_status" DEFAULT 'draft' NOT NULL,
	"submitted_by" integer NOT NULL,
	"submitted_at" timestamp,
	"verified_by" integer,
	"verified_at" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "laporan_retribusi_nomor_laporan_unique" UNIQUE("nomor_laporan")
);
--> statement-breakpoint
CREATE TABLE "opd" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode" varchar(20) NOT NULL,
	"nama" varchar(200) NOT NULL,
	"alamat" text,
	"telepon" varchar(20),
	"email" varchar(100),
	"kepala" varchar(100),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "opd_kode_unique" UNIQUE("kode")
);
--> statement-breakpoint
CREATE TABLE "target_retribusi" (
	"id" serial PRIMARY KEY NOT NULL,
	"opd_id" integer NOT NULL,
	"jenis_retribusi_id" integer NOT NULL,
	"tahun" integer NOT NULL,
	"bulan" integer NOT NULL,
	"target_nominal" numeric(15, 2) NOT NULL,
	"realisasi_nominal" numeric(15, 2) DEFAULT '0' NOT NULL,
	"persentase" numeric(5, 2) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(255) NOT NULL,
	"full_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'operator' NOT NULL,
	"opd_id" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_login" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "audit_log" ADD CONSTRAINT "audit_log_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan_retribusi" ADD CONSTRAINT "laporan_retribusi_opd_id_opd_id_fk" FOREIGN KEY ("opd_id") REFERENCES "public"."opd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan_retribusi" ADD CONSTRAINT "laporan_retribusi_jenis_retribusi_id_jenis_retribusi_id_fk" FOREIGN KEY ("jenis_retribusi_id") REFERENCES "public"."jenis_retribusi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan_retribusi" ADD CONSTRAINT "laporan_retribusi_submitted_by_users_id_fk" FOREIGN KEY ("submitted_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan_retribusi" ADD CONSTRAINT "laporan_retribusi_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_retribusi" ADD CONSTRAINT "target_retribusi_opd_id_opd_id_fk" FOREIGN KEY ("opd_id") REFERENCES "public"."opd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "target_retribusi" ADD CONSTRAINT "target_retribusi_jenis_retribusi_id_jenis_retribusi_id_fk" FOREIGN KEY ("jenis_retribusi_id") REFERENCES "public"."jenis_retribusi"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_opd_id_opd_id_fk" FOREIGN KEY ("opd_id") REFERENCES "public"."opd"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_user_idx" ON "audit_log" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "audit_action_idx" ON "audit_log" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_table_idx" ON "audit_log" USING btree ("table_name");--> statement-breakpoint
CREATE INDEX "audit_created_at_idx" ON "audit_log" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "jenis_retribusi_kode_idx" ON "jenis_retribusi" USING btree ("kode");--> statement-breakpoint
CREATE INDEX "jenis_retribusi_nama_idx" ON "jenis_retribusi" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "jenis_retribusi_kategori_idx" ON "jenis_retribusi" USING btree ("kategori");--> statement-breakpoint
CREATE INDEX "laporan_nomor_idx" ON "laporan_retribusi" USING btree ("nomor_laporan");--> statement-breakpoint
CREATE INDEX "laporan_opd_idx" ON "laporan_retribusi" USING btree ("opd_id");--> statement-breakpoint
CREATE INDEX "laporan_jenis_idx" ON "laporan_retribusi" USING btree ("jenis_retribusi_id");--> statement-breakpoint
CREATE INDEX "laporan_status_idx" ON "laporan_retribusi" USING btree ("status");--> statement-breakpoint
CREATE INDEX "laporan_tanggal_setor_idx" ON "laporan_retribusi" USING btree ("tanggal_setor");--> statement-breakpoint
CREATE INDEX "laporan_submitted_by_idx" ON "laporan_retribusi" USING btree ("submitted_by");--> statement-breakpoint
CREATE INDEX "opd_kode_idx" ON "opd" USING btree ("kode");--> statement-breakpoint
CREATE INDEX "opd_nama_idx" ON "opd" USING btree ("nama");--> statement-breakpoint
CREATE INDEX "target_opd_idx" ON "target_retribusi" USING btree ("opd_id");--> statement-breakpoint
CREATE INDEX "target_jenis_idx" ON "target_retribusi" USING btree ("jenis_retribusi_id");--> statement-breakpoint
CREATE INDEX "target_tahun_bulan_idx" ON "target_retribusi" USING btree ("tahun","bulan");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_opd_idx" ON "users" USING btree ("opd_id");