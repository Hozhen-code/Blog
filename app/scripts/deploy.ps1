# scripts/deploy.ps1
# 빌드 → S3 동기화 → CloudFront 캐시 무효화

param(
  [string]$Bucket = "yourblog-static-hojin",           # S3 버킷 이름
  [string]$DistributionId = "E34H6ICYW429OS",          # CloudFront 배포 ID
  [string]$Paths = "/*"                                # 무효화 경로 (기본: 전체)
)

$ErrorActionPreference = "Stop"

# 스크립트 위치 기준으로 프로젝트 루트 계산
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $ProjectRoot

Write-Host "==> Project root: $ProjectRoot"

# 0) AWS CLI 로그인/권한 확인
try {
  aws sts get-caller-identity | Out-Null
} catch {
  Write-Error "AWS CLI 자격 증명이 설정되지 않았습니다. 'aws configure' 먼저 실행해 주세요."
  exit 1
}

# 1) 정적 빌드 (Next 15 + output:'export' => next build만으로 out/ 생성)
Write-Host "==> 1) next build (output: export)"
$env:NODE_ENV = "production"
npm.cmd run build:static
if ($LASTEXITCODE -ne 0) { throw "Build failed with exit code $LASTEXITCODE" }

# out/ 확인
$OutDir = Join-Path $ProjectRoot "out"
if (-not (Test-Path $OutDir)) {
  throw "out/ 폴더가 없습니다. next.config.ts에 output: 'export'가 설정되었는지 확인하세요."
}

# 2) S3 업로드
#    2-1) 일반 파일(HTML/JSON/이미지 등) 동기화 — 삭제된 파일도 제거
Write-Host "==> 2) S3 sync (general)"
aws s3 sync $OutDir "s3://$Bucket/" --delete --exclude "_next/static/*"

#    2-2) 해시된 정적 자산(_next/static)은 강한 캐시 적용
Write-Host "==> 2-1) S3 sync (hashed assets, long cache)"
aws s3 sync $OutDir "s3://$Bucket/" `
  --exclude "*" --include "_next/static/*" `
  --cache-control "public,max-age=31536000,immutable"

#    2-3) HTML은 짧은 캐시(빠른 반영)
Write-Host "==> 2-2) S3 sync (HTML short cache)"
aws s3 sync $OutDir "s3://$Bucket/" `
  --exclude "*" --include "*.html" `
  --cache-control "public,max-age=60"

# 3) CloudFront 캐시 무효화
Write-Host "==> 3) CloudFront invalidation ($Paths)"
aws cloudfront create-invalidation --distribution-id $DistributionId --paths $Paths | Out-Host

# 완료
Pop-Location
Write-Host "==> Done. 배포가 완료되었습니다."
