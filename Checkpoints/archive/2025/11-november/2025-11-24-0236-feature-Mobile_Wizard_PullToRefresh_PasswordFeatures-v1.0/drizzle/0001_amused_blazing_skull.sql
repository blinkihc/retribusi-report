CREATE TABLE "opd_pelayanan" (
	"id" serial PRIMARY KEY NOT NULL,
	"kode_opd" varchar(20) NOT NULL,
	"nama_jenis_retribusi" varchar(200) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "opd_pelayanan_unique" UNIQUE("kode_opd","nama_jenis_retribusi")
);
--> statement-breakpoint
ALTER TABLE "opd" ADD COLUMN "nomor_laporan_format" varchar(100) DEFAULT '{nomor_urut}/{bulan_romawi}/{kode_opd}/{tahun}' NOT NULL;--> statement-breakpoint
ALTER TABLE "opd_pelayanan" ADD CONSTRAINT "opd_pelayanan_kode_opd_opd_kode_fk" FOREIGN KEY ("kode_opd") REFERENCES "public"."opd"("kode") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opd_pelayanan" ADD CONSTRAINT "opd_pelayanan_nama_jenis_retribusi_jenis_retribusi_nama_fk" FOREIGN KEY ("nama_jenis_retribusi") REFERENCES "public"."jenis_retribusi"("nama") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opd_pelayanan_kode_opd_idx" ON "opd_pelayanan" USING btree ("kode_opd");--> statement-breakpoint
CREATE INDEX "opd_pelayanan_nama_jenis_idx" ON "opd_pelayanan" USING btree ("nama_jenis_retribusi");--> statement-breakpoint
ALTER TABLE "jenis_retribusi" ADD CONSTRAINT "jenis_retribusi_nama_unique" UNIQUE("nama");