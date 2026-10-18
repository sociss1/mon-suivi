// Serveur IA de Mon Suivi (Cloudflare Worker).
// Reçoit le suivi depuis l'application et renvoie l'avis de l'IA.
// - Si la variable secrète ANTHROPIC_API_KEY existe : utilise Claude.
// - Sinon : utilise Workers AI (gratuit, il faut ajouter le binding "AI").
const MODELE_CLAUDE = 'claude-haiku-5-5';
const MODELE_CF = '@cf/meta/llama-3.1-8b-instruct';

export default {
  async fetch(req, env) {
    const permis = env.ALLOWED_ORIGIN || 'https://sociss1.github.io';
    const cors = {
      'Access-Control-Allow-Origin': permis,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin',
    };
    const rep = (obj, status = 200) =>
      new Response(JSON.stringify(obj), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (req.method !== 'POST' || req.headers.get('Origin') !== permis) return rep({ error: 'interdit' }, 403);

    let prompt;
    try { ({ prompt } = await req.json()); } catch { return rep({ error: 'requete invalide' }, 400); }
    if (typeof prompt !== 'string' || prompt.length < 20 || prompt.length > 8000) return rep({ error: 'requete invalide' }, 400);

    let texte = '';
    try {
      if (env.ANTHROPIC_API_KEY) {
        const r = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            model: env.MODELE || MODELE_CLAUDE,
            max_tokens: 1200,
            messages: [{ role: 'user', content: prompt }],
          }),
        });
        if (r.status === 429) return rep({ error: 'limite' }, 429);
        if (!r.ok) return rep({ error: 'ia' }, 502);
        const j = await r.json();
        texte = (j.content || []).map((c) => c.text || '').join('');
      } else if (env.AI) {
        const j = await env.AI.run(MODELE_CF, { messages: [{ role: 'user', content: prompt }], max_tokens: 1200 });
        texte = j.response || '';
      } else {
        return rep({ error: 'non configure' }, 500);
      }
    } catch (e) {
      return rep({ error: 'ia' }, 502);
    }

    const a = texte.indexOf('{'), b = texte.lastIndexOf('}');
    if (a < 0 || b <= a) return rep({ error: 'reponse incomplete' }, 502);
    try { return rep({ out: JSON.parse(texte.slice(a, b + 1)) }); }
    catch { return rep({ error: 'reponse incomplete' }, 502); }
  },
};
