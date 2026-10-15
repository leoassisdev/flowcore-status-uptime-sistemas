# Página de status e uptime

> Uptime de 90 dias por serviço com detalhe diário, incidentes e latência p50/p95. Transparência para o cliente e alerta para o time técnico.

**Ver ao vivo, com preview e manual:** https://flowcoresolucoes.com.br/codigos/status-uptime-sistemas

Criado por **FlowCore Soluções LTDA**.

## Arquivos

- [`src/DashUptime.tsx`](src/DashUptime.tsx)

## Como instalar

1. **Tenha um projeto React com Tailwind** Já tem (Vite, Next.js, Remix)? Pule este passo. Se não, crie um em 1 minuto e adicione ./src/**/*.{ts,tsx} ao content do tailwind.config.

   ```bash
   npm create vite@latest minha-app -- --template react-ts
   cd minha-app
   npm install -D tailwindcss@3 postcss autoprefixer
   npx tailwindcss init -p
   ```

2. **Crie o arquivo src/components/DashUptime.tsx** Copie o conteúdo de `src/DashUptime.tsx` deste repositório. Ele é um arquivo só, sem dependência além de React.
3. **Use na sua página**

   ```tsx
   import DashUptime from "./components/DashUptime";
   
   <DashUptime accent="#0057FF" />
   ```

4. **Personalize** Textos, dados e a cor de destaque (prop accent) são props com valor padrão. Troque pelos da sua marca ou ligue na sua API.

## Tema e cor

Abre em tema claro. Use `tema="escuro"` para o escuro e `accent` para a cor de destaque:

```tsx
<DashUptime accent="#0057FF" />
```

## Licença

MIT. Pode usar em projeto pessoal ou comercial, de graça. A única condição é manter a linha **“Criado por FlowCore Soluções LTDA”** (ou o crédito de adaptação) onde ela está.

---

Precisa disso integrado no seu sistema? A [FlowCore](https://flowcoresolucoes.com.br) desenvolve sob medida.
