const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

type ApiState = 'ok' | 'offline';

async function getApiState(): Promise<ApiState> {
  try {
    const res = await fetch(`${API}/health`, { cache: 'no-store' });
    return res.ok ? 'ok' : 'offline';
  } catch {
    return 'offline';
  }
}

export default async function Page() {
  const state = await getApiState();

  return (
    <div className="container">
      <h1>AuthKit</h1>
      <p>
        Auth em NestJS: argon2id, JWT de acesso curto, refresh rotativo com detecção de reuso,
        RBAC e rate limit. Swagger em <code>/docs</code>.
      </p>

      <div className="card">
        <h2>API</h2>
        <code>{API}</code>
        <div style={{ opacity: 0.8, marginTop: 6 }}>
          {state === 'ok' ? 'respondendo' : 'offline — suba a API com ./dev.sh'}
        </div>
      </div>

      <h2 style={{ marginTop: 18 }}>Rotas</h2>
      <div className="grid">
        <div className="card">
          <b>Públicas</b>
          <div style={{ opacity: 0.8 }}>
            <code>POST /auth/register</code>, <code>POST /auth/login</code>,{' '}
            <code>POST /auth/refresh</code>, <code>POST /auth/logout</code>
          </div>
        </div>
        <div className="card">
          <b>Autenticadas</b>
          <div style={{ opacity: 0.8 }}>
            <code>GET /auth/me</code>
          </div>
        </div>
        <div className="card">
          <b>Só ADMIN</b>
          <div style={{ opacity: 0.8 }}>
            <code>GET /users</code>, <code>POST /users</code>
          </div>
        </div>
      </div>

      {/* A listagem de usuários que ficava aqui buscava /users sem token. Agora
          essa rota é restrita a ADMIN, então a página mostrava uma lista vazia
          como se o banco estivesse vazio, em vez de dizer que faltava permissão.
          Para exercitar as rotas com um token de verdade, use o Swagger. */}
      <p style={{ marginTop: 18, opacity: 0.8 }}>
        Para testar com um token, abra{' '}
        <a href={`${API}/docs`} target="_blank" rel="noopener noreferrer">
          <code>/docs</code>
        </a>
        , registre uma conta e use o botão <b>Authorize</b>.
      </p>
    </div>
  );
}
