# Ocultar a infraestrutura

Esconder a tecnologia **não** substitui segurança: o que protege o site é manter Next, React e Node
atualizados, o CSP e o fato de ele ser estático (sem API, cookies, formulários ou banco). Mesmo assim,
dá para reduzir o que ele entrega de graça a quem faz varredura.

## O que o código já faz

- Sem `X-Powered-By` e sem source maps no navegador.
- Endpoint `/_next/image` desligado (`images.unoptimized`).
- Páginas de erro próprias (`app/global-not-found.tsx`, `app/global-error.tsx`, `app/[locale]/error.tsx`),
  no lugar das mensagens padrão do framework.
- Ícones servidos de `public/` com URL simples, sem a querystring com hash que o framework gera.
- Cabeçalhos de segurança em `next.config.ts`: CSP, HSTS, `nosniff`, `frame-ancestors 'none'`,
  `Referrer-Policy`, `Permissions-Policy` e COOP.
- Endereços inválidos respondem 404 de verdade (ver `proxy.ts`), sem expor o roteador.

## O que o código não consegue esconder

| Sinal | Por quê |
| --- | --- |
| `Server: Vercel`, `X-Vercel-Id`, `X-Vercel-Cache`, `X-Matched-Path` | A borda da Vercel adiciona depois do app; não há como remover pela configuração do projeto. |
| IPs, `cname.vercel-dns.com`, certificado | Aparecem em DNS e em Certificate Transparency. |
| `/_next/…`, `self.__next_f`, `Vary: RSC, Next-Router-*`, `x-nextjs-*` | Fazem parte de como o App Router funciona. |

## Como reduzir de verdade (infraestrutura)

1. **Cloudflare (ou outro CDN/WAF) na frente do domínio**, com proxy ligado e SSL em *Full (strict)*.
   Em *Rules → Transform Rules → Modify Response Header*, remova em todas as respostas:
   `x-vercel-id`, `x-vercel-cache`, `x-matched-path`, `x-nextjs-cache`, `x-nextjs-prerender`,
   `x-nextjs-stale-time`, `x-nextjs-matched-path`, `x-vercel-*` e `server` (a Cloudflare põe o dela).
2. **Fechar a origem.** Na Vercel, em *Firewall → Custom Rules*, bloqueie toda requisição cujo `Host`
   não seja `libertad.lat` nem `www.libertad.lat` (o `www` só redireciona, mas precisa chegar até lá). Isso
   impede o acesso por `projeto.vercel.app`. Para ir além, faça a Cloudflare enviar um cabeçalho secreto
   (*Modify Request Header*) e bloqueie na Vercel o que vier sem ele.
3. **Domínio.** Use só o domínio próprio nos links e nos metadados (já é o que o código faz, via
   `NEXT_PUBLIC_SITE_URL`).
4. **Renomear `/_next/`** só é possível reescrevendo o HTML e os chunks num Worker. Não recomendo: um
   deslize quebra a hidratação, e o formato do payload do React continua revelando o framework.
5. **Manter tudo atualizado:** ative Dependabot/Renovate e rode `npm audit` no CI.
