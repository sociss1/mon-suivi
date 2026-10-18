# Serveur IA de Mon Suivi

Ce petit serveur permet à l'application d'afficher l'avis de l'IA directement, sans ouvrir Claude.
Il est gratuit à héberger sur Cloudflare.

## Mise en place (5 minutes)

1. Crée un compte gratuit sur https://dash.cloudflare.com
2. Menu **Workers & Pages** > **Create** > **Hello World** > nomme-le `mon-suivi-ia` > **Deploy**.
3. Clique sur **Edit code**, efface tout, colle le contenu de `worker.js`, puis **Deploy**.
4. Choisis l'IA :
   - **Gratuit** : **Settings** > **Bindings** > **Add** > **Workers AI**, nom de variable `AI`.
   - **Claude (meilleur, payant)** : **Settings** > **Variables and Secrets** > ajoute le secret `ANTHROPIC_API_KEY` (clé créée sur console.anthropic.com).
5. Copie l'adresse du serveur (elle finit par `.workers.dev`).
6. Dans l'application : onglet **Coach** > colle l'adresse dans « Serveur IA » > **Enregistrer**.

Seul le site `https://sociss1.github.io` peut appeler ce serveur.
