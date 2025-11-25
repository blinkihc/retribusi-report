---
description: Git Workflow - Best practices untuk version control dengan Git
---

# Git Workflow

Workflow ini menjelaskan best practices untuk bekerja dengan Git dalam project ini.

## 1. Sebelum Mulai Bekerja

Selalu pull perubahan terbaru dari remote repository:

```bash
git pull origin main
```

Atau jika menggunakan branch lain:

```bash
git pull origin <nama-branch>
```

## 2. Membuat Branch Baru

Untuk fitur baru atau bug fix, buat branch baru:

```bash
git checkout -b feature/<nama-fitur>
```

Atau untuk bug fix:

```bash
git checkout -b fix/<nama-bug>
```

Contoh penamaan branch:
- `feature/add-payment-report`
- `fix/calculation-error`
- `refactor/optimize-queries`

## 3. Melakukan Perubahan

### Cek Status File

```bash
git status
```

### Stage Perubahan

Stage file tertentu:

```bash
git add <nama-file>
```

Stage semua perubahan:

```bash
git add .
```

### Commit Perubahan

Gunakan commit message yang jelas dan deskriptif:

```bash
git commit -m "feat: add payment report feature"
```

Format commit message yang disarankan:
- `feat:` untuk fitur baru
- `fix:` untuk bug fix
- `refactor:` untuk refactoring code
- `docs:` untuk perubahan dokumentasi
- `style:` untuk perubahan formatting
- `test:` untuk menambah atau update tests
- `chore:` untuk maintenance tasks

## 4. Push ke Remote

Push branch ke remote repository:

```bash
git push origin <nama-branch>
```

Jika pertama kali push branch baru:

```bash
git push -u origin <nama-branch>
```

## 5. Membuat Pull Request

1. Buka repository di GitHub/GitLab
2. Klik "New Pull Request" atau "Create Merge Request"
3. Pilih branch yang ingin di-merge
4. Isi deskripsi PR dengan detail perubahan
5. Request review dari team member
6. Tunggu approval dan merge

## 6. Update Branch dengan Main

Jika main branch sudah ada update baru sementara kamu masih bekerja di branch:

```bash
git checkout main
git pull origin main
git checkout <nama-branch-kamu>
git merge main
```

Atau menggunakan rebase (lebih clean history):

```bash
git checkout <nama-branch-kamu>
git rebase main
```

## 7. Mengatasi Konflik

Jika terjadi konflik saat merge/rebase:

1. Buka file yang konflik
2. Cari marker konflik (`<<<<<<<`, `=======`, `>>>>>>>`)
3. Pilih perubahan yang ingin dipertahankan
4. Hapus marker konflik
5. Stage file yang sudah diperbaiki:
   ```bash
   git add <file-yang-konflik>
   ```
6. Lanjutkan merge/rebase:
   ```bash
   git merge --continue
   ```
   atau
   ```bash
   git rebase --continue
   ```

## 8. Membatalkan Perubahan

### Unstage file (sebelum commit)

```bash
git reset HEAD <nama-file>
```

### Buang perubahan di working directory

```bash
git checkout -- <nama-file>
```

### Undo commit terakhir (keep changes)

```bash
git reset --soft HEAD~1
```

### Undo commit terakhir (discard changes)

```bash
git reset --hard HEAD~1
```

## 9. Melihat History

Lihat commit history:

```bash
git log
```

Lihat history dengan format compact:

```bash
git log --oneline --graph --all
```

## 10. Stash Changes

Simpan perubahan sementara tanpa commit:

```bash
git stash
```

Lihat daftar stash:

```bash
git stash list
```

Apply stash terakhir:

```bash
git stash pop
```

Apply stash tertentu:

```bash
git stash apply stash@{n}
```

## Best Practices

1. **Commit Often**: Commit perubahan kecil secara berkala
2. **Clear Messages**: Gunakan commit message yang jelas dan deskriptif
3. **Pull Before Push**: Selalu pull sebelum push untuk menghindari konflik
4. **Branch Strategy**: Gunakan branch untuk setiap fitur atau bug fix
5. **Review Code**: Selalu review code sebelum merge
6. **Test Before Commit**: Pastikan code berjalan dengan baik sebelum commit
7. **Keep Main Clean**: Jangan commit langsung ke main branch
8. **Sync Regularly**: Sync branch dengan main secara berkala

## Troubleshooting

### Lupa nama branch

```bash
git branch -a
```

### Lihat perubahan sebelum commit

```bash
git diff
```

### Lihat perubahan yang sudah di-stage

```bash
git diff --staged
```

### Hapus branch lokal

```bash
git branch -d <nama-branch>
```

### Hapus branch remote

```bash
git push origin --delete <nama-branch>
```
