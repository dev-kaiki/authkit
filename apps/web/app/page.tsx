const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

async function getUsers() {
  try {
    const res = await fetch(`${API}/users`, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function Page() {
  const users = await getUsers();

  return (
    <div className="container">
      <h1>Fullstack Template</h1>
      <p>Next.js (web) + NestJS (api) + Postgres (Docker). Swagger em <code>/docs</code>.</p>

      <div className="card">
        <h2>API URL</h2>
        <code>{API}</code>
      </div>

      <h2 style={{ marginTop: 18 }}>Usuários (exemplo)</h2>
      <div className="grid">
        {users.length === 0 ? (
          <div className="card">Nenhum usuário ainda (ou API offline).</div>
        ) : (
          users.map((u: any) => (
            <div className="card" key={u.id}>
              <b>{u.name ?? 'Sem nome'}</b>
              <div style={{ opacity: 0.8 }}>{u.email}</div>
            </div>
          ))
        )}
      </div>

      <p style={{ marginTop: 18, opacity: 0.8 }}>
        Próximo passo: duplicar este template e construir os demos (Auth, Upload, Queue, Dashboard, Realtime).
      </p>
    </div>
  );
}
