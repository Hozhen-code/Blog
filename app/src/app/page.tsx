export default function Page() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Next.js on App Runner (v2)</h1>
      <p>이 화면이 보이면 로컬/도커/App Runner 파이프라인이 준비된 거예요.</p>
      <p><a href="/api/health">/api/health</a> 헬스체크도 확인해보세요.</p>
    </main>
  );
}
